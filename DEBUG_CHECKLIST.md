# Debug Checklist untuk CV Review Sync Issue

## 🚀 Langkah-langkah untuk Mengidentifikasi Masalah:

### 1. **Jalankan Aplikasi dengan Debug Mode**

```bash
# Terminal 1: Backend
cd backend/express
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. **Buka Developer Tools**

- Tekan `F12` di browser
- Buka tab **Console**
- Buka tab **Network** (untuk lihat API calls)

### 3. **Lakukan CV Review (ikuti langkah di bawah)**

Jangan langsung submit! Ikuti dengan seksama:

1. Pergi ke **CV Review** page
2. Upload CV file (PDF atau DOCX)
3. Pilih Role dari dropdown
4. Klik **"Review CV"** button

### 4. **Lihat Debug Logs di 3 Tempat Berbeda:**

#### **A. Browser Console (F12 → Console tab)**

Cari logs berikut (urutan penting):

```
[EVALIFY] Request...          // CV review request dikirim
[CV Review] Logging to dashboard: {...}
[CV Review] Logging successful: {...}   // ✅ SUKSES
// ATAU
[CV Review] Failed to log CV review: {...}  // ❌ GAGAL
```

**Jika ada error:**

- Catat `status`, `statusText`, dan `error` yang ditampilkan
- Screenshot console untuk saya analisis

#### **B. Backend Console (npm run dev output)**

Cari logs berikut:

```
[AUTH] ✅ Token verified for user: ...
═══════════════════════════════════════════════════════════════
[log-cv-review] ✨ REQUEST RECEIVED
  userId: ...
  fileName: ...
  score: ...
  role: ...
═══════════════════════════════════════════════════════════════

[log-cv-review] 📝 Inserting activity_logs...
[log-cv-review] ✅ Activity log inserted: ...

[log-cv-review] 📝 Inserting cv_reviews...
[log-cv-review] ✅ CV review inserted: ...

[log-cv-review] ✨ COMPLETE: Both activity and CV review saved
```

**Jika ada error saat inserting, akan terlihat:**

```
[log-cv-review] ❌ Activity log insert FAILED:
  error: ...
  code: ...
  details: ...
```

#### **C. Supabase Dashboard (Real-time Database)**

1. Buka https://supabase.com
2. Login ke project Evalify
3. Buka tabel `cv_reviews` → lihat apakah ada row baru
4. Buka tabel `activity_logs` → lihat apakah ada row baru

### 5. **Refresh Dashboard**

- Pergi ke **Dashboard / Home** page
- Klik tombol **Refresh** di kanan atas
- Lihat apakah stats update (CV Reviews count berubah dari 0)

---

## 🔍 Kemungkinan Masalah & Solusi:

### ❌ Masalah 1: Token tidak dikirim

**Gejala di Backend Console:**

```
[AUTH] ❌ No Authorization header found
```

**Penyebab:**

- Login gagal
- Token tidak tersimpan di localStorage

**Solusi:**

- Cek localStorage (F12 → Application → Local Storage)
- Pastikan ada `evalify_token` key
- Logout dan login ulang

---

### ❌ Masalah 2: Token invalid

**Gejala di Backend Console:**

```
[AUTH] ❌ Token verification failed: Token invalid or expired.
```

**Penyebab:**

- JWT_SECRET mismatch
- Token sudah expired

**Solusi:**

- Pastikan `JWT_SECRET` di `.env` sama di frontend dan backend
- Logout dan login ulang untuk refresh token

---

### ❌ Masalah 3: Database insert gagal

**Gejala di Backend Console:**

```
[log-cv-review] ❌ Activity log insert FAILED:
  error: ...
  code: ...
```

**Penyebab:**

- RLS policy tidak mengizinkan insert
- Foreign key constraint violation
- Database connection issue

**Solusi:**

- Check Supabase RLS policies pada table `activity_logs` dan `cv_reviews`
- Pastikan policies sudah ada di database/migrations/001_initial_schema.sql

---

### ❌ Masalah 4: overall_score adalah 0

**Gejala:**

- CV review berhasil tapi score selalu 0

**Penyebab:**

- CV Scoring API tidak mengembalikan `user_friendly_score.overall_score`
- Backend tidak mengubah dari None/null ke value

**Solusi:**

- Cek CV API response (cari di Network tab browser)
- Lihat apakah API mengembalikan `user_friendly_score` field

---

## 📋 Debug Output yang Saya Butuhkan:

**Kirimkan screenshot dari:**

1. **Browser Console** - Full output dari "[CV Review]" logs
2. **Backend Console** - Full output dari "[log-cv-review]" logs (dari "REQUEST RECEIVED" sampai "COMPLETE")
3. **Network Tab** - Response dari:
   - POST /api/cv/review (lihat response body)
   - POST /api/user/log-cv-review (lihat response body)
4. **Supabase** - Screenshot tabel `cv_reviews` dan `activity_logs` setelah CV review

---

## ✅ Expected Output (Jika Semuanya Bekerja):

### Browser Console:

```
✅ Loaded 15 jobs dari database
[CV Review] Logging to dashboard: {
  fileName: "resume.pdf",
  score: 75,
  role: "Frontend Developer"
}
[CV Review] Logging successful: { success: true, message: "CV review dan activity log berhasil dicatat", activityId: "xxx", reviewId: "yyy" }
[HomePage] Fetching dashboard data...
[HomePage] Dashboard data fetched: { stats: [ { label: 'CV Reviews', value: 1, ... }, ... ], activities: [ ... ] }
```

### Backend Console:

```
[AUTH] ✅ Token verified for user: uuid-xxx
═══════════════════════════════════════════════════════════════
[log-cv-review] ✨ REQUEST RECEIVED
  userId: uuid-xxx
  fileName: resume.pdf
  score: 75
  role: Frontend Developer
═══════════════════════════════════════════════════════════════

[log-cv-review] 📝 Inserting activity_logs...
[log-cv-review] ✅ Activity log inserted: activity-id-xxx

[log-cv-review] 📝 Inserting cv_reviews...
[log-cv-review] ✅ CV review inserted: review-id-yyy

[log-cv-review] ✨ COMPLETE: Both activity and CV review saved
```

### Dashboard Update:

- CV Reviews: 0 → 1
- Avg CV Score: 0% → 75%
- Activity Split: "Belum ada data" → "1 CV review"

---

Kirimkan hasil debug Anda, saya akan analisis lebih lanjut!
