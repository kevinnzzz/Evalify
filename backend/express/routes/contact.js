const express = require('express')
const { sendContactEmail } = require('../services/emailService')

const router = express.Router()

// ─── POST /api/contact ─────────────────────────────────────────────────────────
// Anyone can submit contact form (no auth required)
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      error: 'Nama, email, subject, dan pesan wajib diisi.',
    })
  }

  if (name.trim().length < 2) {
    return res.status(400).json({
      error: 'Nama minimal 2 karakter.',
    })
  }

  if (subject.trim().length < 3) {
    return res.status(400).json({
      error: 'Subject minimal 3 karakter.',
    })
  }

  if (message.length < 10) {
    return res.status(400).json({
      error: 'Pesan minimal 10 karakter.',
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Format email tidak valid.',
    })
  }

  try {
    // Send email via email service
    await sendContactEmail({ name, email, subject, message })

    res.status(201).json({
      message: 'Pesan Anda telah dikirim dengan sukses! Kami akan merespons dalam waktu 24 jam.',
      data: {
        name,
        email,
        subject,
        sentAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[contact error]', error)
    res.status(500).json({
      error: 'Gagal mengirim pesan. Silakan coba lagi nanti.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

module.exports = router
