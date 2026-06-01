import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { validate } from '../../utils/helpers';
import api from '../../services/api';

export default function FeedbackPage() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const errs = {
      name: validate.required(form.name, 'Name'),
      email: validate.email(form.email),
      subject: validate.required(form.subject, 'Subject'),
      message: validate.minLength(form.message, 10, 'Message'),
    };

    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      // Send feedback to backend API
      const response = await api.post('/feedback', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });

      console.log('✅ Feedback submitted successfully:', response.data);

      setLoading(false);
      setSubmitted(true);
      addToast('Feedback berhasil dikirim! Email konfirmasi telah dikirim.', 'success');

      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: '', email: '', subject: '', message: '' });
      }, 5000);
    } catch (error) {
      setLoading(false);
      console.error('❌ Error submitting feedback:', error);

      const errorMessage = error.response?.data?.error || 'Gagal mengirim feedback. Silakan coba lagi.';
      addToast(errorMessage, 'error');

      // Show validation errors if any
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className='max-w-2xl mx-auto w-full'>
      <h1 className='text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center'>Feedback</h1>

      <Card className='p-6 border-2 border-blue-100 dark:border-blue-700/30'>
        <AnimatePresence mode='wait'>
          {submitted ? (
            <motion.div key='success' initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='py-12 flex flex-col items-center gap-4 text-center'>
              <div className='w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                <CheckCircle size={32} className='text-green-500' />
              </div>
              <h3 className='text-lg font-bold text-gray-800 dark:text-white'>Terima kasih atas feedback Anda!</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 max-w-sm'>Kami menghargai masukan Anda dan akan menggunakannya untuk meningkatkan Evalify. Email konfirmasi telah dikirim ke alamat Anda.</p>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', subject: '', message: '' });
                }}
              >
                Submit Feedback Lagi
              </Button>
            </motion.div>
          ) : (
            <motion.form key='form' initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid sm:grid-cols-2 gap-4'>
                <input name='name' placeholder='Nama Anda' value={form.name} onChange={handleChange} className={`input-field ${errors.name ? 'border-red-400' : ''}`} />
                <input name='email' type='email' placeholder='Email Anda' value={form.email} onChange={handleChange} className={`input-field ${errors.email ? 'border-red-400' : ''}`} />
              </div>
              {(errors.name || errors.email) && (
                <div className='grid sm:grid-cols-2 gap-4 -mt-2'>
                  <p className='text-xs text-red-500'>{errors.name}</p>
                  <p className='text-xs text-red-500'>{errors.email}</p>
                </div>
              )}

              <div>
                <input name='subject' placeholder='Judul Feedback' value={form.subject} onChange={handleChange} className={`input-field ${errors.subject ? 'border-red-400' : ''}`} />
                {errors.subject && <p className='text-xs text-red-500 mt-1'>{errors.subject}</p>}
              </div>

              <div>
                <textarea name='message' placeholder='Pesan Feedback (minimal 10 karakter)' rows={5} value={form.message} onChange={handleChange} className={`input-field resize-none ${errors.message ? 'border-red-400' : ''}`} />
                {errors.message && <p className='text-xs text-red-500 mt-1'>{errors.message}</p>}
              </div>

              <div className='flex justify-end'>
                <Button type='submit' loading={loading} size='lg'>
                  {loading ? 'Mengirim...' : 'Kirim Feedback'}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
