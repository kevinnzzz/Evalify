const express = require('express')
const supabase = require('../lib/supabase')
const { authenticate } = require('../middleware/auth')
const { sendFeedbackEmail } = require('../services/emailService')

const router = express.Router()

// ─── POST /api/feedback ────────────────────────────────────────────────────────
// Anyone can submit feedback (no auth required)
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      error: 'name, email, subject, dan message wajib diisi.',
    })
  }

  if (message.length < 10) {
    return res.status(400).json({
      error: 'Message minimal 10 karakter.',
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Email tidak valid.',
    })
  }

  try {
    // Get user_id if authenticated (optional)
    let userId = null
    if (req.headers.authorization) {
      try {
        const authHeader = req.headers.authorization
        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7)
          const jwt = require('jsonwebtoken')
          const { JWT_SECRET } = require('../middleware/auth')
          const decoded = jwt.verify(token, JWT_SECRET)
          userId = decoded.sub
        }
      } catch (err) {
        // Token invalid/expired, but allow feedback submission anyway
      }
    }

    // Save feedback to database
    const { data: feedback, error: dbError } = await supabase
      .from('feedbacks')
      .insert({
        user_id: userId,
        name,
        email,
        subject,
        message,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('[feedback insert]', dbError)
      return res.status(500).json({
        error: 'Gagal menyimpan feedback ke database.',
      })
    }

    // Send email
    try {
      await sendFeedbackEmail({ name, email, subject, message })
    } catch (emailError) {
      console.error('[email error]', emailError)
      // Don't fail the request if email fails, feedback is already saved
      return res.status(201).json({
        data: feedback,
        warning: 'Feedback saved to database tapi email sending gagal. Admin akan notifikasi via database record.',
      })
    }

    // Log activity if user is authenticated
    if (userId) {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        activity_type: 'feedback',
        title: 'Feedback dikirim',
        description: `Feedback dengan subject "${subject}" berhasil dikirim`,
        reference_id: feedback.id,
      })
    }

    res.status(201).json({
      data: feedback,
      message: 'Feedback berhasil dikirim! Email confirmation telah dikirim ke alamat Anda.',
    })
  } catch (error) {
    console.error('[feedback error]', error)
    res.status(500).json({
      error: 'Terjadi kesalahan saat memproses feedback.',
    })
  }
})

// ─── GET /api/feedback (Admin only) ────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  // In production, check if user is admin here
  const { limit = 20, offset = 0, status = null } = req.query

  try {
    let query = supabase.from('feedbacks').select('*', { count: 'exact' })

    if (status && ['pending', 'read', 'resolved'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: feedbacks, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[feedback get]', error)
      return res.status(500).json({ error: 'Gagal mengambil feedback.' })
    }

    res.json({
      data: feedbacks,
      pagination: { limit, offset, total: count },
    })
  } catch (error) {
    console.error('[feedback list error]', error)
    res.status(500).json({
      error: 'Terjadi kesalahan saat mengambil feedback.',
    })
  }
})

// ─── PATCH /api/feedback/:id (Admin only) ──────────────────────────────────────
router.patch('/:id', authenticate, async (req, res) => {
  // In production, check if user is admin here
  const { id } = req.params
  const { status } = req.body

  if (!status || !['pending', 'read', 'resolved'].includes(status)) {
    return res.status(400).json({
      error: 'status harus salah satu dari: pending, read, resolved',
    })
  }

  try {
    const { data: feedback, error } = await supabase
      .from('feedbacks')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[feedback update]', error)
      return res.status(500).json({ error: 'Gagal update feedback.' })
    }

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback tidak ditemukan.' })
    }

    res.json({
      data: feedback,
      message: 'Feedback status berhasil diupdate.',
    })
  } catch (error) {
    console.error('[feedback update error]', error)
    res.status(500).json({
      error: 'Terjadi kesalahan saat update feedback.',
    })
  }
})

module.exports = router
