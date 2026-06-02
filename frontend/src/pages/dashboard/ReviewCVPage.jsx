import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, Sparkles, ChevronRight, Wifi, WifiOff, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ScoreRing from '../../components/ui/ScoreRing';
import Skeleton from '../../components/ui/Skeleton';
import RoleCombobox from '../../components/ui/RoleCombobox';
import { useToast } from '../../context/ToastContext';
import { cvService, userService } from '../../services/api';

const ALLOWED = ['.pdf', '.docx'];

export default function ReviewCVPage() {
  const { addToast } = useToast();
  const inputRef = useRef();

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [roleError, setRoleError] = useState('');
  const [backendOnline, setBackendOnline] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Health check backend
  useEffect(() => {
    const fallbackBase = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://evalify-backend.vercel.app/api';
    const base = (import.meta.env.VITE_API_URL || fallbackBase).replace('/api', '');
    fetch(`${base}/`)
      .then((r) => setBackendOnline(r.ok))
      .catch(() => setBackendOnline(false));
  }, []);

  // ✅ NEW: Fetch jobs dari Database Express (BUKAN Python API)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // ✅ Fetch dari database jobs via Express endpoint
        const res = await cvService.getJobsFromDatabase();
        const raw = res.data?.jobs || res.data || [];

        const mapped = raw
          .map((r) => ({
            id: r.id,
            name: (r.job_role || r.name || '').trim(),
            category: (r.category ?? 'Lainnya').trim(), // ← tambah category
          }))
          .filter((r) => typeof r.name === 'string' && r.name.length > 0)
          .sort((a, b) => a.name.localeCompare(b.name));
        setRoles(mapped);

        if (mapped.length > 0) {
          addToast(`✅ Loaded ${mapped.length} jobs dari database`, 'success');
        }
      } catch (err) {
        console.error('Failed to fetch jobs from database:', err.message);
        addToast('Gagal load job roles dari database', 'error');
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchJobs();
  }, [addToast]);

  const handleFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED.includes(ext)) {
      addToast('Hanya file PDF dan DOCX yang diizinkan.', 'error');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ✅ Check if selected role exists in database
  const isRoleValid = roles.some((r) => (r.name || '').toLowerCase() === selectedRole.toLowerCase());

  const handleReview = async () => {
    if (!file) {
      addToast('Upload file CV terlebih dahulu.', 'warning');
      return;
    }
    if (!selectedRole.trim()) {
      setRoleError('Pilih role yang diinginkan');
      addToast('Pilih role terlebih dahulu.', 'warning');
      return;
    }
    if (!isRoleValid) {
      setRoleError('Role harus dipilih dari daftar yang tersedia');
      addToast('Role tidak valid. Pilih dari daftar yang tersedia.', 'error');
      return;
    }
    setRoleError('');
    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('selected_role', selectedRole);
      formData.append('mode', 'score');

      setProgress(30);
      const res = await cvService.review(formData);
      setProgress(80);
      const reviewResult = res.data;

      // ✅ Log CV review ke database
      try {
        await userService.logCVReview({
          fileName: file.name,
          score: reviewResult.overall_score || 0,
          role: selectedRole,
        });
        console.log('[ReviewCVPage] ✅ CV review logged to database');
      } catch (logErr) {
        console.warn('[ReviewCVPage] ⚠️ Failed to log CV review:', logErr?.response?.data || logErr.message);
        // Tetap tampilkan result meski logging gagal
      }

      setProgress(100);
      setResult(reviewResult);
      addToast('CV berhasil direview dan disimpan!', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Review gagal';
      addToast(`Review gagal: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => (s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500');

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className='space-y-6 max-w-4xl'>
      {/* Header */}
      <div className='flex items-start justify-between flex-wrap gap-3'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>CV Review</h1>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>Analisis CV otomatis menggunakan AI</p>
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
          {backendOnline === true ? 'Database Online' : backendOnline === false ? 'Database Offline' : 'Checking...'}
        </div>
      </div>

      {/* Upload section */}
      <div className='bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 shadow-lg'>
        <p className='text-white/80 text-xs font-semibold uppercase tracking-wider mb-3'>Upload Resume/CV</p>

        {/* Role selection - FROM DATABASE ✅ */}
        <div className='mb-4'>
          <p className='text-white/70 text-xs font-semibold uppercase tracking-wider mb-2'>Role / Job yang diinginkan (dari database)</p>
          {rolesLoading ? (
            <div className='flex items-center gap-2 text-white/60 text-sm'>
              <Loader2 size={14} className='animate-spin' /> Memuat daftar role dari database...
            </div>
          ) : roles.length === 0 ? (
            <div className='text-white/60 text-sm'>❌ Tidak ada role di database. Pastikan sudah import CSV.</div>
          ) : (
            <RoleCombobox
              roles={roles}
              value={selectedRole}
              onChange={(v) => {
                setSelectedRole(v);
                setRoleError('');
              }}
              placeholder='Pilih atau ketik role...'
              error={roleError}
              variant='glass'
              disabled={loading}
            />
          )}
          {isRoleValid && selectedRole && (
            <p className='text-green-300 text-xs mt-1 flex items-center gap-1'>
              <CheckCircle size={11} /> Role valid (dari database) ✅
            </p>
          )}
          {roles.length > 0 && <p className='text-white/50 text-xs mt-1'>Total {roles.length} job roles tersedia dari database</p>}
        </div>

        {/* Backend offline warning */}
        {backendOnline === false && (
          <div className='bg-red-500/20 border border-red-300/30 rounded-xl px-4 py-3 mb-4 flex items-start gap-2'>
            <AlertCircle size={16} className='text-red-200 mt-0.5 flex-shrink-0' />
            <p className='text-red-100 text-xs font-semibold'>Backend offline! Pastikan Express berjalan di port 3000.</p>
          </div>
        )}

        {/* Drop zone */}
        <div
          className={`relative bg-white/10 backdrop-blur-sm border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
            dragging ? 'border-white bg-white/20 scale-[1.01]' : 'border-white/40 hover:border-white/70 hover:bg-white/15'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type='file' accept='.pdf,.docx' className='hidden' onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
          {file ? (
            <div className='flex items-center justify-center gap-3'>
              <FileText size={20} className='text-white' />
              <span className='text-white font-medium text-sm truncate max-w-[220px]'>{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                }}
                className='text-white/70 hover:text-white transition-colors'
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className='flex items-center justify-center gap-2 text-white/70'>
              <Upload size={16} />
              <span className='text-sm'>
                <span className='text-white font-semibold'>Pilih File</span> atau drag & drop
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        {loading && (
          <div className='mt-3'>
            <div className='h-1.5 bg-white/20 rounded-full overflow-hidden'>
              <motion.div className='h-full bg-white rounded-full' animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
            <p className='text-white/60 text-xs mt-1'>Menganalisis CV... {progress}%</p>
          </div>
        )}

        <p className='text-white/50 text-xs mt-2'>Format: PDF, DOCX • Maks 10MB</p>

        <Button
          onClick={handleReview}
          loading={loading}
          disabled={backendOnline === false || !isRoleValid || !file || rolesLoading || roles.length === 0}
          className='mt-4 bg-blue-800/80 hover:bg-blue-900 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed'
          icon={<Sparkles size={16} />}
        >
          Review CV
        </Button>
      </div>

      {/* Empty state */}
      {!result && !loading && (
        <div className='grid md:grid-cols-2 gap-4'>
          {['Overall Score', 'Kekuatan & Kekurangan', 'Top 10 Job Matches (Unik)', 'Rekomendasi'].map((label, i) => (
            <Card key={label} className={`p-5 min-h-[140px] flex flex-col ${i >= 2 ? 'md:col-span-2' : ''}`}>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3'>{label}</p>
              <div className='flex-1 flex items-center justify-center'>
                <p className='text-sm text-gray-300 dark:text-gray-600'>Belum ada data</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className='grid md:grid-cols-2 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={i >= 3 ? 'md:col-span-2' : ''}>
              <Skeleton className='h-40 w-full' />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
            {/* Score + Analisis */}
            <div className='grid md:grid-cols-2 gap-4'>
              <Card className='p-5 flex flex-col justify-between'>
                <div>
                  <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4'>Overall Score</p>
                  <div className='flex justify-center my-2'>
                    <ScoreRing score={Math.round(result.overall_score ?? 0)} />
                  </div>
                </div>
                {result.overall_analytic && <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center mt-4 px-2 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3'>{result.overall_analytic}</p>}
              </Card>

              <Card className='p-5'>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>Analisis</p>
                {result.strengths?.length > 0 && (
                  <div className='mb-3'>
                    <p className='text-xs font-semibold text-green-600 mb-1.5 flex items-center gap-1'>
                      <CheckCircle size={11} /> Kekuatan
                    </p>
                    <ul className='space-y-1'>
                      {result.strengths.map((s, i) => (
                        <li key={i} className='text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5'>
                          <ChevronRight size={11} className='text-green-500 mt-0.5 flex-shrink-0' />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.gaps?.length > 0 && (
                  <div>
                    <p className='text-xs font-semibold text-red-500 mb-1.5 flex items-center gap-1'>
                      <AlertCircle size={11} /> Kekurangan
                    </p>
                    <ul className='space-y-1'>
                      {result.gaps.map((g, i) => (
                        <li key={i} className='text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5'>
                          <ChevronRight size={11} className='text-red-400 mt-0.5 flex-shrink-0' />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </div>

            {/* ✅ Top 10 Job Matches - Unique Roles Only */}
            {result.top_matches?.length > 0 && (
              <Card className='p-5 border-2 border-blue-100 dark:border-blue-700/30'>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4'>Top {result.top_matches.length} Job Matches (Unik - Job Role)</p>
                <div className='space-y-3'>
                  {result.top_matches.map((m, i) => {
                    // ✅ user_match_score sudah skala 0–100
                    const pct = Math.min(100, Math.round(m.user_match_score ?? m.ranking_score * 100));
                    return (
                      <div key={i} className='flex items-center gap-3'>
                        <span className='text-xs font-bold text-blue-500 w-5'>{i + 1}</span>
                        <div className='flex-1 min-w-0'>
                          {/* ✅ Tampilkan job_role saja (TIDAK job_description) */}
                          <p className='text-sm text-gray-700 dark:text-gray-200 truncate font-semibold'>{m.job_role}</p>
                          {m.job_role_category && m.job_role_category !== m.job_role && <p className='text-xs text-gray-400'>Category: {m.job_role_category}</p>}
                        </div>
                        {m.matched_skills?.length > 0 && (
                          <div className='hidden sm:flex gap-1 flex-shrink-0'>
                            {m.matched_skills.slice(0, 2).map((s, j) => (
                              <span key={j} className='text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full'>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className='w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0'>
                          <div className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className='text-xs font-bold text-gray-600 dark:text-gray-300 w-9 text-right flex-shrink-0'>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Rekomendasi */}
            {(result.recommendation || (result.recommendations_list && result.recommendations_list.length > 0)) && (
              <Card className='p-5'>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>Rekomendasi</p>
                {result.recommendations_list && result.recommendations_list.length > 0 ? (
                  <ul className='space-y-2'>
                    {result.recommendations_list.map((r, i) => (
                      <li key={i} className='text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2'>
                        <ChevronRight size={14} className='text-blue-500 mt-0.5 flex-shrink-0' />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>{result.recommendation}</p>
                )}
              </Card>
            )}

            <Button
              onClick={() => {
                setResult(null);
                setFile(null);
                setSelectedRole('');
              }}
              variant='secondary'
            >
              Review CV Lain
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
