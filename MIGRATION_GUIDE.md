# Instruksi Menjalankan Migration Database

## 🚀 Langkah 1: Update Database Schema

Anda memiliki 2 pilihan untuk menjalankan migration:

### **Opsi A: Via Supabase Dashboard (Recommended - Termudah)**

1. Buka https://supabase.com dan login
2. Pilih project **Evalify**
3. Pergi ke **SQL Editor** di sidebar kiri
4. Klik **+ New Query** atau buka file baru
5. Copy seluruh isi dari file ini: `database/migrations/005_add_cv_review_columns.sql`
6. Paste ke SQL Editor
7. Klik **RUN** button (atau Ctrl+Enter)
8. Tunggu sampai berhasil (akan ada notifikasi hijau ✅)

**Output yang diharapkan:**

```
Query successful
NOTICE: Column role_applied successfully added/verified on cv_reviews
NOTICE: Column job_id successfully added/verified on cv_reviews
```

---

### **Opsi B: Via Python Script (Jika menggunakan file-based migration runner)**

1. Buka terminal di folder project
2. Jalankan:

```bash
cd database
# Jalankan import_jobs.py atau script lain yang sudah ada
# atau jika ada script migrasi:
python migrate.py  # adjust sesuai script Anda
```

---

## 🔍 Verifikasi Migration Berhasil

Setelah menjalankan migration, verifikasi di Supabase:

1. Pergi ke **Table Editor** → **cv_reviews** table
2. Lihat column headers, pastikan ada:
   - `role_applied` (TEXT)
   - `job_id` (UUID)

**Atau via SQL:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cv_reviews'
ORDER BY column_name;
```

---

## ✅ Setelah Migration Selesai

1. Restart backend & frontend
2. Lakukan CV Review lagi
3. Check dashboard - data seharusnya ter-sync ✅

---

## ❌ Jika Migration Gagal

**Error: "Column already exists"**

- Ini OK! Kolom sudah ada. Lanjut ke Langkah 3 (Restart)

**Error: "Relation jobs does not exist"**

- Jalankan migration 003 & 004 dulu:
  1. Supabase SQL Editor → buka `database/migrations/003_create_jobs_table.sql`
  2. RUN
  3. Buka `database/migrations/004_seed_jobs.sql`
  4. RUN
  5. Lalu jalankan migration 005 lagi

**Error: "Permission denied"**

- Login dengan Supabase admin account
- Pastikan role memiliki akses ke table `cv_reviews`

---

**Questions?** Check browser console dan backend logs untuk detail error. Kirimkan screenshot jika masih ada masalah!
