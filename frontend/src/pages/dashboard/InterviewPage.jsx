import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock, ChevronRight, Sparkles, AlertCircle, CheckCircle, Volume2, Loader2, RefreshCw, Wifi, WifiOff, Info } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ScoreRing from '../../components/ui/ScoreRing';
import Skeleton from '../../components/ui/Skeleton';
import RoleCombobox from '../../components/ui/RoleCombobox';
import { useToast } from '../../context/ToastContext';
// ✅ Pakai interviewService & rolesService — token otomatis via axios interceptor
import { interviewService, rolesService, userService } from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 80) return 'text-green-600';
  if (s >= 60) return 'text-yellow-600';
  return 'text-red-500';
}
function scoreBadge(s) {
  if (s >= 85) return { label: 'Excellent', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  if (s >= 70) return { label: 'Good', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  if (s >= 55) return { label: 'Fair', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
  return { label: 'Needs Work', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' };
}
function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const PHASE = { IDLE: 'idle', LOADING_Q: 'loading_q', CALL: 'call', ANALYZING: 'analyzing', RESULT: 'result' };

export default function InterviewAIPage() {
  const { addToast } = useToast();

  // Setup
  const [role, setRole] = useState('');
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const expLevel = 'fresh graduate';
  const language = 'en';
  const [roleError, setRoleError] = useState('');
  const [backendOnline, setBackendOnline] = useState(null);

  // Session
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [audioBlobs, setAudioBlobs] = useState([]);
  const [cam, setCam] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedForCurrent, setRecordedForCurrent] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  // Refs
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const currentAudioRef = useRef(null);

  // ── Fetch roles — normalize response & field names ────────────────────────
  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      try {
        const res = await rolesService.getAllRoles();
        const raw = res?.data?.roles ?? res?.data ?? res?.roles ?? [];
        const list = Array.isArray(raw) ? raw : [];
        const normalized = list
          .map((r) => ({
            id: r.id,
            name: (r.name ?? r.job_role ?? '').trim(),
            category: (r.category ?? 'Lainnya').trim(),
          }))
          .filter((r) => r.name.length > 0); // ← buang yang name-nya kosong/undefined
        setRoles(normalized);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        addToast('Failed to load roles', 'error');
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, [addToast]);

  // ── Health check backend ──────────────────────────────────────────────────
  useEffect(() => {
    const fallbackBase = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://evalify-backend.vercel.app/api';
    const base = (import.meta.env.VITE_API_URL || fallbackBase).replace('/api', '');
    fetch(`${base}/`)
      .then((r) => setBackendOnline(r.ok))
      .catch(() => setBackendOnline(false));
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === PHASE.CALL) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(
    () => () => {
      // Abort TTS request
      if (ttsAbortRef.current && !ttsAbortRef.current.signal.aborted) {
        ttsAbortRef.current.abort();
      }

      // Stop and cleanup audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        if (currentAudioRef.current.src) {
          URL.revokeObjectURL(currentAudioRef.current.src);
        }
        currentAudioRef.current = null;
      }

      stopMicStream();
      clearInterval(timerRef.current);
    },
    [],
  );

  // ── Sync recorded status when switching question ──────────────────────────
  useEffect(() => {
    setRecordedForCurrent(!!audioBlobs[currentQIdx]);
  }, [currentQIdx, audioBlobs]);

  // ── Auto-play TTS saat pertanyaan berubah ─────────────────────────────────
  useEffect(() => {
    if (phase === PHASE.CALL && questions[currentQIdx]) {
      // Instantly play TTS tanpa delay
      autoPlayTTS(questions[currentQIdx].question);
    }
  }, [currentQIdx, phase, questions]);

  function stopMicStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  // ── isRoleValid ───────────────────────────────────────────────────────────
  const isRoleValid = roles.some((r) => (r.name ?? '').toLowerCase() === role.toLowerCase());

  // ── Generate questions via interviewService (token otomatis) ──────────────
  const handleStart = async () => {
    if (!role.trim()) {
      setRoleError('Pilih role yang diinginkan');
      return;
    }
    if (!isRoleValid) {
      setRoleError('Role harus dipilih dari daftar yang tersedia');
      addToast('Role tidak valid. Pilih dari daftar yang tersedia.', 'error');
      return;
    }
    setRoleError('');
    setPhase(PHASE.LOADING_Q);
    try {
      // ✅ Pakai interviewService — JWT token disertakan otomatis via axios interceptor
      const res = await interviewService.generateQuestions({
        role,
        experience_level: expLevel,
        language,
        num_questions_per_type: 1,
      });
      const data = res.data;
      setQuestions(data.questions);
      setAudioBlobs([]);
      setCurrentQIdx(0);
      setSeconds(0);
      setPhase(PHASE.CALL);
      addToast(`${data.questions.length} pertanyaan siap!`, 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || err.message;
      addToast(`Gagal generate pertanyaan: ${msg}`, 'error');
      setPhase(PHASE.IDLE);
    }
  };

  // ── TTS via interviewService (token otomatis) ─────────────────────────────
  const autoPlayTTS = async (text) => {
    if (!text) return;

    // Cleanup previous audio if exists
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      URL.revokeObjectURL(currentAudioRef.current.src);
      currentAudioRef.current = null;
    }

    // Create new abort controller for this TTS request
    ttsAbortRef.current = new AbortController();

    setTtsLoading(true);
    try {
      // ✅ Pakai interviewService — JWT token disertakan otomatis, responseType blob
      const res = await interviewService.playTTS({ text, language });

      // Check if request was aborted (user moved to another question)
      if (ttsAbortRef.current?.signal.aborted) {
        setTtsLoading(false);
        return;
      }

      const url = URL.createObjectURL(res.data);
      const audio = new Audio(url);
      currentAudioRef.current = audio;

      setTtsPlaying(true);

      audio.onended = () => {
        setTtsPlaying(false);
        setTtsLoading(false);
      };

      audio.onerror = () => {
        setTtsPlaying(false);
        setTtsLoading(false);
      };

      await audio.play();
    } catch (err) {
      // Don't show error if request was aborted (user moved question)
      if (ttsAbortRef.current?.signal.aborted) {
        setTtsLoading(false);
        return;
      }
      console.error('TTS error:', err);
      setTtsPlaying(false);
      setTtsLoading(false);
    }
  };

  const handlePlayTTS = () => {
    if (!questions[currentQIdx]) return;
    autoPlayTTS(questions[currentQIdx].question);
  };

  // ── Recording ─────────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlobs((prev) => {
          const next = [...prev];
          next[currentQIdx] = blob;
          return next;
        });
        setRecordedForCurrent(true);
        stopMicStream();
        addToast('Rekaman tersimpan ✓', 'success');
      };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      addToast('Tidak bisa akses mikrofon: ' + err.message, 'error');
    }
  }, [currentQIdx, addToast]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const goTo = (idx) => {
    // Abort TTS if currently playing
    if (ttsAbortRef.current && !ttsAbortRef.current.signal.aborted) {
      ttsAbortRef.current.abort();
    }

    // Stop audio if playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Reset TTS states immediately when moving to new question
    setTtsPlaying(false);
    setTtsLoading(false);

    if (isRecording) stopRecording();
    setCurrentQIdx(idx);
  };

  // ── End & analyze via interviewService (token otomatis) ───────────────────
  const handleEnd = async () => {
    if (isRecording) stopRecording();
    const recorded = audioBlobs.filter(Boolean);
    if (recorded.length === 0) {
      addToast('Rekam minimal 1 jawaban dulu!', 'warning');
      return;
    }
    const answeredIdxs = audioBlobs.map((b, i) => (b ? i : null)).filter((i) => i !== null);
    const answers = answeredIdxs.map((i) => questions[i]);
    const blobs = answeredIdxs.map((i) => audioBlobs[i]);

    setPhase(PHASE.ANALYZING);
    setAnalyzeError(null);

    // Function untuk analyze dengan retry logic
    const performAnalyze = async (retryCount = 0) => {
      try {
        const formData = new FormData();
        formData.append('role', role);
        formData.append('experience_level', expLevel);
        formData.append('language', language);

        const answersJson = answers.map((a) => ({
          question_id: a.question_id,
          interview_type: a.interview_type,
          question: a.question,
        }));
        formData.append('answers_json', JSON.stringify(answersJson));
        blobs.forEach((blob, i) => formData.append(`audio_${i + 1}`, blob, `answer_${i + 1}.webm`));

        // ✅ Pakai interviewService — JWT token disertakan otomatis via axios interceptor
        const res = await interviewService.analyze(formData);
        setResult(res.data);

        // ✅ Log interview ke database
        try {
          await userService.logInterview({
            role: role,
            score: res.data.overall_score || res.data.average_final_score || 0,
            durationSeconds: Math.floor(seconds),
          });
          console.log('[InterviewPage] ✅ Interview logged to database');
        } catch (logErr) {
          console.warn('[InterviewPage] ⚠️ Failed to log interview:', logErr?.response?.data || logErr.message);
          // Tetap tampilkan result meski logging gagal
        }

        setPhase(PHASE.RESULT);
        setAnalyzeError(null);
        addToast('Analisis selesai!', 'success');
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message;

        // Retry untuk 503, 504, timeout, atau connection error
        if ((status === 503 || status === 504 || !status) && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
          setAnalyzeError(`Sedang retry (${retryCount + 1}/3)... API sedang overload, tunggu ${Math.ceil(delay / 1000)}s`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return performAnalyze(retryCount + 1);
        }

        // Jika retry gagal atau error lain
        setAnalyzeError(msg);
        setPhase(PHASE.CALL);
        addToast(`Analisis gagal: ${msg}`, 'error');
      }
    };

    performAnalyze();
  };

  const handleReset = () => {
    setPhase(PHASE.IDLE);
    setResult(null);
    setQuestions([]);
    setAudioBlobs([]);
    setCurrentQIdx(0);
    setSeconds(0);
    setRole('');
  };

  const currentQ = questions[currentQIdx];
  const totalAnswered = audioBlobs.filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className='space-y-6 max-w-4xl'>
      {/* Header */}
      <div className='flex items-start justify-between flex-wrap gap-3'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Interview AI</h1>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>Simulasi interview dengan AI evaluator</p>
        </div>
        <div
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
            backendOnline === true
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : backendOnline === false
                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
          }`}
        >
          {backendOnline === true ? <Wifi size={12} /> : backendOnline === false ? <WifiOff size={12} /> : <Loader2 size={12} className='animate-spin' />}
          {backendOnline === true ? 'Backend Online' : backendOnline === false ? 'Backend Offline' : 'Checking...'}
        </div>
      </div>

      {/* ── IDLE ── */}
      {phase === PHASE.IDLE && (
        <div className='bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 shadow-lg'>
          <p className='text-white/70 text-xs font-semibold uppercase tracking-wider mb-2'>Role yang diinginkan</p>
          <RoleCombobox
            roles={roles}
            value={role}
            onChange={(v) => {
              setRole(v);
              setRoleError('');
            }}
            placeholder='Pilih atau ketik role...'
            error={roleError}
            variant='glass'
            disabled={rolesLoading}
          />
          {isRoleValid && role && (
            <p className='text-green-300 text-xs mt-1 flex items-center gap-1'>
              <CheckCircle size={11} /> Role valid
            </p>
          )}
          <div className='flex items-start gap-1.5 mt-2 mb-4'>
            <Info size={12} className='text-yellow-200/70 mt-0.5 flex-shrink-0' />
            <p className='text-white/60 text-xs italic'>Jika tidak ada role yang diinginkan, pilih role yang mendekati.</p>
          </div>

          {backendOnline === false && (
            <div className='bg-red-500/20 border border-red-300/30 rounded-xl px-4 py-3 mb-4 flex items-start gap-2'>
              <AlertCircle size={16} className='text-red-200 mt-0.5 flex-shrink-0' />
              <div className='text-red-100 text-xs leading-relaxed'>
                <p className='font-semibold mb-1'>Backend offline!</p>
                <p>Jalankan Express gateway dulu:</p>
                <code className='block mt-1 bg-black/20 px-2 py-1.5 rounded font-mono'>node index.js</code>
              </div>
            </div>
          )}

          <Button
            onClick={handleStart}
            disabled={backendOnline === false || !isRoleValid || rolesLoading}
            className='bg-blue-800/80 hover:bg-blue-900 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed'
            icon={<Sparkles size={16} />}
          >
            Mulai Interview
          </Button>
        </div>
      )}

      {/* ── LOADING QUESTIONS ── */}
      {phase === PHASE.LOADING_Q && (
        <div className='bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-lg'>
          <Loader2 size={36} className='text-white animate-spin' />
          <p className='text-white font-bold text-lg'>Generating pertanyaan...</p>
          <p className='text-white/60 text-sm'>
            Gemini menyiapkan soal untuk <strong className='text-white'>{role}</strong>
          </p>
        </div>
      )}

      {/* ── CALL ── */}
      {phase === PHASE.CALL && currentQ && (
        <div className='bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 shadow-lg space-y-4'>
          {/* Top bar */}
          <div className='flex items-center justify-between text-white flex-wrap gap-2'>
            <div>
              <p className='font-bold text-lg'>{role}</p>
              <p className='text-white/60 text-xs capitalize'>
                {expLevel} · {language === 'en' ? 'English' : 'Indonesia'}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-sm font-mono'>
                <Clock size={14} />
                {fmtTime(seconds)}
              </div>
              <span className='text-xs bg-white/10 px-3 py-1.5 rounded-full'>
                {totalAnswered}/{questions.length} dijawab
              </span>
            </div>
          </div>

          {/* Video tiles */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='aspect-video bg-white/10 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/20'>
              <div className='w-14 h-14 rounded-full bg-blue-400/30 flex items-center justify-center text-3xl'>🤖</div>
              <p className='text-white/70 text-xs font-medium'>AI Interviewer</p>
            </div>
            <div className='aspect-video bg-white/10 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/20 relative overflow-hidden'>
              {cam ? (
                <>
                  <div className='w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl'>👤</div>
                  <p className='text-white/70 text-xs font-medium'>Kamu</p>
                  {isRecording && (
                    <div className='absolute top-2 right-2 flex items-center gap-1 bg-red-500 px-2 py-0.5 rounded-full'>
                      <span className='w-1.5 h-1.5 bg-white rounded-full animate-pulse' />
                      <span className='text-white text-xs font-bold'>REC</span>
                    </div>
                  )}
                  {recordedForCurrent && !isRecording && (
                    <div className='absolute top-2 right-2 flex items-center gap-1 bg-green-500 px-2 py-0.5 rounded-full'>
                      <CheckCircle size={10} className='text-white' />
                      <span className='text-white text-xs font-bold'>Saved</span>
                    </div>
                  )}
                </>
              ) : (
                <p className='text-white/50 text-sm'>Kamera Mati</p>
              )}
            </div>
          </div>

          {/* Question panel */}
          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
            <div className='flex items-center gap-1.5 mb-3 flex-wrap'>
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  disabled={ttsPlaying}
                  className={`w-3 h-3 rounded-full transition-all ${i === currentQIdx ? 'bg-white scale-125' : audioBlobs[i] ? 'bg-green-300' : 'bg-white/30'} ${ttsPlaying ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                />
              ))}
              <span className='text-white/50 text-xs ml-1'>
                ({currentQIdx + 1}/{questions.length})
              </span>
            </div>

            <div className='flex items-start gap-3'>
              <div className='flex-1'>
                <span className='text-white/50 text-xs capitalize'>{currentQ.interview_type}</span>
                <p className='text-white font-semibold leading-relaxed mt-0.5'>{currentQ.question}</p>
                <p className='text-white/40 text-xs mt-1 italic'>{currentQ.purpose}</p>
              </div>
              <button
                onClick={handlePlayTTS}
                disabled={ttsLoading || ttsPlaying}
                className='w-9 h-9 flex-shrink-0 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50'
                title='Putar ulang pertanyaan'
              >
                {ttsLoading ? <Loader2 size={16} className='text-white animate-spin' /> : <Volume2 size={16} className={`text-white ${ttsPlaying ? 'animate-pulse' : ''}`} />}
              </button>
            </div>
          </div>

          {/* Recording panel */}
          <div className='bg-white/5 rounded-xl p-4'>
            <p className='text-white/60 text-xs mb-3 text-center font-semibold uppercase tracking-wider'>Rekam Jawaban</p>
            <div className='flex items-center justify-center gap-4'>
              <button
                onClick={() => goTo(Math.max(0, currentQIdx - 1))}
                disabled={currentQIdx === 0 || ttsPlaying}
                className='text-xs text-white/60 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30'
              >
                ← Prev
              </button>

              {!isRecording ? (
                <button onClick={startRecording} className='w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg' title='Mulai rekam'>
                  <Mic size={26} className='text-blue-600' />
                </button>
              ) : (
                <button onClick={stopRecording} className='w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:scale-105 transition-transform shadow-lg animate-pulse' title='Stop rekam'>
                  <MicOff size={26} className='text-white' />
                </button>
              )}

              <button
                onClick={() => goTo(Math.min(questions.length - 1, currentQIdx + 1))}
                disabled={currentQIdx === questions.length - 1 || ttsPlaying}
                className='text-xs text-white/60 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30'
              >
                Next →
              </button>
            </div>
            <p className='text-center text-white/40 text-xs mt-2'>
              {isRecording ? '🔴 Sedang merekam... tekan tombol merah untuk stop' : recordedForCurrent ? '✅ Jawaban tersimpan. Tekan mic untuk rekam ulang.' : '🎤 Tekan tombol mic untuk mulai menjawab'}
            </p>
          </div>

          {/* Bottom bar */}
          <div className='flex items-center justify-between'>
            <button onClick={() => setCam((v) => !v)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${cam ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-500 text-white'}`}>
              {cam ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
            <button onClick={handleEnd} className='flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors'>
              <PhoneOff size={16} />
              Selesai & Analisis ({totalAnswered}/{questions.length})
            </button>
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {phase === PHASE.ANALYZING && (
        <div className='space-y-4'>
          {analyzeError ? (
            <div className='bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-lg'>
              <AlertCircle size={36} className='text-white' />
              <p className='text-white font-bold text-lg'>Analisis Gagal</p>
              <p className='text-white/80 text-sm text-center max-w-xs'>{analyzeError}</p>
              <div className='flex gap-2'>
                <button onClick={handleEnd} className='bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-colors'>
                  Coba Ulang
                </button>
                <button
                  onClick={() => {
                    setPhase(PHASE.CALL);
                    setAnalyzeError(null);
                  }}
                  className='bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors'
                >
                  Kembali
                </button>
              </div>
            </div>
          ) : (
            <div className='bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-lg'>
              <Loader2 size={36} className='text-white animate-spin' />
              <p className='text-white font-bold text-lg'>Menganalisis Interview...</p>
              <p className='text-white/60 text-sm text-center'>Whisper transkripsi audio · Deteksi filler words · AI scoring</p>
              <div className='flex items-center gap-5 text-white/50 text-xs mt-1'>
                <span>🎙️ Speech-to-text</span>
                <span>🔍 Filler detection</span>
                <span>🤖 AI scoring</span>
              </div>
            </div>
          )}
          {!analyzeError && [1, 2, 3].map((i) => <Skeleton key={i} className='h-32 w-full' />)}
        </div>
      )}

      {/* ── RESULT ── */}
      <AnimatePresence>
        {phase === PHASE.RESULT && result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='space-y-5'>
            {/* Score cards */}
            <div className='grid sm:grid-cols-3 gap-4'>
              {[
                { label: 'Content Score', value: result.average_content_score, desc: 'Kualitas jawaban' },
                { label: 'Delivery Score', value: result.average_delivery_score, desc: 'Cara berbicara' },
                { label: 'Final Score', value: result.average_final_score, desc: '70% content + 30% delivery' },
              ].map((s) => {
                const scoreValue = typeof s.value === 'number' && !isNaN(s.value) ? Math.round(s.value) : 0;
                const badge = scoreBadge(scoreValue);
                return (
                  <Card key={s.label} className='p-5 text-center'>
                    <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>{s.label}</p>
                    <div className='flex justify-center'>
                      <ScoreRing score={scoreValue} size={100} strokeWidth={8} />
                    </div>
                    <span className={`mt-3 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                    <p className='text-xs text-gray-400 mt-1'>{s.desc}</p>
                  </Card>
                );
              })}
            </div>

            {/* Session feedback */}
            {result.final_session_feedback && (
              <Card className='p-5'>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>Ringkasan Sesi</p>
                <p className='text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed'>{result.final_session_feedback.overall_summary}</p>
                <div className='grid sm:grid-cols-3 gap-4'>
                  {[
                    { title: 'Kelebihan', items: result.final_session_feedback.main_strengths, color: 'text-green-600', dot: 'bg-green-500' },
                    { title: 'Perlu Diperbaiki', items: result.final_session_feedback.main_improvement_areas, color: 'text-orange-500', dot: 'bg-orange-500' },
                    { title: 'Rencana Latihan', items: result.final_session_feedback.practice_plan, color: 'text-blue-600', dot: 'bg-blue-500' },
                  ].map(({ title, items, color, dot }) => (
                    <div key={title}>
                      <p className={`text-xs font-semibold ${color} mb-2`}>{title}</p>
                      <ul className='space-y-1'>
                        {items?.map((s, i) => (
                          <li key={i} className='text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5'>
                            <span className={`w-1 h-1 ${dot} rounded-full mt-1.5 flex-shrink-0`} />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {result.final_session_feedback.final_recommendation && (
                  <div className='mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-100 dark:border-blue-800'>
                    <p className='text-xs font-semibold text-blue-600 mb-1'>Rekomendasi Akhir</p>
                    <p className='text-sm text-gray-700 dark:text-gray-200'>{result.final_session_feedback.final_recommendation}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Per-question detail */}
            <div>
              <p className='text-sm font-bold text-gray-700 dark:text-gray-200 mb-3'>Detail Per Pertanyaan</p>
              <div className='space-y-3'>
                {(result.answers || result.results || [])?.map((item, i) => {
                  const finalScore = item.score_breakdown?.final_score || item.final_score || 0;
                  const scoreNum = typeof finalScore === 'number' && !isNaN(finalScore) ? finalScore : 0;
                  const badge = scoreBadge(Math.round(scoreNum));
                  return (
                    <Card key={item.question_id || i} className='p-5'>
                      <div className='flex items-start justify-between gap-3 mb-3'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1 flex-wrap'>
                            <span className='text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full capitalize font-semibold'>{item.interview_type}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                          </div>
                          <p className='text-sm font-semibold text-gray-700 dark:text-gray-200'>{item.question}</p>
                        </div>
                        <div className='flex-shrink-0 text-right'>
                          <p className={`text-2xl font-bold ${scoreColor(Math.round(scoreNum))}`}>{Math.round(scoreNum)}</p>
                          <p className='text-xs text-gray-400'>/ 100</p>
                        </div>
                      </div>

                      {/* Score breakdown */}
                      <div className='flex items-center gap-4 text-xs text-gray-500 mb-3'>
                        <span>
                          Content:{' '}
                          <strong className='text-gray-700 dark:text-gray-300'>
                            {Math.round(
                              (typeof (item.score_breakdown?.content_score || item.content_score) === 'number' && !isNaN(item.score_breakdown?.content_score || item.content_score)
                                ? item.score_breakdown?.content_score || item.content_score
                                : 0) || 0,
                            )}
                          </strong>
                        </span>
                        <span>
                          Delivery:{' '}
                          <strong className='text-gray-700 dark:text-gray-300'>
                            {Math.round(
                              (typeof (item.score_breakdown?.delivery_score || item.delivery_score) === 'number' && !isNaN(item.score_breakdown?.delivery_score || item.delivery_score)
                                ? item.score_breakdown?.delivery_score || item.delivery_score
                                : 0) || 0,
                            )}
                          </strong>
                        </span>
                        <span className='text-gray-300 dark:text-gray-600'>70% + 30%</span>
                      </div>

                      {/* Transcript */}
                      {item.transcript && (
                        <div className='bg-gray-50 dark:bg-gray-700/40 rounded-xl px-4 py-3 mb-3'>
                          <p className='text-xs font-semibold text-gray-400 mb-1'>Transkripsi</p>
                          <p className='text-sm text-gray-600 dark:text-gray-300 italic'>&ldquo;{item.transcript}&rdquo;</p>
                        </div>
                      )}

                      {/* Filler metrics */}
                      {item.speech_delivery && (
                        <div className='grid grid-cols-3 gap-2 mb-3'>
                          {[
                            { label: 'Filler Words', value: item.speech_delivery.filler_count ?? '-' },
                            { label: 'Filler Rate', value: item.speech_delivery.filler_rate != null ? `${(item.speech_delivery.filler_rate * 100).toFixed(1)}%` : '-' },
                            { label: 'Delivery Score', value: typeof item.speech_delivery.delivery_score === 'number' && !isNaN(item.speech_delivery.delivery_score) ? Math.round(item.speech_delivery.delivery_score) : 0 },
                          ].map((m) => (
                            <div key={m.label} className='bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2 text-center'>
                              <p className='text-xs text-gray-400'>{m.label}</p>
                              <p className='text-sm font-bold text-gray-700 dark:text-gray-200'>{m.value}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content feedback */}
                      {item.content_evaluation && (
                        <div className='grid sm:grid-cols-2 gap-3'>
                          {item.content_evaluation.strengths?.length > 0 && (
                            <div>
                              <p className='text-xs font-semibold text-green-600 mb-1.5'>Kelebihan</p>
                              <ul className='space-y-1'>
                                {item.content_evaluation.strengths.slice(0, 2).map((s, j) => (
                                  <li key={j} className='text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5'>
                                    <CheckCircle size={10} className='text-green-500 mt-0.5 flex-shrink-0' />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.content_evaluation.actionable_feedback?.length > 0 && (
                            <div>
                              <p className='text-xs font-semibold text-blue-600 mb-1.5'>Saran</p>
                              <ul className='space-y-1'>
                                {item.content_evaluation.actionable_feedback.slice(0, 2).map((s, j) => (
                                  <li key={j} className='text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5'>
                                    <ChevronRight size={10} className='text-blue-500 mt-0.5 flex-shrink-0' />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

            <Button onClick={handleReset} variant='secondary' icon={<RefreshCw size={16} />}>
              Interview Baru
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
