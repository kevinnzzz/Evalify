import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Mic2, Star, ArrowRight, BrainCircuit, CheckCircle2, Upload, Zap, ChevronRight } from 'lucide-react';
import Navbar from './components/LandingNavbar';
import Footer from './components/LandingFooter';

// ── Scroll-triggered animation wrapper ───────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className='min-h-screen bg-white pt-24 pb-16 flex items-center relative overflow-hidden md:px-10'>
      <div className='max-w-6xl mx-auto px-6 md:px-6 grid md:grid-cols-2 gap-5 items-center w-full'>
        {/* Mobile: Badge & Judul dulu */}
        <motion.div className='md:hidden order-1 flex flex-col items-center' initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className='flex justify-center items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4'>
            <FileText size={12} />
            CV Review Berbasis AI
          </div>
          <h1 className='text-3xl font-bold text-gray-900 leading-tight mb-4 text-center' style={{ fontFamily: 'Syne, sans-serif' }}>
            Buat CV Anda
            <br />
            <span className='text-blue-600'>Lebih Menarik</span>
            <br />
            di Mata Recruiter
          </h1>
        </motion.div>

        {/* Mobile: Gambar di tengah */}
        <motion.div className='md:hidden order-2 relative flex justify-center' initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
          <img src='/images/cv-illustration.png' alt='CV Illustration' className='w-full max-w-[300px]' />
        </motion.div>

        {/* Mobile: Deskripsi & Buttons */}
        <motion.div className='md:hidden order-3' initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
          <p className='text-gray-500 text-sm leading-relaxed mb-6 text-center'>Dapatkan evaluasi otomatis untuk mengetahui kekurangan dan meningkatkan kualitas CV sesuai standar industri.</p>
          <div className='flex flex-col gap-3 mb-8'>
            <Link to='/login' className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2'>
              Mulai Sekarang <ArrowRight size={16} />
            </Link>
            <a href='#steps' className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center justify-center gap-1 border border-blue-600 rounded-xl py-2.5'>
              Cara kerja <ChevronRight size={15} />
            </a>
          </div>
        </motion.div>

        {/* Desktop: Left side text */}
        <motion.div className='hidden md:block' initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className='inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6'>
            <FileText size={12} />
            CV Review Berbasis AI
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5' style={{ fontFamily: 'Syne, sans-serif' }}>
            Buat CV Anda
            <br />
            <span className='text-blue-600'>Lebih Menarik</span>
            <br />
            di Mata Recruiter
          </h1>
          <p className='text-gray-500 text-base leading-relaxed mb-8 max-w-md'>Dapatkan evaluasi otomatis untuk mengetahui kekurangan dan meningkatkan kualitas CV sesuai standar industri.</p>
          <div className='flex items-center gap-4'>
            <Link to='/login' className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2'>
              Mulai Sekarang <ArrowRight size={16} />
            </Link>
            <a href='#steps' className='text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors flex items-center gap-1'>
              Cara kerja <ChevronRight size={15} />
            </a>
          </div>
        </motion.div>

        {/* Desktop: Right side image */}
        <motion.div className='hidden md:block relative flex justify-center' initial={{ opacity: 0, scale: 0.9, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
          <img src='/images/cv-illustration.png' alt='CV Illustration' className='w-full max-w-md' />
        </motion.div>
      </div>
    </section>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────
function Steps() {
  const steps = [
    { n: 1, title: 'Unggah CV dalam Format PDF', desc: 'Mulai dengan mengunggah CV yang ingin Anda evaluasi' },
    { n: 2, title: 'Proses analisis CV oleh AI', desc: 'Sistem akan mengevaluasi struktur dan isi CV secara otomatis' },
    { n: 3, title: 'Dapatkan Feedback', desc: 'Lihat hasil evaluasi dan perbaiki CV Anda agar lebih optimal' },
  ];
  return (
    <section className='py-20 bg-white' id='steps'>
      <div className='max-w-6xl mx-auto px-6'>
        <Reveal>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-16' style={{ fontFamily: 'Syne, sans-serif' }}>
            Tinjau CV Anda Dalam 3 Langkah
          </h2>
        </Reveal>

        {/* Desktop: Horizontal Timeline */}
        <div className='hidden md:block relative max-w-4xl mx-auto'>
          {/* Vertical Timeline Line */}
          <div className='absolute left-1/2 top-0 bottom-0 w-1 bg-blue-600 -translate-x-1/2' />

          <div className='space-y-12'>
            {steps.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <Reveal key={s.n} delay={i * 0.15}>
                  <div className='relative flex items-center'>
                    {/* Timeline dot */}
                    <div className='absolute left-1/2 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg -translate-x-1/2 z-10' />

                    {/* Content */}
                    <div className={`w-5/12 ${isLeft ? 'pr-8' : 'ml-auto pl-8'}`}>
                      <div className='bg-blue-600 text-white rounded-2xl px-6 py-5 shadow-lg'>
                        <div className='text-lg font-bold mb-2'>
                          {s.n}. {s.title}
                        </div>
                        <div className='text-blue-100 text-sm'>{s.desc}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Mobile: Stacked Layout */}
        <div className='md:hidden space-y-6'>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.15}>
              <div className='flex gap-4 items-start'>
                <div className='w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg'>{s.n}</div>
                <div className='bg-blue-600 text-white rounded-2xl px-5 py-4 shadow-lg flex-1'>
                  <div className='font-bold text-base mb-1'>{s.title}</div>
                  <div className='text-blue-100 text-sm'>{s.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Feature Banner ────────────────────────────────────────────────────────────
function FeatureBanner() {
  return (
    <section className='py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden'>
      <div className='absolute inset-0 opacity-10'>
        {[...Array(20)].map((_, i) => (
          <div key={i} className='absolute w-2 h-2 bg-white rounded-full' style={{ left: `${(i * 5.3) % 100}%`, top: `${(i * 7.1) % 100}%` }} />
        ))}
      </div>
      <div className='max-w-6xl mx-auto px-6 relative z-10'>
        <div className='text-center mb-12'>
          <Reveal>
            <h2 className='text-2xl md:text-3xl font-bold text-white' style={{ fontFamily: 'Syne, sans-serif' }}>
              Tingkatkan Kualitas CV Anda dengan Review Berbasis AI
            </h2>
            <p className='text-blue-100 mt-4 max-w-xl mx-auto'>AI kami menganalisis setiap aspek CV Anda secara mendalam untuk memaksimalkan peluang Anda diterima kerja.</p>
          </Reveal>
        </div>
        <Reveal delay={0.2}>
          <div className='max-w-md mx-auto mb-12'>
            <div className='relative w-full'>
              <div className='bg-white rounded-3xl shadow-2xl p-8 border border-gray-100'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center'>
                    <FileText size={20} className='text-white' />
                  </div>
                  <div>
                    <div className='text-sm font-bold text-gray-800'>CV Analyzer AI</div>
                    <div className='text-xs text-green-500 flex items-center gap-1'>
                      <span className='w-1.5 h-1.5 bg-green-500 rounded-full inline-block' />
                      Siap Menganalisis
                    </div>
                  </div>
                </div>

                {/* Upload area mock */}
                <div className='border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center mb-5 bg-blue-50/50'>
                  <Upload size={24} className='text-blue-400 mx-auto mb-2' />
                  <div className='text-sm font-semibold text-gray-700 mb-1'>Upload CV Anda</div>
                  <div className='text-xs text-gray-400'>Format PDF, max 5MB</div>
                </div>

                {/* Score preview */}
                <div className='space-y-2 mb-5'>
                  {[
                    ['Format & Struktur', 88],
                    ['Kata Kunci', 74],
                    ['Pengalaman Kerja', 92],
                  ].map(([label, score]) => (
                    <div key={label} className='flex items-center gap-3'>
                      <div className='text-xs text-gray-600 w-36'>{label}</div>
                      <div className='flex-1 bg-gray-100 rounded-full h-2 overflow-hidden'>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.2, delay: 0.5 }} className='h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full' />
                      </div>
                      <div className='text-xs font-bold text-gray-800 w-8 text-right'>{score}</div>
                    </div>
                  ))}
                </div>

                <div className='flex items-center justify-between bg-green-50 rounded-xl px-4 py-3'>
                  <span className='text-xs font-semibold text-green-700'>Total Skor CV</span>
                  <span className='text-lg font-bold text-green-600'>85/100</span>
                </div>
              </div>
              {/* Floating badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className='absolute -top-4 -right-4 bg-white shadow-lg rounded-2xl px-4 py-2 border border-gray-100'>
                <div className='text-xs font-bold text-gray-800'>📊 Analisis Mendalam</div>
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className='absolute -bottom-4 -left-4 bg-blue-600 shadow-lg rounded-2xl px-4 py-2'>
                <div className='text-xs font-bold text-white'>✅ Feedback Instan</div>
              </motion.div>
            </div>
          </div>
        </Reveal>
        <div className='text-center'>
          <Reveal delay={0.3}>
            <Link to='/login' className='inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all active:scale-95'>
              Coba Gratis <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Tips ──────────────────────────────────────────────────────────────────────
function Tips() {
  const tips = [
    { n: '1', image: '/images/cv-tip-1.png', title: 'Gunakan Struktur yang Jelas', desc: 'Susun CV dengan rapi agar mudah dibaca dan dipahami recruiter' },
    { n: '2', image: '/images/cv-tip-2.png', title: 'Tampilkan Pengalaman yang Relevan', desc: 'Fokus pada pengalaman dan skill yang sesuai dengan posisi yang dilamar' },
    { n: '3', image: '/images/cv-tip-3.png', title: 'Gunakan Kata Kunci yang Tepat', desc: 'Sesuaikan CV dengan deskripsi pekerjaan agar lebih mudah lolos seleksi' },
  ];
  return (
    <section className='py-20 bg-white'>
      <div className='max-w-6xl mx-auto px-6'>
        <Reveal>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-16' style={{ fontFamily: 'Syne, sans-serif' }}>
            3 Tips Membuat CV Anda Lebih Menarik
          </h2>
        </Reveal>

        {/* Desktop Grid */}
        <div className='hidden md:grid md:grid-cols-3 gap-8'>
          {tips.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.12}>
              <div className='flex flex-col h-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300'>
                {/* Top Line with Circle - Badge area */}
                <div className='px-6 pt-6 pb-4'>
                  <div className='flex items-center gap-3 justify-center'>
                    <div className='flex-1 h-1.5 bg-blue-600 rounded-full' />
                    <div className='w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0'>{t.n}</div>
                    <div className='flex-1 h-1.5 bg-blue-600 rounded-full' />
                  </div>
                </div>

                {/* Image Placeholder */}
                <div className='px-6 pb-6'>
                  <div className='w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-blue-100'>
                    <img src={t.image} alt={t.title} className='w-auto h-full object-contain' />
                  </div>
                </div>

                {/* Title & Description */}
                <div className='px-6 pb-6 flex-1 flex flex-col'>
                  <h3 className='font-bold text-gray-900 text-lg mb-3' style={{ fontFamily: 'Syne, sans-serif' }}>
                    {t.title}
                  </h3>
                  <p className='text-gray-600 text-sm leading-relaxed'>{t.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mobile Stack */}
        <div className='md:hidden space-y-6'>
          {tips.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.12}>
              <div className='flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-md'>
                {/* Top Line with Circle - Badge area */}
                <div className='px-5 pt-5 pb-3'>
                  <div className='flex items-center gap-2 justify-center'>
                    <div className='flex-1 h-1 bg-blue-600 rounded-full' />
                    <div className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0'>{t.n}</div>
                    <div className='flex-1 h-1 bg-blue-600 rounded-full' />
                  </div>
                </div>

                {/* Image Placeholder */}
                <div className='px-5 pb-5'>
                  <div className='w-full h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-blue-100'>
                    <img src={t.image} alt={t.title} className='w-auto h-full object-contain' />
                  </div>
                </div>

                {/* Title & Description */}
                <div className='px-5 pb-5'>
                  <h3 className='font-bold text-gray-900 text-base mb-2 text-center' style={{ fontFamily: 'Syne, sans-serif' }}>
                    {t.title}
                  </h3>
                  <p className='text-gray-600 text-sm leading-relaxed text-center'>{t.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'Apa itu fitur simulasi interview di Evalify?', a: 'Fitur ini memungkinkan Anda berlatih interview secara virtual dengan pertanyaan yang menyerupai kondisi interview kerja sebenarnya.' },
  { q: 'Bagaimana cara memulai simulasi interview?', a: 'Anda cukup memilih sesi interview, lalu mulai menjawab pertanyaan yang diberikan oleh sistem secara langsung.' },
  { q: 'Apakah saya bisa menggunakan suara saat simulasi?', a: 'Ya, Anda dapat menjawab menggunakan suara, kemudian sistem akan mengubahnya menjadi teks untuk dianalisis.' },
  { q: 'Apakah saya akan mendapatkan feedback setelah interview?', a: 'Tentu. Setelah sesi selesai, Anda akan mendapatkan feedback berbasis AI untuk membantu meningkatkan kualitas jawaban Anda.' },
  { q: 'Apakah simulasi ini cocok untuk pemula??', a: 'Ya, fitur ini dirancang untuk semua pengguna, baik pemula maupun yang sudah berpengalaman dalam menghadapi interview.' },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className='py-20 bg-white'>
      <div className='max-w-3xl mx-auto px-6'>
        <Reveal>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-12' style={{ fontFamily: 'Syne, sans-serif' }}>
            Pertanyaan yang Sering Ditanyakan
          </h2>
        </Reveal>
        <div className='space-y-3'>
          {faqs.map((f, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className='bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden'>
                <button className='w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-100 transition-colors' onClick={() => setOpen(open === i ? null : i)}>
                  <span className='font-semibold text-sm text-gray-800'>
                    {i + 1}. {f.q}
                  </span>
                  <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} className='text-gray-400 shrink-0' />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className='overflow-hidden'>
                      <p className='px-6 pb-4 text-sm text-gray-500 leading-relaxed'>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
    setContactError('');
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');

    // Validation
    if (!contactForm.name.trim()) {
      setContactError('Nama wajib diisi');
      return;
    }
    if (!contactForm.email.trim()) {
      setContactError('Email wajib diisi');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      setContactError('Format email tidak valid');
      return;
    }
    if (!contactForm.subject.trim()) {
      setContactError('Subject wajib diisi');
      return;
    }
    if (contactForm.message.length < 10) {
      setContactError('Pesan minimal 10 karakter');
      return;
    }

    setContactLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim pesan');
      }

      setContactSubmitted(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setContactSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      setContactError(error.message || 'Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <section className='py-20 bg-blue-600' id='contact'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid md:grid-cols-2 gap-12 items-start'>
          <Reveal>
            <div className='text-white'>
              <h2 className='text-3xl font-bold mb-4' style={{ fontFamily: 'Syne, sans-serif' }}>
                Hubungi Kami
              </h2>
              <p className='text-blue-100 mb-6 text-sm leading-relaxed'>Punya pertanyaan atau ingin mempelajari lebih lanjut? Kami ingin mendengar dari Anda. Kirimkan pesan kepada kami dan kami akan segera menanggapinya.</p>
              <div className='space-y-3'>
                <div>
                  <div className='text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1'>Email</div>
                  <div className='text-white text-sm'>evalifycareersolution@gmail.com</div>
                </div>
                <div>
                  <div className='text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1'>Telepon</div>
                  <div className='text-white text-sm'>+6285123456789</div>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className='bg-white rounded-3xl p-6'>
              {contactSubmitted ? (
                <div className='text-center py-8'>
                  <CheckCircle2 size={40} className='text-green-500 mx-auto mb-3' />
                  <h3 className='font-bold text-gray-900 mb-2'>Pesan Terkirim!</h3>
                  <p className='text-sm text-gray-600'>Terima kasih telah menghubungi kami. Kami akan merespons dalam waktu 24 jam.</p>
                </div>
              ) : (
                <>
                  <h3 className='font-bold text-gray-900 mb-1' style={{ fontFamily: 'Syne, sans-serif' }}>
                    Kirim Pesan Kepada Kami
                  </h3>
                  <p className='text-xs text-gray-500 mb-5'>Isi formulir di bawah ini dan kami akan segera menghubungi.</p>
                  <form onSubmit={handleContactSubmit} className='space-y-3'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='text-xs text-gray-600 font-medium block mb-1'>Nama</label>
                        <input
                          type='text'
                          name='name'
                          value={contactForm.name}
                          onChange={handleContactChange}
                          className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='Nama kamu'
                        />
                      </div>
                      <div>
                        <label className='text-xs text-gray-600 font-medium block mb-1'>Email</label>
                        <input
                          type='email'
                          name='email'
                          value={contactForm.email}
                          onChange={handleContactChange}
                          className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='email@gmail.com'
                        />
                      </div>
                    </div>
                    <div>
                      <label className='text-xs text-gray-600 font-medium block mb-1'>Subjek</label>
                      <input
                        type='text'
                        name='subject'
                        value={contactForm.subject}
                        onChange={handleContactChange}
                        className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Tentang apa pesan ini?'
                      />
                    </div>
                    <div>
                      <label className='text-xs text-gray-600 font-medium block mb-1'>Pesan</label>
                      <textarea
                        name='message'
                        value={contactForm.message}
                        onChange={handleContactChange}
                        className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                        rows={3}
                        placeholder='Tulis pesanmu...'
                      />
                    </div>
                    {contactError && <div className='text-xs text-red-500 bg-red-50 p-2 rounded'>{contactError}</div>}
                    <button
                      type='submit'
                      disabled={contactLoading}
                      className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-95'
                    >
                      {contactLoading ? 'Mengirim...' : 'Kirim Pesan'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function CVReviewLandingPage() {
  return (
    <div className='font-sans'>
      <Navbar />
      <Hero />
      <Steps />
      <FeatureBanner />
      <Tips />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
