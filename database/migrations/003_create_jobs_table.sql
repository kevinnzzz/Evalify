-- ============================================================
--  Evalify – Jobs Database Migration
--  Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Buat Tabel Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_role         TEXT NOT NULL UNIQUE,
  job_description  TEXT NOT NULL,
  role_group       TEXT,
  role_family      TEXT,
  required_skills  JSONB DEFAULT '[]'::JSONB,
  required_tools   JSONB DEFAULT '[]'::JSONB,
  domains          JSONB DEFAULT '[]'::JSONB,
  education        TEXT,
  years_experience TEXT,
  responsibilities TEXT,
  seniority_level  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Hubungkan cv_reviews dengan jobs melalui job_id (Foreign Key)
ALTER TABLE cv_reviews 
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

-- 3. Hubungkan interview_sessions dengan jobs melalui job_id (Foreign Key)
ALTER TABLE interview_sessions 
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan Keamanan (Security Policies)
-- Service role memiliki akses penuh
CREATE POLICY "service_role_all_jobs" ON jobs FOR ALL USING (true);
-- Pengguna terautentikasi & publik dapat melihat daftar pekerjaan
CREATE POLICY "authenticated_read_jobs" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_read_jobs" ON jobs FOR SELECT TO anon USING (true);
