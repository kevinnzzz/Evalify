const nodemailer = require('nodemailer');

// ─── Initialize Email Transporter ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send feedback email to admin and confirmation to user
 * @param {Object} params - { name, email, subject, message }
 */
async function sendFeedbackEmail({ name, email, subject, message }) {
  try {
    // ─── Email untuk User (Confirmation) ─────────────────────────────────────
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `✅ Feedback Diterima - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Terima Kasih! 🎉</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <p>Halo ${name},</p>
              
              <p>Kami telah menerima feedback Anda dengan subject <strong>"${subject}"</strong>. Tim kami akan meninjau pesan Anda dan segera merespons.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Ringkasan Feedback:</strong></p>
                <p style="margin: 5px 0; color: #666;">
                  <strong>Nama:</strong> ${name}<br>
                  <strong>Email:</strong> ${email}<br>
                  <strong>Subject:</strong> ${subject}
                </p>
              </div>
              
              <p>Kami menghargai masukan Anda untuk meningkatkan platform Evalify. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.</p>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Salam,<br>
                <strong>Tim Evalify</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
              <p style="margin: 0;">© 2026 Evalify. Semua hak dilindungi.</p>
              <p style="margin: 5px 0 0 0;">Jangan reply email ini, hubungi kami melalui platform.</p>
            </div>
          </div>
        </div>
      `,
    });

    // ─── Email untuk Admin (Notification) ────────────────────────────────────
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `[FEEDBACK] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>New Feedback Received</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; white-space: pre-wrap; word-wrap: break-word;">${message}</pre>
          <p style="color: #666; font-size: 12px;">Waktu: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      `,
    });

    console.log(`✅ Feedback email sent successfully to ${email} and admin`);
  } catch (error) {
    console.error('❌ Error sending feedback email:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

/**
 * Send contact form email to admin
 * @param {Object} params - { name, email, subject, message }
 */
async function sendContactEmail({ name, email, subject, message }) {
  try {
    // ─── Email untuk User (Confirmation) ─────────────────────────────────────
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `✅ Pesan Anda Diterima - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Kami Terima Pesan Anda 📬</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <p>Halo ${name},</p>
              
              <p>Terima kasih telah menghubungi kami! Kami telah menerima pesan Anda dan akan segera menanggapi dalam waktu 24 jam.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Detail Pesan:</strong></p>
                <p style="margin: 5px 0; color: #666;">
                  <strong>Nama:</strong> ${name}<br>
                  <strong>Email:</strong> ${email}<br>
                  <strong>Subject:</strong> ${subject}
                </p>
              </div>
              
              <p>Tim support kami akan membantu Anda sesegera mungkin. Terima kasih atas kepercayaan Anda kepada Evalify!</p>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Salam,<br>
                <strong>Tim Support Evalify</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
              <p style="margin: 0;">© 2026 Evalify. Semua hak dilindungi.</p>
              <p style="margin: 5px 0 0 0;">Hubungi kami: ${process.env.EMAIL_USER}</p>
            </div>
          </div>
        </div>
      `,
    });

    // ─── Email untuk Admin (Notification) ────────────────────────────────────
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `[CONTACT] ${subject} dari ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>New Contact Message</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; white-space: pre-wrap; word-wrap: break-word;">${message}</pre>
          <p style="color: #666; font-size: 12px;">Waktu: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      `,
    });

    console.log(`✅ Contact email sent successfully to ${email} and admin`);
  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

module.exports = { sendFeedbackEmail, sendContactEmail };
