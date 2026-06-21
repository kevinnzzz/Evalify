const supabase = require('../lib/supabase');

// ─────────────────────────────────────────────────────────────
// GET /admin/statistics
// Statistik ringkasan untuk Admin Dashboard
// Admin TIDAK dapat melihat data CV / hasil AI / password user
// ─────────────────────────────────────────────────────────────
async function getStatistics(req, res) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Semua query paralel
    const [
      { count: totalUsers },
      { count: totalCvReviews },
      { count: totalInterviews },
      { count: totalFeedbacks },
      { count: activityToday },
      { count: newUsersThisWeek },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('cv_reviews').select('*', { count: 'exact', head: true }),
      supabase.from('interview_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('feedbacks').select('*', { count: 'exact', head: true }),
      supabase.from('activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', startOfToday),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek),
    ]);

    // Chart data: CV Review per hari 7 hari terakhir
    const { data: cvChartRaw } = await supabase
      .from('cv_reviews')
      .select('created_at')
      .gte('created_at', last7Days)
      .order('created_at', { ascending: true });

    // Chart data: Interview per hari 7 hari terakhir
    const { data: interviewChartRaw } = await supabase
      .from('interview_sessions')
      .select('created_at: started_at')
      .gte('started_at', last7Days)
      .order('started_at', { ascending: true });

    // Chart data: Aktivitas User per hari 7 hari terakhir
    const { data: activityChartRaw } = await supabase
      .from('activity_logs')
      .select('created_at')
      .gte('created_at', last7Days)
      .order('created_at', { ascending: true });

    // Buat label 7 hari (hari ini - 6 sampai hari ini)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
    }

    const groupByDay = (rows) => {
      const counts = {};
      days.forEach((d) => (counts[d] = 0));
      (rows || []).forEach((row) => {
        const day = (row.created_at || '').slice(0, 10);
        if (counts[day] !== undefined) counts[day]++;
      });
      return days.map((d) => ({ date: d, count: counts[d] }));
    };

    res.json({
      summary: {
        totalUsers: totalUsers || 0,
        totalCvReviews: totalCvReviews || 0,
        totalInterviews: totalInterviews || 0,
        totalFeedbacks: totalFeedbacks || 0,
        activityToday: activityToday || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
      },
      charts: {
        cvReviews: groupByDay(cvChartRaw),
        interviews: groupByDay(interviewChartRaw),
        activity: groupByDay(activityChartRaw),
      },
    });
  } catch (err) {
    console.error('[admin/statistics]', err);
    res.status(500).json({ error: 'Gagal mengambil statistik.' });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /admin/users
// List user dengan search, filter role, pagination
// Admin TIDAK melihat: password, token, data CV, hasil AI
// ─────────────────────────────────────────────────────────────
async function getUsers(req, res) {
  try {
    const { search = '', role = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('users')
      .select('id, full_name, usernama, email, role, status, created_at', { count: 'exact' });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,usernama.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (role && ['user', 'admin'].includes(role)) {
      query = query.eq('role', role);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      users: data || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[admin/users]', err);
    res.status(500).json({ error: 'Gagal mengambil daftar user.' });
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH /admin/users/:id/status
// Suspend / Activate user
// ─────────────────────────────────────────────────────────────
async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid. Gunakan: active | suspended' });
    }

    // Admin tidak bisa suspend dirinya sendiri
    if (id === req.user.sub) {
      return res.status(400).json({ error: 'Anda tidak dapat mengubah status akun Anda sendiri.' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, full_name, email, role, status')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    // Log aktivitas admin
    await supabase.from('activity_logs').insert({
      user_id: req.user.sub,
      activity_type: 'admin_action',
      title: `User ${status === 'suspended' ? 'disuspend' : 'diaktifkan'}`,
      description: `Admin mengubah status user ${data.email} menjadi ${status}`,
    });

    res.json({ message: `User berhasil di-${status === 'suspended' ? 'suspend' : 'aktifkan'}.`, user: data });
  } catch (err) {
    console.error('[admin/users/status]', err);
    res.status(500).json({ error: 'Gagal mengubah status user.' });
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH /admin/users/:id/role
// Ubah role user
// ─────────────────────────────────────────────────────────────
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid. Gunakan: user | admin' });
    }

    // Admin tidak bisa mengubah role dirinya sendiri
    if (id === req.user.sub) {
      return res.status(400).json({ error: 'Anda tidak dapat mengubah role akun Anda sendiri.' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, full_name, email, role, status')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    await supabase.from('activity_logs').insert({
      user_id: req.user.sub,
      activity_type: 'admin_action',
      title: 'Role user diubah',
      description: `Admin mengubah role user ${data.email} menjadi ${role}`,
    });

    res.json({ message: 'Role user berhasil diubah.', user: data });
  } catch (err) {
    console.error('[admin/users/role]', err);
    res.status(500).json({ error: 'Gagal mengubah role user.' });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /admin/activity-logs
// Monitoring aktivitas user
// ─────────────────────────────────────────────────────────────
async function getActivityLogs(req, res) {
  try {
    const { search = '', period = '7days', page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let dateFilter = null;
    const now = new Date();
    if (period === 'today') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (period === '7days') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (period === '30days') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Join dengan users untuk mendapatkan nama user
    let query = supabase
      .from('activity_logs')
      .select(
        `id, activity_type, title, description, created_at,
         users!inner(full_name, usernama, email)`,
        { count: 'exact' }
      );

    if (dateFilter) {
      query = query.gte('created_at', dateFilter);
    }

    if (search) {
      // Filter berdasarkan nama user via join
      query = query.or(`users.full_name.ilike.%${search}%,users.usernama.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    // Flatten struktur untuk response yang rapi
    const logs = (data || []).map((log) => ({
      id: log.id,
      activityType: log.activity_type,
      title: log.title,
      description: log.description,
      createdAt: log.created_at,
      user: {
        fullName: log.users?.full_name || '-',
        username: log.users?.usernama || '-',
        email: log.users?.email || '-',
      },
    }));

    res.json({
      logs,
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[admin/activity-logs]', err);
    res.status(500).json({ error: 'Gagal mengambil activity logs.' });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /admin/feedbacks
// List semua feedback
// ─────────────────────────────────────────────────────────────
async function getFeedbacks(req, res) {
  try {
    const { status = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('feedbacks')
      .select('id, name, email, subject, message, status, created_at', { count: 'exact' });

    if (status && ['pending', 'read', 'resolved'].includes(status)) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      feedbacks: data || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[admin/feedbacks]', err);
    res.status(500).json({ error: 'Gagal mengambil feedbacks.' });
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH /admin/feedbacks/:id/status
// Update status feedback: pending | read | resolved
// ─────────────────────────────────────────────────────────────
async function updateFeedbackStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'read', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid. Gunakan: pending | read | resolved' });
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .update({ status })
      .eq('id', id)
      .select('id, name, email, subject, status')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Feedback tidak ditemukan.' });
    }

    res.json({ message: 'Status feedback berhasil diperbarui.', feedback: data });
  } catch (err) {
    console.error('[admin/feedbacks/status]', err);
    res.status(500).json({ error: 'Gagal mengubah status feedback.' });
  }
}

module.exports = {
  getStatistics,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getActivityLogs,
  getFeedbacks,
  updateFeedbackStatus,
};
