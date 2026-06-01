import os
import csv
import json
import requests
from pathlib import Path

# ─── Konfigurasi Jalur File ───────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATHS = [
    BASE_DIR / ".env",
    BASE_DIR / "Backend" / "express" / ".env",
    BASE_DIR / "Backend" / ".env",
]

CSV_PATH = (
    BASE_DIR
    / "Backend"
    / "model_ai"
    / "Job-Matching_Supervised-Learning-main"
    / "data"
    / "unique_job_role_descriptions_v5_structured_cache.csv"
)

# ─── Load Environment Variables secara Manual ─────────────────────────────────
def load_env():
    env_vars = {}
    for path in ENV_PATHS:
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, val = line.split("=", 1)
                    env_vars[key.strip()] = val.strip().strip('"').strip("'")
            print(f"✅ Loaded .env from: {path.name}")
            return env_vars
    return env_vars

# ─── Parser CSV Nilai String ke Array JSON ─────────────────────────────────────
def parse_pipe_separated_list(value):
    if not value or value.lower() == "none" or value.strip() == "":
        return []
    # Memisahkan string berdasarkan karakter pipe '|'
    return [item.strip().lower() for item in value.split("|") if item.strip()]

def main():
    print("🚀 Memulai proses impor database pekerjaan (jobs) ke Supabase...")

    # 1. Load kredensial Supabase
    env = load_env()
    supabase_url = env.get("SUPABASE_URL")
    service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("❌ ERROR: SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env file!")
        print("Pastikan Anda sudah mengisi berkas .env Anda dengan benar.")
        return

    # Pastikan URL diakhiri dengan /rest/v1
    rest_url = f"{supabase_url.rstrip('/')}/rest/v1/jobs"
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"  # UPSERT berdasarkan UNIQUE constraint (job_role)
    }

    # 2. Periksa berkas CSV katalog pekerjaan
    if not CSV_PATH.exists():
        print(f"❌ ERROR: Berkas CSV tidak ditemukan di: {CSV_PATH}")
        print("Pastikan Anda sudah mengunduh/menyalin berkas katalog pekerjaan teman Anda ke jalur tersebut.")
        return

    # Cek apakah file CSV berukuran kecil (misal: LFS pointer)
    if CSV_PATH.stat().st_size < 1000:
        print("⚠️  Peringatan: Berkas CSV terdeteksi sebagai pointer Git LFS (belum di-pull/diunduh penuh).")
        print("Menjalankan perintah 'git lfs pull' untuk mengunduh berkas...")
        import subprocess
        try:
            subprocess.run(["git", "lfs", "pull"], cwd=str(CSV_PATH.parent), check=True)
            if CSV_PATH.stat().st_size < 1000:
                print("❌ ERROR: Gagal mengunduh berkas asli melalui Git LFS. Silakan unduh manual dan letakkan di folder data.")
                return
            print("✅ Berhasil mengunduh berkas data CSV asli melalui Git LFS!")
        except Exception as e:
            print(f"❌ ERROR: Gagal menjalankan git lfs pull secara otomatis: {e}")
            return

    # 3. Baca dan parsing berkas CSV
    jobs_to_insert = []
    print(f"📖 Membaca berkas CSV: {CSV_PATH.name}...")

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            job_role = row.get("job_role", "").strip()
            job_description = row.get("job_description", "").strip()
            
            if not job_role or not job_description:
                continue
                
            # Konversi data terstruktur jika tersedia (dari structured cache)
            skills = parse_pipe_separated_list(row.get("job_required_skills", ""))
            tools = parse_pipe_separated_list(row.get("job_required_tools", ""))
            domains = parse_pipe_separated_list(row.get("job_domain", ""))
            
            jobs_to_insert.append({
                "job_role": job_role,
                "job_description": job_description,
                "role_group": row.get("role_group", job_role.lower()),
                "role_family": row.get("role_family", "unknown"),
                "required_skills": skills,
                "required_tools": tools,
                "domains": domains,
                "education": row.get("job_required_education", None),
                "years_experience": row.get("job_required_years_experience", None),
                "responsibilities": row.get("job_responsibilities", None),
                "seniority_level": row.get("job_seniority_level", None)
            })

    total_jobs = len(jobs_to_insert)
    print(f"📊 Menemukan total {total_jobs} pekerjaan untuk dimasukkan.")

    # 4. Upload ke Supabase dalam batch (100 item per request)
    batch_size = 100
    inserted_count = 0

    for i in range(0, total_jobs, batch_size):
        batch = jobs_to_insert[i:i + batch_size]
        try:
            response = requests.post(rest_url, json=batch, headers=headers)
            if response.status_code in [200, 201, 204]:
                inserted_count += len(batch)
                print(f"⏳ Terkirim: {inserted_count}/{total_jobs} pekerjaan...")
            else:
                print(f"⚠️  Gagal mengirim batch {i//batch_size + 1}: {response.status_code} - {response.text}")
        except Exception as exc:
            print(f"❌ ERROR saat mengirim batch ke Supabase: {exc}")
            break

    print(f"🎉 Selesai! Berhasil mengimpor {inserted_count} pekerjaan ke database Supabase Anda.")

if __name__ == "__main__":
    main()
