const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const supabase = require('../lib/supabase');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();
const TOKEN_EXPIRES = '7d';

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { full_name, username, email, password } = req.body;

  if (!full_name || !username || !email || !password) {
    return res.status(400).json({ error: 'full_name, username, email, dan password wajib diisi.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }

  const { data: existingEmail } = await supabase.from('users').select('id').eq('email', email).maybeSingle();

  if (existingEmail) {
    return res.status(409).json({ error: 'Email sudah digunakan.' });
  }

  const { data: existingUsername } = await supabase.from('users').select('id').eq('usernama', username).maybeSingle();

  if (existingUsername) {
    return res.status(409).json({ error: 'Username sudah digunakan.' });
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase.from('users').insert({ full_name, usernama: username, email, password_hash }).select('id, full_name, usernama, email, avatar_url, role, status, created_at').single();

  if (error) {
    console.error('[register]', error);
    return res.status(500).json({ error: 'Gagal membuat akun.' });
  }

  // JWT sekarang menyertakan role
  const token = jwt.sign({ sub: user.id, username: user.usernama, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

  await supabase.from('sessions').insert({
    user_id: user.id,
    token,
    expires_at: new Date(Date.now() + 7 * 86400000),
  });

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    activity_type: 'register',
    title: 'Akun dibuat',
    description: 'User berhasil mendaftar ke Evalify',
  });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      username: user.usernama,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
      status: user.status,
    },
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    return res.status(400).json({ error: 'Email/username dan password wajib diisi.' });
  }

  let query = supabase.from('users').select('id, full_name, usernama, email, password_hash, avatar_url, role, status');

  if (email) {
    if (email.includes('@')) {
      query = query.eq('email', email);
    } else {
      query = query.eq('usernama', email);
    }
  } else if (username) {
    query = query.eq('usernama', username);
  }

  const { data: user, error } = await query.maybeSingle();

  if (error || !user) {
    return res.status(401).json({ error: 'Email/username atau password salah.' });
  }

  // Cek status akun
  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Akun Anda telah disuspend. Hubungi administrator.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Email/username atau password salah.' });
  }

  // JWT menyertakan role untuk RBAC
  const token = jwt.sign({ sub: user.id, username: user.usernama, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

  await supabase.from('sessions').insert({
    user_id: user.id,
    token,
    expires_at: new Date(Date.now() + 7 * 86400000),
  });

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    activity_type: 'login',
    title: 'Login berhasil',
    description: 'User berhasil masuk ke Evalify',
  });

  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      username: user.usernama,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
      status: user.status,
    },
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  const token = req.headers.authorization?.slice(7);
  await supabase.from('sessions').delete().eq('token', token);
  res.json({ message: 'Logout berhasil.' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  const { data: user, error } = await supabase.from('users').select('id, full_name, usernama, email, avatar_url, role, status, created_at, updated_at').eq('id', req.user.sub).single();

  if (error || !user) {
    return res.status(404).json({ error: 'User tidak ditemukan.' });
  }

  res.json({
    id: user.id,
    fullName: user.full_name,
    username: user.usernama,
    email: user.email,
    avatar_url: user.avatar_url,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  });
});

// ─── PATCH /api/auth/profile ──────────────────────────────────────────────────
router.patch('/profile', authenticate, async (req, res) => {
  const allowed = ['full_name', 'avatar_url'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('users').update(updates).eq('id', req.user.sub).select('id, full_name, usernama, email, avatar_url, role, status').single();

  if (error) return res.status(500).json({ error: 'Gagal update profil.' });
  res.json(data);
});

module.exports = router;
