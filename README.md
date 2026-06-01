# Evalify 🎯

Platform simulasi interview dan review CV berbasis AI.

---

## Arsitektur Sistem

### Production (dengan Railway)

```
Frontend (React + Vite)  ─→  Express Gateway (Node.js)  ─→  Railway AI Models
         :5173                      :3000                  ├─ CV Scoring API
                                       │                  └─ Interview Simulation API
                                  Supabase DB
                                 (PostgreSQL)
```

### Development (dengan local Python backend)

```
Frontend (React + Vite)  ─→  Express Gateway (Node.js)  ─→  Python AI Backend (FastAPI)
         :5173                      :3000                            :8000
                                       │
                                  Supabase DB
                                 (PostgreSQL)
```

- **Frontend** – React + Vite + Tailwind CSS
- **Express Gateway** – Node.js/Express: auth, database, proxy ke AI models
- **AI Models** – Railway deployment (CV Scoring + Interview Simulation)
- **Database** – Supabase (PostgreSQL cloud)

---

## Prerequisites

| Tool           | Versi Minimum                 |
| -------------- | ----------------------------- |
| Node.js        | 18+                           |
| npm            | 9+                            |
| Python         | 3.10+                         |
| FFmpeg         | latest                        |
| Akun Supabase  | gratis                        |
| API Key Gemini | gratis di aistudio.google.com |

---

## 1. Setup Database (Supabase)

### 1.1 Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com) → **New Project**
2. Catat:
   - **Project URL** (contoh: `https://abcdefghij.supabase.co`)
   - **Service Role Key** (dari Settings → API → `service_role`)

### 1.2 Jalankan Migrasi

1. Buka **Supabase Dashboard** → **SQL Editor** → **New Query**
2. Copy seluruh isi `database/migrations/001_initial_schema.sql` → **Run**
3. _(Opsional)_ Copy isi `database/migrations/002_seed_data.sql` → **Run** untuk data demo

---

## 2. Setup Express Gateway (Backend Utama)

```bash
cd backend/express

# Copy file environment
cp .env.example .env
```

Edit `.env` untuk production dengan Railway APIs:

```env
PORT=3000
NODE_ENV=production

# Railway AI Model APIs
CV_API_URL=https://evalifycvevaluationscoring-api-production.up.railway.app
INTERVIEW_API_URL=https://ai-interview-simulation-production.up.railway.app

# JWT secret
JWT_SECRET=ganti_dengan_string_acak_panjang_minimal_32_karakter
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

Atau untuk development (menggunakan local Python backend):

```env
PORT=3000
NODE_ENV=development

# Fallback ke Python backend lokal
PYTHON_API_URL=http://localhost:8000

JWT_SECRET=ganti_dengan_string_acak_panjang_minimal_32_karakter
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

Install dependencies dan jalankan:

```bash
npm install
npm start
# atau mode development dengan auto-reload:
npx nodemon index.js
```

✅ Express berjalan di: `http://localhost:3000`

---

## 3. Setup Python AI Backend (Opsional - jika tidak menggunakan Railway)

```bash
cd backend/model_ai

# Copy file environment
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
WHISPER_MODEL_SIZE=base
```

Install FFmpeg (wajib untuk audio processing):

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download dari https://ffmpeg.org/download.html dan tambahkan ke PATH
```

Install Python dependencies:

```bash
pip install -r requirements.txt
# atau dengan virtual environment (direkomendasikan):
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Jalankan:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Python API berjalan di: `http://localhost:8000`
✅ Dokumentasi API: `http://localhost:8000/docs`

---

## 4. Setup Frontend

```bash
cd frontend

# Copy file environment
cp .env.example .env
```

Isi `.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_API_GATEWAY=http://localhost:3000
```

Install dan jalankan:

```bash
npm install
npm run dev
```

✅ Frontend berjalan di: `http://localhost:5173`

---

## 5. Menjalankan Semua Sekaligus

Buka **3 terminal terpisah**:

**Terminal 1 – Python AI:**

```bash
cd backend/model_ai
uvicorn main:app --reload --port 8000
```

**Terminal 2 – Express Gateway:**

```bash
cd backend/express
npm start
```

**Terminal 3 – Frontend:**

```bash
cd frontend
npm run dev
```

Buka browser: `http://localhost:5173`

---

## 6. API Endpoints

### Auth

| Method | Endpoint             | Keterangan                |
| ------ | -------------------- | ------------------------- |
| POST   | `/api/auth/register` | Daftar akun baru          |
| POST   | `/api/auth/login`    | Login, mendapat JWT token |
| POST   | `/api/auth/logout`   | Logout (invalidate token) |
| GET    | `/api/auth/me`       | Info user yang login      |
| PATCH  | `/api/auth/profile`  | Update profil             |

### Interview

| Method | Endpoint                      | Keterangan                      |
| ------ | ----------------------------- | ------------------------------- |
| POST   | `/api/interview/questions`    | Generate pertanyaan AI          |
| POST   | `/api/interview/question-tts` | Text-to-speech pertanyaan       |
| POST   | `/api/interview/analyze`      | Analisis jawaban audio          |
| GET    | `/api/interview/sessions`     | Riwayat session (auth required) |
| GET    | `/api/interview/sessions/:id` | Detail session                  |

### CV

| Method | Endpoint              | Keterangan                        |
| ------ | --------------------- | --------------------------------- |
| POST   | `/api/cv/review`      | Review CV (upload PDF/DOCX)       |
| GET    | `/api/cv/reviews`     | Riwayat CV review (auth required) |
| GET    | `/api/cv/reviews/:id` | Detail CV review                  |

### User

| Method | Endpoint             | Keterangan         |
| ------ | -------------------- | ------------------ |
| GET    | `/api/user/activity` | Log aktivitas user |
| GET    | `/api/user/stats`    | Statistik user     |
| POST   | `/api/user/feedback` | Kirim feedback     |

---

## 7. Akun Demo (setelah seed data)

```
Email:    demo@evalify.com
Password: evalify123
```

---

## 8. Struktur Project

```
Evalify/
├── frontend/           # React + Vite + Tailwind
│   ├── src/
│   │   ├── services/api.js        # HTTP client + service methods
│   │   ├── context/AuthContext.jsx # Auth state (real API)
│   │   └── pages/
├── backend/
│   ├── express/        # Node.js Express Gateway
│   │   ├── index.js           # Entry point
│   │   ├── middleware/auth.js # JWT middleware
│   │   ├── lib/supabase.js    # Supabase client
│   │   └── routes/
│   │       ├── auth.js        # Register, login, logout
│   │       ├── interview.js   # Interview + DB persistence
│   │       ├── cv.js          # CV review + DB persistence
│   │       └── user.js        # Activity, stats, feedback
│   └── model_ai/       # FastAPI Python AI
│       ├── main.py
│       ├── routes/
│       └── services/
└── database/
    └── migrations/
        ├── 001_initial_schema.sql  # Semua tabel
        └── 002_seed_data.sql       # Data demo
```

---

## 9. Troubleshooting

**Error: SUPABASE_URL not set**
→ Pastikan file `.env` di `backend/express/` sudah diisi dengan benar.

**Error: GEMINI_API_KEY is not set**
→ Pastikan file `.env` di `backend/model_ai/` sudah diisi.

**FFmpeg not found**
→ Install FFmpeg dan pastikan ada di PATH. Test: `ffmpeg -version`

**Python model gagal load**
→ Pastikan semua file model ada di `backend/model_ai/models/`

**CORS error dari browser**
→ Pastikan `VITE_API_URL` di frontend `.env` menunjuk ke Express (`http://localhost:3000/api`)
