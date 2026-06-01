const express = require('express');
const axios = require('axios');
const supabase = require('../lib/supabase');

const router = express.Router();

const CV_SCORING_API = process.env.CV_SCORING_API_URL || 'https://evalifycvevaluationscoring-api-production.up.railway.app';

// ─── Cache roles dari Python CV API agar tidak fetch tiap request ─────────────
let cvRolesCache = null;
let cvRolesCacheTime = 0;
const CV_ROLES_TTL = 10 * 60 * 1000; // 10 menit

async function getCvApiRoles() {
  const now = Date.now();
  if (cvRolesCache && now - cvRolesCacheTime < CV_ROLES_TTL) {
    return cvRolesCache;
  }
  try {
    const res = await axios.get(`${CV_SCORING_API}/`, { timeout: 5000 });
    // Python API return daftar role di root endpoint atau endpoint khusus
    // Coba ambil dari field yang tersedia
    const roles = res.data?.available_roles || res.data?.roles || null;
    if (roles && Array.isArray(roles)) {
      cvRolesCache = roles;
      cvRolesCacheTime = now;
      return roles;
    }
  } catch (err) {
    console.warn('[roles] Gagal fetch CV API roles:', err.message);
  }
  return null;
}

// ─── GET /api/roles ───────────────────────────────────────────────────────────
// Ambil dari Supabase, normalise field name agar konsisten
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobs').select('id, job_role, role_group, role_family, seniority_level, required_skills, domains').order('job_role', { ascending: true });

    if (error) throw error;

    // Normalise: pastikan field `name` ada (dipakai RoleCombobox di frontend)
    const roles = (data || []).map((r) => ({
      ...r,
      name: r.job_role,
    }));

    res.json({ roles });
  } catch (err) {
    console.error('[roles]', err);
    res.status(500).json({ error: 'Gagal mengambil daftar role.' });
  }
});

// ─── GET /api/roles/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', req.params.id).single();

    if (error || !data) return res.status(404).json({ error: 'Role tidak ditemukan.' });

    res.json({ ...data, name: data.job_role });
  } catch (err) {
    console.error('[roles/:id]', err);
    res.status(500).json({ error: 'Gagal mengambil detail role.' });
  }
});

// ─── GET /api/roles/category/:category ───────────────────────────────────────
router.get('/category/:category', async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobs').select('id, job_role, role_group, role_family, seniority_level').eq('role_family', req.params.category).order('job_role', { ascending: true });

    if (error) throw error;

    res.json({ roles: (data || []).map((r) => ({ ...r, name: r.job_role })) });
  } catch (err) {
    console.error('[roles/category]', err);
    res.status(500).json({ error: 'Gagal mengambil role berdasarkan kategori.' });
  }
});

module.exports = router;
