const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Import database client (Supabase atau database lain)
const { supabase } = require('../services/db'); // or your DB client

const CV_SCORING_API = process.env.CV_SCORING_API_URL || 'https://evalifycvevaluationscoring-api-production.up.railway.app';
const CV_NER_API = process.env.CV_NER_API_URL || 'https://evalifycvevaluationscoring-api-production.up.railway.app';

// ─── Helper: forward multipart PDF ke CV Scoring API ─────────────────────────
async function forwardPdfToScoringApi(fileBuffer, originalname, selectedRole) {
  const form = new FormData();
  form.append('file', fileBuffer, {
    filename: originalname || 'cv.pdf',
    contentType: 'application/pdf',
  });
  form.append('selected_role', selectedRole);
  form.append('num_results', '50');

  const response = await axios.post(`${CV_SCORING_API}/v1/cv-score/pdf`, form, {
    headers: form.getHeaders(),
    timeout: 120_000,
  });
  return response.data;
}

// ─── Helper: forward PDF ke CV NER API ───────────────────────────────────────
async function forwardPdfToNerApi(fileBuffer, originalname) {
  const form = new FormData();
  form.append('file', fileBuffer, {
    filename: originalname || 'cv.pdf',
    contentType: 'application/pdf',
  });

  const response = await axios.post(`${CV_NER_API}/predict/pdf`, form, {
    headers: form.getHeaders(),
    timeout: 120_000,
  });
  return response.data;
}

// ─── Helper: recommend jobs ───────────────────────────────────────────────────
async function forwardPdfToRecommendApi(fileBuffer, originalname, roleHint) {
  const form = new FormData();
  form.append('file', fileBuffer, {
    filename: originalname || 'cv.pdf',
    contentType: 'application/pdf',
  });
  if (roleHint) form.append('role_hint', roleHint);

  const response = await axios.post(`${CV_SCORING_API}/v1/recommend-jobs/pdf`, form, {
    headers: form.getHeaders(),
    timeout: 120_000,
  });
  return response.data;
}

// ─── ✅ NEW: GET /api/cv/jobs - Fetch jobs dari database ────────────────────
router.get('/jobs', authenticate, async (req, res) => {
  try {
    // ✅ Fetch semua jobs dari database (tidak ada limit)
    const { data: jobs, error } = await supabase.from('jobs').select('id, job_role, role_group, seniority_level').order('job_role', { ascending: true });

    if (error) {
      console.error('[cv/jobs] Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch jobs from database' });
    }

    // Format response
    const formattedJobs = (jobs || []).map((j) => ({
      id: j.id,
      name: j.job_role,
      job_role: j.job_role,
      role_group: j.role_group,
      seniority_level: j.seniority_level,
    }));

    return res.json({ jobs: formattedJobs, total: formattedJobs.length });
  } catch (err) {
    console.error('[cv/jobs]', err.message);
    return res.status(500).json({ error: 'Gagal mengambil daftar job.' });
  }
});

// ─── ✅ GET /api/cv/jobs/:id - Fetch job detail ────────────────────────────
router.get('/jobs/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabase.from('jobs').select('*').eq('id', id).single();

    if (error || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.json({ job });
  } catch (err) {
    console.error('[cv/jobs/:id]', err.message);
    return res.status(500).json({ error: 'Gagal mengambil detail job.' });
  }
});

// ─── POST /api/cv/review ──────────────────────────────────────────────────────
router.post('/review', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File CV (PDF) wajib diupload.' });
    }

    const mode = (req.body.mode || 'score').toLowerCase();
    const selectedRole = (req.body.selected_role || '').trim();

    if (mode === 'score' && !selectedRole) {
      return res.status(400).json({ error: 'selected_role wajib diisi untuk mode score.' });
    }

    // ✅ NEW: Validate selected role exists in database
    if (mode === 'score') {
      const { data: jobExists, error: dbError } = await supabase.from('jobs').select('id, job_role').eq('job_role', selectedRole).single();

      if (dbError || !jobExists) {
        return res.status(400).json({
          error: `Role "${selectedRole}" tidak ada di database. Pilih dari daftar yang tersedia.`,
        });
      }

      // Store job_id for tracking
      req.body.job_id = jobExists.id;
    }

    const fileBuffer = req.file.buffer;
    const originalname = req.file.originalname;

    // ✅ NEW: Panggil scoring (role spesifik), recommend (lintas role), dan NER secara paralel
    const [scoringResult, recommendResult, nerResult] = await Promise.allSettled([
      forwardPdfToScoringApi(fileBuffer, originalname, selectedRole),
      forwardPdfToRecommendApi(fileBuffer, originalname, undefined),
      forwardPdfToNerApi(fileBuffer, originalname),
    ]);

    if (scoringResult.status === 'rejected') {
      const err = scoringResult.reason;
      const status = err?.response?.status || 502;
      const detail = err?.response?.data?.detail || err.message;
      return res.status(status).json({ error: `CV Scoring API error: ${detail}` });
    }

    const scoring = scoringResult.value;
    const ner = nerResult.status === 'fulfilled' ? nerResult.value : null;

    // Gunakan hasil job recommendation lintas role jika sukses, jika tidak fall back ke top_matches dari scoring
    let recommendationsList = [];
    if (recommendResult.status === 'fulfilled') {
      recommendationsList = recommendResult.value.recommendations || [];
    } else {
      console.warn('[cv/review] Job Recommendation API failed, falling back to scoring top matches:', recommendResult.reason?.message);
      recommendationsList = scoring.top_matches || [];
    }

    // ── Top matches: Unique job roles only (max 10) ──────────────────────────
    // ✅ FIX:
    // 1. Show job_role (bukan job_description)
    // 2. Remove duplikat - gunakan Set untuk track roles yang sudah ditampilkan
    // 3. Max 10 hasil
    const seenRoles = new Set();
    const topMatches = recommendationsList.reduce((acc, m) => {
      const jobRole = m.job_role || m.job_role_category || 'Unknown';

      // Skip jika role sudah ada di hasil
      if (seenRoles.has(jobRole.toLowerCase())) {
        return acc;
      }

      // Skip jika sudah 10 hasil
      if (acc.length >= 10) {
        return acc;
      }

      seenRoles.add(jobRole.toLowerCase());

      acc.push({
        // ✅ FIX: Tampilkan job_role saja (bukan job_description)
        job_role: jobRole,
        job_role_category: m.job_role_category || jobRole,
        // ✅ FIX: Pakai user_match_score yang sudah skala 0–100
        ranking_score: (m.user_match_score ?? m.user_friendly_score?.overall_score ?? 0) / 100,
        fit_score: m.fit_score,
        structured_score: m.structured_score,
        user_match_score: m.user_match_score ?? m.user_friendly_score?.overall_score ?? 0,
        matched_skills: m.evidence?.matched_skills || [],
        missing_skills: m.evidence?.missing_skills || [],
      });

      return acc;
    }, []);

    const aiExplanation = scoring.ai_explanation || {};
    const overallAnalytic = aiExplanation.summary || '';

    const strengths = [...(aiExplanation.strengths || []), ...(ner?.evaluation?.kekuatan_utama || [])].filter(Boolean);

    const gaps = [...(aiExplanation.gaps || []), ...(ner?.evaluation?.kelemahan_utama || [])].filter(Boolean);

    const recommendationsListDetailed = [...(aiExplanation.recommendations || []), ...(ner?.recommendation?.saran_perbaikan || [])].filter(Boolean);

    const recommendation = aiExplanation.feedback || aiExplanation.summary || (ner?.recommendation?.saran_perbaikan || []).join(' ') || '';

    const payload = {
      mode,
      selected_role: scoring.selected_role || selectedRole || null,
      job_id: req.body.job_id || null,

      // ✅ Simplified: Use only user_friendly_score.overall_score
      overall_score: scoring.user_friendly_score?.overall_score,

      // Keep full object for reference if needed
      user_friendly_score: scoring.user_friendly_score || null,

      score_policy: scoring.score_policy || null,
      overall_analytic: overallAnalytic,
      top_matches: topMatches,
      strengths,
      gaps,
      recommendation,
      recommendations_list: recommendationsListDetailed,
      profile_insights: scoring.profile_insights || null,
      ner_entities: ner?.entities_grouped || null,
    };

    console.log('[cv/review] ✅ Response payload ready:');
    console.log('  overall_score:', payload.overall_score);
    console.log('  selected_role:', payload.selected_role);
    console.log('  top_matches count:', payload.top_matches?.length);
    console.log('  user_friendly_score:', payload.user_friendly_score);

    return res.json(payload);
  } catch (err) {
    console.error('[cv/review]', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Gagal memproses CV review.' });
  }
});

// ─── GET /api/cv/reviews ──────────────────────────────────────────────────────
router.get('/reviews', authenticate, async (req, res) => {
  try {
    res.json({ reviews: [] });
  } catch (err) {
    console.error('[cv/reviews]', err);
    res.status(500).json({ error: 'Gagal mengambil riwayat review.' });
  }
});

// ─── GET /api/cv/reviews/:id ──────────────────────────────────────────────────
router.get('/reviews/:id', authenticate, async (req, res) => {
  try {
    res.json({ review: null });
  } catch (err) {
    console.error('[cv/reviews/:id]', err);
    res.status(500).json({ error: 'Gagal mengambil detail review.' });
  }
});

module.exports = router;
