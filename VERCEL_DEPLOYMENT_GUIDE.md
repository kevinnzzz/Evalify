# 📘 Tutorial Deployment Evalify ke Vercel - Panduan Lengkap

## 📋 Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Tahap 1: Persiapan Awal](#tahap-1-persiapan-awal)
3. [Tahap 2: Deploy Frontend ke Vercel](#tahap-2-deploy-frontend-ke-vercel)
4. [Tahap 3: Deploy Backend ke Vercel](#tahap-3-deploy-backend-ke-vercel)
5. [Tahap 4: Konfigurasi Environment Variables](#tahap-4-konfigurasi-environment-variables)
6. [Tahap 5: Testing & Verifikasi](#tahap-5-testing--verifikasi)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prasyarat

Sebelum memulai, pastikan Anda sudah memiliki:

1. **Akun Vercel** - Daftar gratis di [https://vercel.com](https://vercel.com)
2. **Akun GitHub** - Repository Evalify harus di GitHub
3. **Git** - Terinstall di komputer Anda
4. **Node.js** - Versi 18+ (check dengan `node -v`)
5. **Vercel CLI** (optional tapi disarankan)
6. **Akun Supabase** - Untuk database
7. **API Credentials** - CV Scoring API, Interview API URLs

---

## 📍 Tahap 1: Persiapan Awal

### 1.1 Push Code ke GitHub

```bash
# Jika belum ada repository
git init
git add .
git commit -m "Initial commit - Ready for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/evalify.git
git branch -M main
git push -u origin main
```

### 1.2 Verifikasi Struktur Project

Pastikan struktur folder sudah benar:

```
evalify/
├── frontend/              ← React + Vite app
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json        ← File yang perlu dibuat
├── backend/               ← Express.js app
│   ├── express/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── vercel.json    ← File yang perlu dibuat
│   └── ...
└── README.md
```

### 1.3 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

---

## 🚀 Tahap 2: Deploy Frontend ke Vercel

### 2.1 Buat File Konfigurasi Frontend

Buat file `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_GATEWAY": "@vite_api_gateway"
  }
}
```

### 2.2 Perbarui Build Configuration (Optional)

Jika diperlukan, update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
});
```

### 2.3 Deploy via GitHub

**Opsi A: Menggunakan Vercel Dashboard (Rekomendasi untuk Pemula)**

1. Buka [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Klik **"Add New"** → **"Project"**
3. Pilih repository **evalify** dari GitHub
4. Pilih **"Configure Project"**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Klik **"Deploy"**
6. Tunggu proses build selesai (~2-3 menit)

**Opsi B: Menggunakan Vercel CLI**

```bash
cd frontend
vercel
# Ikuti pertanyaan yang muncul
# Select "Y" untuk link existing project jika ada
```

### 2.4 Verifikasi Frontend Deployment

Setelah deployment selesai, Anda akan mendapat URL seperti:

```
https://evalify.vercel.app
```

Buka di browser dan verifikasi:

- ✅ Halaman loading dengan baik
- ✅ Tidak ada error di console (F12 → Console)
- ✅ Styling CSS berfungsi

---

## ⚙️ Tahap 3: Deploy Backend ke Vercel

### 3.1 Persiapan Backend

Backend di Evalify adalah Express.js server yang perlu dikonfigurasi khusus untuk Vercel serverless.

#### Opsi A: Deploy sebagai Serverless Functions (Rekomendasi)

Buat file `backend/api/index.js` untuk Vercel:

```bash
mkdir -p backend/api
```

Buat file `backend/api/index.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const axios = require('axios');

const interviewRoutes = require('../express/routes/interview');
const cvRoutes = require('../express/routes/cv');
const authRoutes = require('../express/routes/auth');
const userRoutes = require('../express/routes/user');
const feedbackRoutes = require('../express/routes/feedback');
const contactRoutes = require('../express/routes/contact');
const rolesRoutes = require('../express/routes/roles');

const app = express();

// ─── Configuration ─────────────────────────────────────────────────────────────
const CV_SCORING_API = process.env.CV_SCORING_API_URL || 'https://evalifycvevaluationscoring-api-production.up.railway.app';
const CV_NER_API = process.env.CV_NER_API_URL || 'https://evalifycvevaluationscoring-api-production.up.railway.app';
const INTERVIEW_API = process.env.INTERVIEW_API_URL || 'https://ai-interview-simulation-production.up.railway.app';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',');

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────────────────
async function pingService(url) {
  try {
    await axios.get(url, { timeout: 4000 });
    return 'online';
  } catch {
    return 'offline';
  }
}

app.get('/', async (req, res) => {
  const [cvScoringStatus, cvNerStatus, interviewStatus] = await Promise.all([pingService(`${CV_SCORING_API}/`), pingService(`${CV_NER_API}/`), pingService(`${INTERVIEW_API}/`)]);

  res.json({
    service: 'Evalify Express Gateway',
    status: 'running',
    services: {
      cvScoring: cvScoringStatus,
      cvNer: cvNerStatus,
      interview: interviewStatus,
    },
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/interview', interviewRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/roles', rolesRoutes);

// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// For local development
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export untuk Vercel serverless
module.exports = app;
```

#### Opsi B: Deploy sebagai Traditional Server (Untuk Hobby Plan)

Jika menggunakan paid plan, Anda bisa menjalankan backend sebagai full server.

### 3.2 Buat Konfigurasi Vercel untuk Backend

Buat file `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "express/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "express/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "PORT": "@backend_port"
  }
}
```

**ATAU** jika menggunakan serverless API (`api/index.js`):

```json
{
  "version": 2,
  "buildCommand": "cd .. && npm install",
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": "express/**",
        "excludeFiles": "node_modules/**"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

### 3.3 Deploy Backend via GitHub

1. Buka [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Klik **"Add New"** → **"Project"**
3. Pilih repository **evalify** dari GitHub
4. Pilih **"Configure Project"**:
   - **Root Directory**: `backend`
   - **Framework**: `Other` / `Node.js`
   - **Build Command**: `npm install` (di `backend/express` folder)
   - **Output Directory**: `./` atau kosongkan
   - **Start Command**: `node express/index.js` atau `node api/index.js`
5. Klik **"Deploy"**

### 3.4 Verifikasi Backend Deployment

Setelah deployment, Anda akan mendapat URL seperti:

```
https://evalify-backend.vercel.app
```

Test dengan membuka di browser:

```
https://evalify-backend.vercel.app/
```

Seharusnya menampilkan JSON response seperti:

```json
{
  "service": "Evalify Express Gateway",
  "status": "running",
  "services": {
    "cvScoring": "online",
    "cvNer": "online",
    "interview": "online"
  }
}
```

---

## 🌍 Tahap 4: Konfigurasi Environment Variables

### 4.1 Environment Variables untuk Frontend

Di Vercel Frontend Project, buka **Settings** → **Environment Variables**:

```
VITE_API_GATEWAY = https://evalify-backend.vercel.app
```

Klik **"Add"** setelah setiap variable.

### 4.2 Environment Variables untuk Backend

Di Vercel Backend Project, buka **Settings** → **Environment Variables**:

| Variable               | Value                                              | Keterangan                      |
| ---------------------- | -------------------------------------------------- | ------------------------------- |
| `NODE_ENV`             | `production`                                       | Production environment          |
| `PORT`                 | `3000`                                             | Port (Vercel akan mengatur ini) |
| `SUPABASE_URL`         | `https://xxxxx.supabase.co`                        | URL Supabase project            |
| `SUPABASE_ANON_KEY`    | `your-anon-key`                                    | Anon key dari Supabase          |
| `SUPABASE_SERVICE_KEY` | `your-service-key`                                 | Service role key Supabase       |
| `JWT_SECRET`           | `your-secret-key`                                  | Secret untuk JWT token          |
| `CV_SCORING_API_URL`   | `https://...railway.app`                           | URL CV Scoring API              |
| `CV_NER_API_URL`       | `https://...railway.app`                           | URL CV NER API                  |
| `INTERVIEW_API_URL`    | `https://...railway.app`                           | URL Interview API               |
| `ALLOWED_ORIGINS`      | `https://evalify.vercel.app,http://localhost:5173` | CORS origins                    |
| `EMAIL_USER`           | `your-email@gmail.com`                             | Email untuk nodemailer          |
| `EMAIL_PASSWORD`       | `your-app-password`                                | App password untuk email        |
| `GOOGLE_CLIENT_ID`     | `your-client-id`                                   | (Jika pakai OAuth)              |
| `GOOGLE_CLIENT_SECRET` | `your-client-secret`                               | (Jika pakai OAuth)              |

### 4.3 Cara Mendapatkan Environment Variables

**Supabase:**

1. Login ke [https://app.supabase.com](https://app.supabase.com)
2. Pilih project Anda
3. Buka **Settings** → **API**
4. Copy `Project URL` dan `anon public key`

**JWT Secret (Buat sendiri):**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Email Password (Gmail):**

1. Buka [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Pilih Mail dan Windows
3. Copy password yang dihasilkan

---

## ✅ Tahap 5: Testing & Verifikasi

### 5.1 Test Frontend

```bash
1. Buka https://evalify.vercel.app
2. Cek halaman loading dengan baik
3. Buka DevTools (F12) → Console
4. Pastikan tidak ada error
```

### 5.2 Test Backend

```bash
1. Buka https://evalify-backend.vercel.app
2. Verifikasi response JSON muncul
3. Test endpoint: https://evalify-backend.vercel.app/api/roles
4. Test endpoint: https://evalify-backend.vercel.app/api/auth/health (jika ada)
```

### 5.3 Test Koneksi Frontend ↔ Backend

1. Buka https://evalify.vercel.app
2. Buka DevTools → Network
3. Coba login atau buka page yang butuh API
4. Pastikan request ke `https://evalify-backend.vercel.app/api/...` berhasil (status 200)

### 5.4 Test Database (Supabase)

1. Login ke [https://app.supabase.com](https://app.supabase.com)
2. Buka **SQL Editor**
3. Run simple query:
   ```sql
   SELECT COUNT(*) FROM users;
   ```
4. Pastikan data tersimpan dengan baik

---

## 🔍 Troubleshooting

### ❌ Problem: Frontend tidak bisa connect ke Backend

**Solusi:**

1. Check environment variable di Vercel:

   ```
   VITE_API_GATEWAY = https://evalify-backend.vercel.app
   ```

2. Pastikan Backend CORS configuration benar:

   ```javascript
   const allowedOrigins = ['https://evalify.vercel.app', 'http://localhost:5173'];
   app.use(cors({ origin: allowedOrigins, credentials: true }));
   ```

3. Di browser DevTools → Network, cek CORS error

### ❌ Problem: Backend deployment gagal dengan error "Cannot find module"

**Solusi:**

1. Pastikan `package.json` ada di folder yang benar
2. Install dependencies lokal:
   ```bash
   cd backend/express
   npm install
   ```
3. Push ke GitHub lagi

### ❌ Problem: Environment variables tidak terdeteksi

**Solusi:**

1. Setelah add environment variable, klik **Save**
2. **Redeploy** project dari Vercel dashboard
3. Tunggu ~2 menit untuk propagate

### ❌ Problem: Error 502 Bad Gateway

**Solusi:**

1. Check backend logs di Vercel → Project → Deployments → Select Latest → Functions
2. Pastikan backend bisa start: `node api/index.js` (local test)
3. Pastikan semua dependencies terinstall

### ❌ Problem: Database connection timeout

**Solusi:**

1. Verifikasi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` benar
2. Test connection dari local:
   ```bash
   node -e "const {createClient} = require('@supabase/supabase-js'); const client = createClient('URL', 'KEY'); client.auth.getSession().then(console.log)"
   ```
3. Check Supabase project status di dashboard

### ❌ Problem: Netlify/Railway API service offline

**Solusi:**

1. Login ke dashboard service (CV Scoring, Interview API)
2. Check service status
3. Pastikan URL di environment variable benar
4. Update URL jika service sudah migrate

---

## 📊 Checklist Deployment

- [ ] Code sudah di GitHub
- [ ] Frontend vercel.json dibuat
- [ ] Backend vercel.json dibuat
- [ ] Frontend di-deploy ke Vercel
- [ ] Backend di-deploy ke Vercel
- [ ] Frontend environment variables di-set
- [ ] Backend environment variables di-set
- [ ] Frontend di-redeploy setelah set env vars
- [ ] Backend di-redeploy setelah set env vars
- [ ] Frontend accessible di browser
- [ ] Backend health check berfungsi
- [ ] API connection testing berhasil
- [ ] Database query testing berhasil
- [ ] Login flow testing
- [ ] Complete flow testing (upload CV, interview simulation, dll)

---

## 🎯 Quick Reference URLs

Setelah deployment, catat URLs ini:

```
Frontend: https://evalify.vercel.app
Backend:  https://evalify-backend.vercel.app

Vercel Dashboard: https://vercel.com/dashboard
Supabase Dashboard: https://app.supabase.com
```

---

## 📞 Tips & Best Practices

1. **Jangan commit `.env` file** - Gunakan Vercel Environment Variables
2. **Redeploy setelah change env vars** - Perubahan tidak otomatis apply
3. **Monitor logs** - Buka Vercel Dashboard → Deployments → Latest → Functions/Logs
4. **Staging environment** - Buat branch `staging` untuk testing
5. **Use Vercel CLI** - Lebih cepat untuk iterasi development
6. **API rate limits** - Beware of Vercel serverless timeout (10 detik untuk free)

---

Semoga tutorial ini membantu! Jika ada pertanyaan, silakan tanya. 🚀
