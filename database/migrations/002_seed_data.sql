-- ============================================================
--  Evalify – Seed Data (Sample Interview Session)
--  Berdasarkan response JSON yang diunggah
--  Jalankan SETELAH migration 001_initial_schema.sql
-- ============================================================

-- ─── Sample user (untuk testing) ────────────────────────────
-- Password: evalify123  (bcrypt hash di bawah adalah untuk 'evalify123')
INSERT INTO users (id, full_name, usernama, email, password_hash)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Demo User',
  'demouser',
  'demo@evalify.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/oed5IEFaZGEFiRK0W'  -- evalify123
) ON CONFLICT (email) DO NOTHING;

-- ─── Sample interview session (ML Engineer, fresh graduate) ──
INSERT INTO interview_sessions (id, user_id, target_role, status, started_at, ended_at)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Machine Learning Engineer',
  'completed',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '30 minutes'
) ON CONFLICT DO NOTHING;

-- ─── Sample questions (dari response_1778732467443.json) ─────
INSERT INTO interview_questions (interview_session_id, order_index, question_text, answer_text, question_score)
VALUES
(
  'b0000000-0000-0000-0000-000000000001', 1,
  'What motivated you to pursue a career in Machine Learning, especially given your background as a fresh graduate, and what are you hoping to achieve in your first few years in the industry?',
  '[Audio transcript placeholder]', 55
),
(
  'b0000000-0000-0000-0000-000000000001', 2,
  'Tell me about a time during your academic projects or internships where you faced a significant challenge in data preprocessing for an audio-related ML task.',
  '[Audio transcript placeholder]', 60
),
(
  'b0000000-0000-0000-0000-000000000001', 3,
  'Imagine you''ve developed an audio classification model for a new product, and during initial testing, you find that it performs exceptionally well on your training and validation sets but struggles significantly with real-world user audio, particularly in noisy environments.',
  '[Audio transcript placeholder]', 58
),
(
  'b0000000-0000-0000-0000-000000000001', 4,
  'Given your experience with TensorFlow, explain the concept of a Convolutional Neural Network (CNN) and how it is typically applied in audio classification tasks.',
  '[Audio transcript placeholder]', 52
),
(
  'b0000000-0000-0000-0000-000000000001', 5,
  'As a Machine Learning Engineer working on speech-to-text or filler detection, data preprocessing is crucial. Can you describe the typical steps involved in preparing raw audio data for training a deep learning model?',
  '[Audio transcript placeholder]', 50
),
(
  'b0000000-0000-0000-0000-000000000001', 6,
  'Imagine you need to explain to a product manager how a speech-to-text system works at a high level. How would you describe the core components and processes involved without getting bogged down in technical jargon?',
  '[Audio transcript placeholder]', 48
) ON CONFLICT DO NOTHING;

-- ─── Sample interview result ──────────────────────────────────
INSERT INTO interview_result (
  interview_session_id, overall_score, overall_analysis, recommendation,
  strengths, improvements
)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  66,
  'Kandidat menyelesaikan 6 pertanyaan dengan skor konten rata-rata 54.67 dan skor delivery rata-rata 91.26.',
  'Butuh peningkatan. Kandidat perlu mempersiapkan contoh yang lebih kuat dan jawaban yang lebih lengkap.',
  '["Identifikasi masalah teknis yang relevan (imbalanced dataset)","Memahami metrik evaluasi yang tepat seperti F1 score","Mampu menjelaskan konsep dasar CNN"]'::JSONB,
  '["Pencampuran bahasa Indonesia-Inggris yang menghambat pemahaman","Kurang struktur jawaban yang jelas","Perlu lebih banyak contoh konkret"]'::JSONB
) ON CONFLICT DO NOTHING;

-- ─── Sample activity logs ────────────────────────────────────
INSERT INTO activity_logs (user_id, activity_type, title, description, score, reference_id)
VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'register', 'Akun dibuat', 'Demo user berhasil mendaftar', NULL, NULL
),
(
  'a0000000-0000-0000-0000-000000000001',
  'interview_completed',
  'Interview selesai: Machine Learning Engineer',
  'Skor rata-rata: 66/100',
  66,
  'b0000000-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;
