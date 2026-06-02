# 🚀 Quick Start: Deploy ke Vercel dalam 10 Menit

## Langkah-Langkah Cepat

### 1️⃣ Push ke GitHub

```bash
git add .
git commit -m "Preparation for Vercel deployment"
git push origin main
```

### 2️⃣ Deploy Frontend

1. Buka [vercel.com/dashboard](https://vercel.com/dashboard)
2. Klik **Add New → Project**
3. Pilih repository **evalify**
4. **Root Directory**: `frontend`
5. Klik **Deploy** ✅
6. Copy URL yang dihasilkan (misal: `https://evalify.vercel.app`)

### 3️⃣ Deploy Backend

1. Di Vercel Dashboard, klik **Add New → Project** lagi
2. Pilih repository **evalify** (untuk backend)
3. **Root Directory**: `backend`
4. **Framework**: `Other`
5. Klik **Deploy** ✅
6. Copy URL yang dihasilkan (misal: `https://evalify-backend.vercel.app`)

### 4️⃣ Set Environment Variables - Frontend

Di project Frontend:

1. **Settings → Environment Variables**
2. Tambah:
   ```
   VITE_API_GATEWAY = https://evalify-backend.vercel.app
   ```
3. **Save** → **Deployments → Redeploy Latest** ✅

### 5️⃣ Set Environment Variables - Backend

Di project Backend:

1. **Settings → Environment Variables**
2. Tambah semua:
   ```
   NODE_ENV = production
   SUPABASE_URL = [dari Supabase dashboard]
   SUPABASE_ANON_KEY = [dari Supabase dashboard]
   SUPABASE_SERVICE_KEY = [dari Supabase dashboard]
   JWT_SECRET = [generate dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
   CV_SCORING_API_URL = https://evalifycvevaluationscoring-api-production.up.railway.app
   CV_NER_API_URL = https://evalifycvevaluationscoring-api-production.up.railway.app
   INTERVIEW_API_URL = https://ai-interview-simulation-production.up.railway.app
   ALLOWED_ORIGINS = https://evalify.vercel.app,http://localhost:5173
   EMAIL_USER = [your email]
   EMAIL_PASSWORD = [your app password]
   ```
3. **Save** → **Deployments → Redeploy Latest** ✅

### 6️⃣ Verifikasi

```
Frontend: https://evalify.vercel.app (buka di browser)
Backend: https://evalify-backend.vercel.app (should return JSON)
```

## ✨ Done!

Jika ada error, baca [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) untuk troubleshooting lengkap.
