const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { authenticate } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const os = require('os');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const INTERVIEW_API = process.env.INTERVIEW_API_URL || 'https://ai-interview-simulation-production.up.railway.app';

// ─── Helper: Simple audio buffer processor ─────
// Jika API mendukung webm/ogg, langsung kirim. Jika perlu WAV, gunakan library sederhana.
// Untuk sekarang, kita akan langsung kirim audio tanpa konversi karena API mungkin sudah support berbagai format.
function processAudio(inputBuffer, originalName) {
  return new Promise((resolve) => {
    // Jika sudah WAV, langsung kembalikan
    if ((originalName || '').toLowerCase().endsWith('.wav')) {
      resolve({ buffer: inputBuffer, filename: originalName || 'audio.wav' });
      return;
    }

    // Untuk format lain (webm, ogg), kirim langsung ke API
    // API backend (Python) sudah bisa handle berbagai format audio
    const ext = (originalName || 'audio.webm').split('.').pop() || 'webm';
    const filename = originalName || `audio.${ext}`;
    resolve({ buffer: inputBuffer, filename });
  });
}

// ─── POST /api/interview/questions ───────────────────────────────────────────
router.post('/questions', authenticate, async (req, res) => {
  try {
    const { role, experience_level = 'fresh graduate', num_questions_per_type = 1, question_types, user_profile_summary } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Field "role" wajib diisi.' });
    }

    const payload = {
      role: role.trim(),
      experience_level,
      language: 'en',
      num_questions_per_type: Number(num_questions_per_type) || 1,
    };
    if (question_types) payload.question_types = question_types;
    if (user_profile_summary) payload.user_profile_summary = user_profile_summary;

    const response = await axios.post(`${INTERVIEW_API}/ai/interview/questions`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000,
    });

    return res.json(response.data);
  } catch (err) {
    console.error('[interview/questions]', err?.response?.data || err.message);
    const status = err?.response?.status || 502;
    const detail = err?.response?.data?.detail || err.message;
    return res.status(status).json({ error: `Interview API error: ${detail}` });
  }
});

// ─── POST /api/interview/question-tts ────────────────────────────────────────
router.post('/question-tts', authenticate, async (req, res) => {
  try {
    const text = (req.body.text || '').trim();
    const language = req.body.language || 'en';
    const speaker = req.body.speaker || 'professional_male'; // Default to professional male voice

    if (!text) {
      return res.status(400).json({ error: 'Field "text" wajib diisi.' });
    }

    const form = new FormData();
    form.append('text', text);
    form.append('language', language);
    form.append('speaker', speaker);

    const response = await axios.post(`${INTERVIEW_API}/ai/interview/question-tts`, form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer',
      timeout: 30_000,
    });

    res.set('Content-Type', 'audio/wav');
    res.set('Content-Disposition', 'inline; filename="question.wav"');
    return res.send(Buffer.from(response.data));
  } catch (err) {
    console.error('[interview/question-tts]', err?.response?.data || err.message);
    const status = err?.response?.status || 502;
    return res.status(status).json({ error: 'Gagal generate TTS.' });
  }
});

// ─── POST /api/interview/analyze ─────────────────────────────────────────────
const audioUpload = upload.fields(Array.from({ length: 12 }, (_, i) => ({ name: `audio_${i + 1}`, maxCount: 1 })));

router.post('/analyze', authenticate, audioUpload, async (req, res) => {
  try {
    const { role, experience_level = 'fresh graduate', answers_json } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Field "role" wajib diisi.' });
    }
    if (!answers_json) {
      return res.status(400).json({ error: 'Field "answers_json" wajib diisi.' });
    }

    const files = req.files || {};
    const audioFiles = [];
    for (let i = 1; i <= 12; i++) {
      const key = `audio_${i}`;
      if (files[key] && files[key][0]) {
        audioFiles.push({ key, file: files[key][0] });
      }
    }

    if (audioFiles.length === 0) {
      return res.status(400).json({ error: 'Minimal satu file audio wajib disertakan.' });
    }

    let parsedAnswers;
    try {
      parsedAnswers = JSON.parse(answers_json);
    } catch {
      return res.status(400).json({ error: 'answers_json harus berupa JSON valid.' });
    }

    if (!Array.isArray(parsedAnswers) || parsedAnswers.length === 0) {
      return res.status(400).json({ error: 'answers_json harus berupa array non-empty.' });
    }

    if (parsedAnswers.length !== audioFiles.length) {
      return res.status(400).json({
        error: `Jumlah answers_json (${parsedAnswers.length}) harus sama dengan jumlah file audio (${audioFiles.length}).`,
      });
    }

    // ── Process semua audio (skip konversi, API support berbagai format) ────
    console.log(`[interview/analyze] Processing ${audioFiles.length} audio file(s)...`);
    const processedAudios = await Promise.all(
      audioFiles.map(async ({ key, file }) => {
        console.log(`[interview/analyze] Processing ${key} (${file.mimetype})`);
        const { buffer, filename } = await processAudio(file.buffer, file.originalname || `${key}.webm`);
        return { key, buffer, filename };
      }),
    );

    // ── Bangun FormData untuk Python API ─────────────────────────────────────
    const form = new FormData();
    form.append('role', role.trim());
    form.append('experience_level', experience_level);
    form.append('language', 'en');
    form.append('answers_json', answers_json);

    processedAudios.forEach(({ key, buffer, filename }) => {
      form.append(key, buffer, {
        filename,
        contentType: 'audio/wav',
      });
    });

    const response = await axios.post(`${INTERVIEW_API}/ai/interview/analyze-session-audio-batch`, form, {
      headers: form.getHeaders(),
      timeout: 300_000,
    });

    const data = response.data;
    const results = data.results || [];
    const feedback = data.final_session_feedback || {};

    const result = {
      role: data.role,
      experience_level: data.experience_level,
      total_answers: data.total_answers,
      overall_score: data.average_final_score,
      average_content_score: data.average_content_score,
      average_delivery_score: data.average_delivery_score,
      strengths: feedback.main_strengths || [],
      gaps: feedback.main_improvement_areas || [],
      recommendation: feedback.final_recommendation || '',
      practice_plan: feedback.practice_plan || [],
      overall_summary: feedback.overall_summary || '',
      final_session_feedback: feedback,
      answers: results.map((r) => ({
        question_id: r.question_id,
        interview_type: r.interview_type,
        question: r.question,
        transcript: r.transcript,
        content_score: r.score_breakdown?.content_score,
        delivery_score: r.score_breakdown?.delivery_score,
        final_score: r.score_breakdown?.final_score,
        content_evaluation: r.content_evaluation,
        speech_delivery: r.speech_delivery,
        score_breakdown: r.score_breakdown,
      })),
    };

    return res.json(result);
  } catch (err) {
    console.error('[interview/analyze]', err?.response?.data || err.message);
    const status = err?.response?.status || 502;
    const detail = err?.response?.data?.detail || err.message;
    return res.status(status).json({ error: `Interview API error: ${detail}` });
  }
});

// ─── GET /api/interview/sessions ─────────────────────────────────────────────
router.get('/sessions', authenticate, async (req, res) => {
  try {
    res.json({ sessions: [] });
  } catch (err) {
    console.error('[interview/sessions]', err);
    res.status(500).json({ error: 'Gagal mengambil riwayat sesi.' });
  }
});

// ─── GET /api/interview/sessions/:id ─────────────────────────────────────────
router.get('/sessions/:id', authenticate, async (req, res) => {
  try {
    res.json({ session: null });
  } catch (err) {
    console.error('[interview/sessions/:id]', err);
    res.status(500).json({ error: 'Gagal mengambil detail sesi.' });
  }
});

module.exports = router;
