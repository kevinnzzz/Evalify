# 🔑 Environment Variables - Panduan Lengkap

Panduan untuk mendapatkan dan mengatur semua environment variables yang diperlukan untuk deployment Evalify ke Vercel.

---

## 📍 Frontend Environment Variables

### `VITE_API_GATEWAY`

**Definisi**: URL backend API Gateway Anda di Vercel

**Nilai Contoh**:

```
https://evalify-backend.vercel.app
```

**Cara Mendapatkan**:

1. Deploy backend terlebih dahulu ke Vercel
2. Vercel akan generate URL yang akan muncul di deployment page
3. Format: `https://{project-name}-{random-id}.vercel.app`

**Tempat Set di Vercel**: Frontend Project → Settings → Environment Variables

---

## 📍 Backend Environment Variables

### `NODE_ENV`

**Definisi**: Menyatakan environment sedang berjalan

**Nilai**:

```
production
```

**Keterangan**: Untuk Vercel deployment, selalu `production`

---

### `PORT`

**Definisi**: Port yang digunakan server

**Nilai**:

```
3000
```

**Keterangan**: Vercel akan handle ini otomatis, ini hanya fallback

---

### `SUPABASE_URL`

**Definisi**: URL project Supabase Anda

**Cara Mendapatkan**:

1. Login ke [https://app.supabase.com](https://app.supabase.com)
2. Pilih project Evalify
3. Klik **Settings** (ikon gear) di sidebar
4. Buka tab **API**
5. Lihat **Project URL**

**Contoh Nilai**:

```
https://abcdefghijklmnop.supabase.co
```

**Disimpan di Backend**:

```javascript
const supabaseUrl = process.env.SUPABASE_URL;
```

---

### `SUPABASE_ANON_KEY`

**Definisi**: Public key untuk akses database dari frontend

**Cara Mendapatkan**:

1. Login ke [https://app.supabase.com](https://app.supabase.com)
2. Pilih project Evalify
3. Klik **Settings** → **API**
4. Lihat **anon public key** (bukan service_role key!)

**Contoh Nilai**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3ODMwMTIwMCwiZXhwIjoxNjkzODUzMjAwfQ.1234567890abcdef...
```

**Disimpan di Backend**:

```javascript
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
```

---

### `SUPABASE_SERVICE_KEY`

**Definisi**: Secret key untuk akses penuh ke database dari backend saja

**Cara Mendapatkan**:

1. Login ke [https://app.supabase.com](https://app.supabase.com)
2. Pilih project Evalify
3. Klik **Settings** → **API**
4. Lihat **service_role secret key** (bukan anon key!)

**Contoh Nilai**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjc4MzAxMjAwLCJleHAiOjE2OTM4NTMyMDB9.0987654321fedcba...
```

**⚠️ PENTING**: Jangan pernah expose ini ke frontend atau public!

---

### `JWT_SECRET`

**Definisi**: Secret key untuk signing JWT tokens

**Cara Generate**:

Jalankan di terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Contoh Output**:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Disimpan di Backend**:

```javascript
const jwtSecret = process.env.JWT_SECRET;
const token = jwt.sign({ userId: 123 }, jwtSecret, { expiresIn: '7d' });
```

---

### `CV_SCORING_API_URL`

**Definisi**: URL service untuk scoring/evaluasi CV

**Nilai Saat Ini**:

```
https://evalifycvevaluationscoring-api-production.up.railway.app
```

**Cara Update**:

- Jika Anda memiliki service sendiri, ganti dengan URL service Anda
- Pastikan service ini berjalan dan accessible

**Digunakan di Backend**:

```javascript
const cvScoringUrl = process.env.CV_SCORING_API_URL;
await axios.post(`${cvScoringUrl}/api/score`, cvData);
```

---

### `CV_NER_API_URL`

**Definisi**: URL service untuk Named Entity Recognition (NER) dari CV

**Nilai Saat Ini**:

```
https://evalifycvevaluationscoring-api-production.up.railway.app
```

**Keterangan**: Bisa sama dengan CV_SCORING_API_URL atau berbeda tergantung setup

---

### `INTERVIEW_API_URL`

**Definisi**: URL service untuk interview simulation

**Nilai Saat Ini**:

```
https://ai-interview-simulation-production.up.railway.app
```

**Cara Update**: Jika service sudah migrate, update URL ini

---

### `ALLOWED_ORIGINS`

**Definisi**: Daftar origin yang diizinkan untuk CORS

**Nilai**:

```
https://evalify.vercel.app,http://localhost:5173
```

**Format**: Comma-separated (tanpa spasi)

**Disimpan di Backend**:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
```

**Update**: Jika Anda punya multiple frontend deployment, tambahkan semua:

```
https://evalify.vercel.app,https://evalify-staging.vercel.app,http://localhost:5173
```

---

### `EMAIL_USER`

**Definisi**: Email address untuk mengirim email (nodemailer)

**Contoh Nilai**:

```
your-email@gmail.com
```

**Disimpan di Backend**:

```javascript
const emailUser = process.env.EMAIL_USER;
```

---

### `EMAIL_PASSWORD`

**Definisi**: Password atau App Password untuk email sender

**Untuk Gmail**:

1. Enable 2-Step Verification di [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Buka [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Pilih **Mail** dan **Windows**
4. Google akan generate 16-character password
5. Copy password itu (remove spasi) → jadikan `EMAIL_PASSWORD`

**Contoh Nilai**:

```
abcdefghijklmnop
```

**⚠️ PENTING**: Ini berbeda dengan password Gmail biasa!

**Disimpan di Backend**:

```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

### `GOOGLE_CLIENT_ID` (Optional - Jika pakai Google OAuth)

**Definisi**: Client ID dari Google Cloud Console untuk OAuth

**Cara Mendapatkan**:

1. Buka [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create/Select project
3. Enable **Google+ API**
4. Buat **OAuth 2.0 Client ID** (type: Web Application)
5. Authorized Redirect URI: `https://evalify-backend.vercel.app/api/auth/google/callback`
6. Copy **Client ID**

**Contoh Nilai**:

```
123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

---

### `GOOGLE_CLIENT_SECRET` (Optional - Jika pakai Google OAuth)

**Definisi**: Secret key dari Google OAuth

**Cara Mendapatkan**:

Dari tahap yang sama seperti CLIENT_ID, copy **Client Secret**

**Contoh Nilai**:

```
GOCSPX-abcdefghijklmnopqrst1234567890
```

**⚠️ PENTING**: Jangan expose ini di public!

---

## 📋 Checklist Set Environment Variables

### Frontend (Vercel Project: evalify)

- [ ] `VITE_API_GATEWAY` = `https://evalify-backend.vercel.app`

### Backend (Vercel Project: evalify-backend)

- [ ] `NODE_ENV` = `production`
- [ ] `SUPABASE_URL` = [dari Supabase]
- [ ] `SUPABASE_ANON_KEY` = [dari Supabase]
- [ ] `SUPABASE_SERVICE_KEY` = [dari Supabase]
- [ ] `JWT_SECRET` = [generated string]
- [ ] `CV_SCORING_API_URL` = [API URL]
- [ ] `CV_NER_API_URL` = [API URL]
- [ ] `INTERVIEW_API_URL` = [API URL]
- [ ] `ALLOWED_ORIGINS` = [Frontend URLs]
- [ ] `EMAIL_USER` = [Email address]
- [ ] `EMAIL_PASSWORD` = [App password]
- [ ] `GOOGLE_CLIENT_ID` = [optional]
- [ ] `GOOGLE_CLIENT_SECRET` = [optional]

---

## 🔄 Cara Update Environment Variables di Vercel

1. Buka [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Pilih project yang ingin diupdate
3. Klik **Settings**
4. Buka **Environment Variables**
5. Edit atau tambah variable
6. Klik **Save**
7. **Penting**: Pergi ke **Deployments** → Pilih latest → Klik **Redeploy** (bukan "Inspect")
8. Tunggu ~2-3 menit sampai redeploy selesai

---

## ⚠️ Tips Keamanan

1. **Jangan commit `.env` file ke GitHub** - Selalu gunakan Vercel Environment Variables
2. **Rotate JWT_SECRET secara berkala** - Generate yang baru setiap 3-6 bulan
3. **Monitor API usage** - Check rate limits dari third-party services
4. **Use service roles carefully** - Jangan expose `SUPABASE_SERVICE_KEY` ke frontend
5. **Encrypt sensitive data** - Jika menyimpan password/tokens di database, encrypt dulu

---

Semoga panduan ini membantu! 🎉
