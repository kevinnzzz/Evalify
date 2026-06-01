-- ============================================================
--  Evalify – Supabase Database Migration
--  Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     TEXT NOT NULL,
  usernama      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 2. SESSIONS (auth tokens)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token   ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. CV_REVIEWS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cv_reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name        TEXT NOT NULL,
  file_url         TEXT,
  overall_score    INT  CHECK (overall_score BETWEEN 0 AND 100),
  overall_analysis TEXT,
  recommendations  JSONB DEFAULT '[]'::JSONB,
  strengths        JSONB DEFAULT '[]'::JSONB,
  weaknesses       JSONB DEFAULT '{}'::JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_reviews_user_id ON cv_reviews(user_id);

-- ─────────────────────────────────────────────────────────────
-- 4. CV_JOB_MATCHES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cv_job_matches (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_review      UUID NOT NULL REFERENCES cv_reviews(id) ON DELETE CASCADE,
  match_score    INT  CHECK (match_score BETWEEN 0 AND 100),
  summary        TEXT,
  matched_skills JSONB DEFAULT '[]'::JSONB,
  missing_skills JSONB DEFAULT '[]'::JSONB
);

-- ─────────────────────────────────────────────────────────────
-- 5. INTERVIEW_SESSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role      TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'in_progress'
                   CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  duration_seconds INT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);

-- ─────────────────────────────────────────────────────────────
-- 6. INTERVIEW_RESULT
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_result (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_session_id UUID NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  overall_score        INT  CHECK (overall_score BETWEEN 0 AND 100),
  overall_analysis     TEXT,
  recommendation       TEXT,
  strengths            JSONB DEFAULT '[]'::JSONB,
  improvements         JSONB DEFAULT '[]'::JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 7. INTERVIEW_QUESTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_questions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  order_index          INT  NOT NULL,
  question_text        TEXT NOT NULL,
  answer_text          TEXT,
  question_score       INT  CHECK (question_score BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_interview_questions_session_id ON interview_questions(interview_session_id);

-- ─────────────────────────────────────────────────────────────
-- 8. FEEDBACKS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedbacks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'read', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 9. ACTIVITY_LOGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,   -- 'register','login','interview_completed','cv_review'
  title         TEXT NOT NULL,
  description   TEXT,
  score         INT,
  reference_id  UUID,            -- FK to interview_sessions or cv_reviews
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- ─────────────────────────────────────────────────────────────
-- 10. Row Level Security (RLS) – opsional, aktifkan jika pakai
--     Supabase client langsung dari browser (anon key).
--     Backend ini menggunakan service_role key sehingga RLS
--     di-bypass secara default – tetap diaktifkan sebagai
--     defense-in-depth.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_job_matches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_result   ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs    ENABLE ROW LEVEL SECURITY;

-- Service role bypasses all RLS – policies below are for anon/authenticated
-- roles if you ever expose the DB via Supabase client in the browser.

-- Allow service_role full access (sudah default, ini explicit)
CREATE POLICY "service_role_all_users"           ON users            FOR ALL USING (true);
CREATE POLICY "service_role_all_sessions"        ON sessions         FOR ALL USING (true);
CREATE POLICY "service_role_all_cv_reviews"      ON cv_reviews       FOR ALL USING (true);
CREATE POLICY "service_role_all_cv_job_matches"  ON cv_job_matches   FOR ALL USING (true);
CREATE POLICY "service_role_all_int_sessions"    ON interview_sessions FOR ALL USING (true);
CREATE POLICY "service_role_all_int_result"      ON interview_result   FOR ALL USING (true);
CREATE POLICY "service_role_all_int_questions"   ON interview_questions FOR ALL USING (true);
CREATE POLICY "service_role_all_feedbacks"       ON feedbacks        FOR ALL USING (true);
CREATE POLICY "service_role_all_activity_logs"   ON activity_logs    FOR ALL USING (true);
