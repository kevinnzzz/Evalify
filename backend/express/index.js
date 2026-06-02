require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const axios = require('axios');

const interviewRoutes = require('./routes/interview');
const cvRoutes = require('./routes/cv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const feedbackRoutes = require('./routes/feedback');
const contactRoutes = require('./routes/contact');
const rolesRoutes = require('./routes/roles');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── URL dua AI service yang terpisah ─────────────────────────────────────────
const CV_SCORING_API = process.env.CV_SCORING_API_URL || 'https://evalifycvevaluationscoring-api-production.up.railway.app';
const CV_NER_API = process.env.CV_NER_API_URL || 'https://evalifycvevaluationscoring-api-production.up.railway.app';
const INTERVIEW_API = process.env.INTERVIEW_API_URL || 'https://ai-interview-simulation-production.up.railway.app';

// ─── CORS origins ──────────────────────────────────────────────────────────────
const defaultOrigins = process.env.NODE_ENV === 'production' ? 'https://evalifyevalifycareersolution.vercel.app' : 'http://localhost:5173,http://127.0.0.1:5173';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultOrigins).split(',').map((o) => o.trim());

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Helper: ping satu service, return 'online' | 'offline' ──────────────────
async function pingService(url) {
  try {
    await axios.get(url, { timeout: 4000 });
    return 'online';
  } catch {
    return 'offline';
  }
}

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/', async (req, res) => {
  const [cvScoringStatus, cvNerStatus, interviewStatus] = await Promise.all([pingService(`${CV_SCORING_API}/`), pingService(`${CV_NER_API}/`), pingService(`${INTERVIEW_API}/`)]);

  res.json({
    service: 'Evalify Express Gateway',
    status: 'running',
    ai_services: {
      cv_scoring_api: { url: CV_SCORING_API, status: cvScoringStatus },
      cv_ner_api: { url: CV_NER_API, status: cvNerStatus },
      interview_api: { url: INTERVIEW_API, status: interviewStatus },
    },
    routes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET  /api/auth/me',
      'PATCH /api/auth/profile',
      'GET  /api/roles',
      'GET  /api/roles/:id',
      'GET  /api/roles/category/:category',
      // ─── CV Review ───────────────────────────────────────────────────────────
      // mode=score  : PDF + selected_role → scoring + NER → 5 job terbaik + saran
      // mode=recommend: PDF (+ role_hint opsional) → rekomendasi job tanpa role tertentu
      'POST /api/cv/review         (multipart: file, selected_role, mode)',
      'GET  /api/cv/reviews',
      'GET  /api/cv/reviews/:id',
      // ─── Interview AI ─────────────────────────────────────────────────────────
      'POST /api/interview/questions          (JSON: role, experience_level, ...)',
      'POST /api/interview/question-tts       (form: text, language)',
      'POST /api/interview/analyze            (multipart: role, answers_json, audio_1..audio_12)',
      'GET  /api/interview/sessions',
      'GET  /api/interview/sessions/:id',
      // ─── User & Feedback ──────────────────────────────────────────────────────
      'GET  /api/user/activity',
      'GET  /api/user/stats',
      'POST /api/user/feedback',
    ],
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/user', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/roles', rolesRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// ─── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`✅  Evalify Express Gateway  →  http://localhost:${PORT}`);
  console.log(`🤖  CV Scoring API           →  ${CV_SCORING_API}`);
  console.log(`🧬  CV NER API               →  ${CV_NER_API}`);
  console.log(`🎤  Interview AI API         →  ${INTERVIEW_API}`);
});
