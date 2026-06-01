const express = require('express');
const supabase = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/user/profile ────────────────────────────────────────────────────
router.get('/profile', authenticate, async (req, res) => {
  const userId = req.user.sub;

  const { data: user, error: userError } = await supabase.from('users').select('id, full_name, usernama, email, avatar_url, created_at').eq('id', userId).single();

  if (userError || !user) {
    return res.status(404).json({ error: 'User tidak ditemukan.' });
  }

  // Get stats
  const [interviews, cvReviews] = await Promise.all([
    supabase.from('interview_sessions').select('id, target_role, status, interview_result(overall_score)').eq('user_id', userId).eq('status', 'completed'),
    supabase.from('cv_reviews').select('id, overall_score').eq('user_id', userId),
  ]);

  const interviewData = interviews.data || [];
  const cvData = cvReviews.data || [];

  const avgInterviewScore = interviewData.length ? interviewData.reduce((acc, s) => acc + (s.interview_result?.[0]?.overall_score || 0), 0) / interviewData.length : 0;
  const avgCvScore = cvData.length ? cvData.reduce((acc, s) => acc + (s.overall_score || 0), 0) / cvData.length : 0;

  res.json({
    user: {
      id: user.id,
      fullName: user.full_name,
      username: user.usernama,
      email: user.email,
      avatar_url: user.avatar_url,
      createdAt: user.created_at,
    },
    stats: {
      totalInterviews: interviewData.length,
      totalCVReviews: cvData.length,
      avgInterviewScore: Math.round(avgInterviewScore),
      avgCVScore: Math.round(avgCvScore),
    },
  });
});

// ─── GET /api/user/activity ───────────────────────────────────────────────────
router.get('/activity', authenticate, async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const { data, error } = await supabase.from('activity_logs').select('id, activity_type, title, description, score, created_at').eq('user_id', req.user.sub).order('created_at', { ascending: false }).limit(limit);

  if (error) return res.status(500).json({ error: 'Gagal mengambil aktivitas.' });
  res.json(data);
});

// ─── GET /api/user/stats ──────────────────────────────────────────────────────
router.get('/stats', authenticate, async (req, res) => {
  const userId = req.user.sub;

  const [interviews, cvReviews] = await Promise.all([
    supabase.from('interview_sessions').select('id, target_role, status, interview_result(overall_score)').eq('user_id', userId).eq('status', 'completed'),
    supabase.from('cv_reviews').select('id, overall_score').eq('user_id', userId),
  ]);

  const interviewData = interviews.data || [];
  const cvData = cvReviews.data || [];

  const avgInterviewScore = interviewData.length ? interviewData.reduce((acc, s) => acc + (s.interview_result?.[0]?.overall_score || 0), 0) / interviewData.length : 0;
  const avgCvScore = cvData.length ? cvData.reduce((acc, s) => acc + (s.overall_score || 0), 0) / cvData.length : 0;

  res.json({
    totalInterviews: interviewData.length,
    totalCVReviews: cvData.length,
    avgInterviewScore: Math.round(avgInterviewScore),
    avgCVScore: Math.round(avgCvScore),
  });
});

// ─── GET /api/user/interviews ─────────────────────────────────────────────────
router.get('/interviews', authenticate, async (req, res) => {
  const { data: interviews, error } = await supabase
    .from('interview_sessions')
    .select('id, target_role, status, duration_seconds, started_at, ended_at, interview_result(overall_score, overall_analysis, strengths, improvements)')
    .eq('user_id', req.user.sub)
    .order('started_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Gagal mengambil interview history.' });

  // Format response
  const formatted = (interviews || []).map((i) => ({
    id: i.id,
    role: i.target_role,
    status: i.status,
    duration: i.duration_seconds,
    startedAt: i.started_at,
    endedAt: i.ended_at,
    score: i.interview_result?.[0]?.overall_score || 0,
    analysis: i.interview_result?.[0]?.overall_analysis || '',
    strengths: i.interview_result?.[0]?.strengths || [],
    improvements: i.interview_result?.[0]?.improvements || [],
  }));

  res.json(formatted);
});

// ─── GET /api/user/cv-reviews ─────────────────────────────────────────────────
router.get('/cv-reviews', authenticate, async (req, res) => {
  const { data: reviews, error } = await supabase.from('cv_reviews').select('id, file_name, overall_score, overall_analysis, strengths, weaknesses, created_at').eq('user_id', req.user.sub).order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Gagal mengambil CV review history.' });

  const formatted = (reviews || []).map((r) => ({
    id: r.id,
    fileName: r.file_name,
    score: r.overall_score,
    analysis: r.overall_analysis,
    strengths: r.strengths,
    weaknesses: r.weaknesses,
    createdAt: r.created_at,
  }));

  res.json(formatted);
});

// ─── GET /api/user/dashboard-data ─────────────────────────────────────────────
router.get('/dashboard-data', authenticate, async (req, res) => {
  const userId = req.user.sub;

  try {
    console.log('\n[dashboard-data] 🔍 Fetching data for user:', userId);

    // Fetch all data in parallel
    const [profileRes, interviewsRes, cvReviewsRes, activityRes, allInterviewsRes] = await Promise.all([
      supabase.from('users').select('id, full_name, usernama, email, avatar_url').eq('id', userId).single(),
      // ✅ PERBAIKAN: Ambil semua interview_sessions (tidak filter status, biarkan fallback gunakan activity_logs)
      supabase.from('interview_sessions').select('id, target_role, status, interview_result(overall_score)').eq('user_id', userId),
      supabase.from('cv_reviews').select('id, overall_score').eq('user_id', userId),
      supabase.from('activity_logs').select('id, activity_type, title, description, score, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      // ✅ PERBAIKAN: Ambil activity_logs cv_review dan interview_completed untuk fallback counting
      supabase.from('activity_logs').select('id, activity_type, score').eq('user_id', userId),
    ]);

    const profile = profileRes.data;
    let interviews = interviewsRes.data || [];
    let cvReviews = cvReviewsRes.data || [];
    const activities = activityRes.data || [];
    const allActivities = allInterviewsRes.data || [];

    console.log('[dashboard-data] 📊 Initial query results:', {
      profileOk: !!profile,
      interviewCount: interviews.length,
      cvCount: cvReviews.length,
      activityCount: activities.length,
      allActivitiesCount: allActivities.length,
    });

    // ✅ PERBAIKAN: Hitung CV reviews dari SEMUA activity_logs, bukan hanya top 10
    // Jika ada CV reviews di interview_sessions, gunakan itu; jika tidak, gunakan activity_logs
    if (cvReviews.length === 0) {
      console.log('[dashboard-data] ⚠️  cv_reviews table is empty, counting from activity_logs...');
      const cvActivitiesAll = allActivities.filter(a => a.activity_type === 'cv_review');
      console.log('[dashboard-data] Found', cvActivitiesAll.length, 'cv_review activities in logs');
      
      // Jika ada di activity_logs, gunakan itu
      if (cvActivitiesAll.length > 0) {
        cvReviews = cvActivitiesAll.map((a) => ({
          id: `activity-${a.id}`,
          overall_score: a.score || 0,
          _from_activity: true,
        }));
        console.log('[dashboard-data] ✅ Using', cvReviews.length, 'CV reviews from activity_logs');
      }
    }

    // ✅ PERBAIKAN: Hitung interviews dengan dua strategi
    // 1. Prioritas: interview_sessions dengan interview_result (yang completed)
    // 2. Fallback: activity_logs dengan interview_completed
    const completedInterviews = interviews.filter(i => i.interview_result && i.interview_result.length > 0);
    console.log('[dashboard-data] Found', completedInterviews.length, 'completed interviews from interview_sessions');
    
    if (completedInterviews.length === 0) {
      console.log('[dashboard-data] ⚠️  No completed interviews in interview_sessions, counting from activity_logs...');
      const ivActivitiesAll = allActivities.filter(a => a.activity_type === 'interview_completed');
      console.log('[dashboard-data] Found', ivActivitiesAll.length, 'interview_completed activities in logs');
      
      if (ivActivitiesAll.length > 0) {
        interviews = ivActivitiesAll.map((a) => ({
          id: `activity-${a.id}`,
          interview_result: [{ overall_score: a.score || 0 }],
          _from_activity: true,
        }));
        console.log('[dashboard-data] ✅ Using', interviews.length, 'interviews from activity_logs');
      }
    } else {
      // Gunakan yang dari interview_sessions dengan interview_result
      interviews = completedInterviews;
      console.log('[dashboard-data] ✅ Using', interviews.length, 'interviews from interview_sessions');
    }

    const avgInterviewScore = interviews.length ? interviews.reduce((acc, s) => acc + (s.interview_result?.[0]?.overall_score || 0), 0) / interviews.length : 0;
    const avgCvScore = cvReviews.length ? cvReviews.reduce((acc, s) => acc + (s.overall_score || 0), 0) / cvReviews.length : 0;

    console.log('[dashboard-data] 📈 Calculated stats:', {
      cvCount: cvReviews.length,
      ivCount: interviews.length,
      avgCvScore: Math.round(avgCvScore),
      avgIvScore: Math.round(avgInterviewScore),
    });

    res.json({
      user: {
        fullName: profile?.full_name || 'User',
        email: profile?.email || '',
        username: profile?.usernama || '',
        avatar_url: profile?.avatar_url,
      },
      stats: [
        {
          label: 'CV Reviews',
          value: cvReviews.length,
          color: 'blue',
        },
        {
          label: 'Interviews Done',
          value: interviews.length,
          color: 'green',
        },
        {
          label: 'Avg CV Score',
          value: Math.round(avgCvScore) + '%',
          color: 'purple',
        },
        {
          label: 'Avg Interview Score',
          value: Math.round(avgInterviewScore) + '%',
          color: 'orange',
        },
      ],
      activities: activities.map((a) => ({
        id: a.id,
        type: a.activity_type,
        title: a.title,
        desc: a.description,
        time: new Date(a.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        score: a.score || 0,
      })),
    });

    console.log('[dashboard-data] ✅ Response sent\n');
  } catch (err) {
    console.error('[dashboard-data] ❌ Error:', err);
    res.status(500).json({ error: 'Gagal mengambil data dashboard.', details: err.message });
  }
});

// ─── POST /api/user/log-cv-review ─────────────────────────────────────────────
router.post('/log-cv-review', authenticate, async (req, res) => {
  try {
    const { fileName, score, role } = req.body;
    const userId = req.user.sub;

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('[log-cv-review] ✨ REQUEST RECEIVED');
    console.log('  userId:', userId);
    console.log('  fileName:', fileName);
    console.log('  score:', score);
    console.log('  role:', role);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Validation
    if (!userId) {
      console.log('[log-cv-review] ❌ FAIL: No userId from token');
      return res.status(401).json({ error: 'Unauthorized: No user ID in token' });
    }

    if (!fileName) {
      console.log('[log-cv-review] ❌ FAIL: fileName is required');
      return res.status(400).json({ error: 'fileName wajib diisi' });
    }

    if (score === undefined || score === null) {
      console.log('[log-cv-review] ❌ FAIL: score is required');
      return res.status(400).json({ error: 'score wajib diisi' });
    }

    // Attempt to insert activity log
    console.log('[log-cv-review] 📝 Inserting activity_logs...');
    const { error: logError, data: logData } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        activity_type: 'cv_review',
        title: `CV Review: ${role || 'General'}`,
        description: `Melakukan review terhadap file ${fileName}`,
        score: Math.round(score),
      })
      .select();

    if (logError) {
      console.error('[log-cv-review] ❌ Activity log insert FAILED:', {
        error: logError?.message,
        code: logError?.code,
        details: logError?.details,
      });
      return res.status(500).json({
        error: 'Gagal menyimpan activity log',
        details: logError?.message,
        code: logError?.code,
      });
    }

    console.log('[log-cv-review] ✅ Activity log inserted:', logData?.[0]?.id);

    // Attempt to insert CV review record
    console.log('[log-cv-review] 📝 Inserting cv_reviews...');

    // Build insert object dynamically (handle missing columns gracefully)
    const cvReviewData = {
      user_id: userId,
      file_name: fileName,
      overall_score: score,
    };

    // Add optional fields if they might exist
    if (role) cvReviewData.role_applied = role;

    const { error: cvError, data: cvData } = await supabase.from('cv_reviews').insert(cvReviewData).select();

    if (cvError) {
      console.warn('[log-cv-review] ⚠️ CV review insert FAILED (but activity already logged):', {
        error: cvError?.message,
        code: cvError?.code,
        details: cvError?.details,
      });
      // Don't fail the entire request, activity is already logged
      // Dashboard will use activity_logs as fallback
      console.log('[log-cv-review] ℹ️ Returning success because activity_logs already saved');
      return res.status(200).json({
        success: true,
        message: 'Activity logged successfully (CV review record skipped)',
        warning: 'CV review table insert failed, but activity is tracked',
        details: cvError?.message,
        activityId: logData?.[0]?.id,
      });
    }

    console.log('[log-cv-review] ✅ CV review inserted:', cvData?.[0]?.id);
    console.log('[log-cv-review] ✨ COMPLETE: Both activity and CV review saved\n');

    res.json({
      success: true,
      message: 'CV review dan activity log berhasil dicatat',
      activityId: logData?.[0]?.id,
      reviewId: cvData?.[0]?.id,
    });
  } catch (err) {
    console.error('\n[log-cv-review] ❌ EXCEPTION:');
    console.error('  Message:', err?.message);
    console.error('  Stack:', err?.stack);
    console.error('  Full error:', err, '\n');

    res.status(500).json({
      error: 'Gagal mencatat CV review',
      details: err?.message,
    });
  }
});

// ─── POST /api/user/log-interview ─────────────────────────────────────────────
router.post('/log-interview', authenticate, async (req, res) => {
  try {
    const { role, score, durationSeconds } = req.body;
    const userId = req.user.sub;

    if (!role || score === undefined) {
      return res.status(400).json({ error: 'role dan score wajib diisi' });
    }

    // Log activity
    const { error: logError } = await supabase.from('activity_logs').insert({
      user_id: userId,
      activity_type: 'interview_completed',
      title: `Interview: ${role}`,
      description: `Menyelesaikan interview untuk posisi ${role}`,
      score: Math.round(score),
    });

    if (logError) throw logError;

    // Insert interview session record
    const { error: ivError } = await supabase.from('interview_sessions').insert({
      user_id: userId,
      target_role: role,
      status: 'completed',
      duration_seconds: durationSeconds || 0,
    });

    if (ivError) {
      console.warn('Interview session insert warning (not critical):', ivError);
      // Don't fail the request, activity log is already created
    }

    res.json({ success: true, message: 'Interview logged' });
  } catch (err) {
    console.error('[log-interview]', err);
    res.status(500).json({ error: 'Gagal mencatat interview' });
  }
});

module.exports = router;
