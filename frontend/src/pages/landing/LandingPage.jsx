import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Mic2, Star, CheckCircle2, ArrowRight, BrainCircuit, Users, Award, Zap, MessageSquare, Shield, ChevronRight, Menu, X } from 'lucide-react';

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [layananOpen, setLayananOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setLayananOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
      <div className='max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between'>
        {/* Logo */}
        <Link to='/' className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <BrainCircuit size={18} className='text-white' />
          </div>
          <span className='font-bold text-xl text-gray-900' style={{ fontFamily: 'Syne, sans-serif' }}>
            Evalify
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-8'>
          <a href='#about' className='text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors'>
            Tentang
          </a>

          {/* Layanan dropdown */}
          <div className='relative' ref={dropRef}>
            <button onClick={() => setLayananOpen(!layananOpen)} className='flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors'>
              Layanan
              <motion.span animate={{ rotate: layananOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={16} />
              </motion.span>
            </button>
            <AnimatePresence>
              {layananOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className='absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'
                >
                  <Link to='/cv-review' onClick={() => setLayananOpen(false)} className='flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group'>
                    <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
                      <FileText size={15} className='text-blue-600' />
                    </div>
                    <div>
                      <div className='text-sm font-semibold text-gray-800'>CV Review</div>
                      <div className='text-xs text-gray-500'>Analisis CV berbasis AI</div>
                    </div>
                  </Link>
                  <div className='h-px bg-gray-100 mx-4' />
                  <Link to='/interview' onClick={() => setLayananOpen(false)} className='flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group'>
                    <div className='w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors'>
                      <Mic2 size={15} className='text-indigo-600' />
                    </div>
                    <div>
                      <div className='text-sm font-semibold text-gray-800'>Simulasi Interview</div>
                      <div className='text-xs text-gray-500'>Latihan interview AI</div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href='#contact' className='text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors'>
            Kontak
          </a>
        </div>

        {/* Right side: Login button + Mobile Hamburger */}
        <div className='flex items-center gap-3'>
          <Link to='/login' className='bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200 active:scale-95'>
            Login
          </Link>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className='flex md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors shrink-0' aria-label='Toggle menu'>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className='md:hidden bg-white border-b border-gray-100 shadow-lg overflow-hidden'
          >
            <div className='px-6 py-4 flex flex-col gap-4'>
              <a href='#about' onClick={() => setMobileMenuOpen(false)} className='text-gray-600 hover:text-blue-600 text-sm font-semibold py-1.5 transition-colors'>
                Tentang
              </a>

              <div className='h-px bg-gray-100' />

              <div className='flex flex-col gap-2'>
                <span className='text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1'>Layanan</span>
                <Link to='/cv-review' onClick={() => setMobileMenuOpen(false)} className='flex items-center gap-3 py-2 text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors'>
                  <FileText size={16} className='text-blue-600' />
                  CV Review
                </Link>
                <Link to='/interview' onClick={() => setMobileMenuOpen(false)} className='flex items-center gap-3 py-2 text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors'>
                  <Mic2 size={16} className='text-indigo-600' />
                  Simulasi Interview
                </Link>
              </div>

              <div className='h-px bg-gray-100' />

              <a href='#contact' onClick={() => setMobileMenuOpen(false)} className='text-gray-600 hover:text-blue-600 text-sm font-semibold py-1.5 transition-colors'>
                Kontak
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

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
        {/* Mobile: Judul dulu */}
        <motion.div className='md:hidden order-1 flex flex-col items-center' initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className='flex justify-center items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4'>
            <Zap size={12} />
            Platform Karier Berbasis AI
          </div>
          <h1 className='text-3xl font-bold text-gray-900 leading-tight mb-4 text-center' style={{ fontFamily: 'Syne, sans-serif' }}>
            Tingkatkan
            <br />
            Dan Persiapkan
            <br />
            <span className='text-blue-600'>Karir Masa Depan</span>
            <br />
            Anda
          </h1>
        </motion.div>

        {/* Mobile: Gambar di tengah */}
        <motion.div className='md:hidden order-2 relative flex justify-center' initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
          <img src='/images/main-illustration.png' alt='Illustration' className='w-full max-w-[300px]' />
        </motion.div>

        {/* Mobile: Deskripsi & Buttons */}
        <motion.div className='md:hidden order-3' initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
          <p className='text-gray-500 text-sm leading-relaxed mb-6 text-center'>Latih kemampuan Anda melalui simulasi interview berbasis AI dengan evaluasi otomatis dan real-time.</p>
          <div className='flex flex-col gap-3 mb-8'>
            <Link to='/login' className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2'>
              Mulai Sekarang <ArrowRight size={16} />
            </Link>
            <a href='#about' className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center justify-center gap-1 border border-blue-600 rounded-xl py-2.5'>
              Pelajari lebih <ChevronRight size={15} />
            </a>
          </div>
          <div className='flex justify-center gap-3'>
            {[
              ['500+', 'Pengguna Aktif'],
              ['98%', 'Tingkat Kepuasan'],
              ['24/7', 'Akses Platform'],
            ].map(([v, l]) => (
              <div key={l} className='text-center'>
                <div className='text-lg font-bold text-gray-900'>{v}</div>
                <div className='text-xs text-gray-500'>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Desktop: Left side text */}
        <motion.div className='hidden md:block' initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className='inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6'>
            <Zap size={12} />
            Platform Karier Berbasis AI
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5' style={{ fontFamily: 'Syne, sans-serif' }}>
            Tingkatkan Dan Persiapkan
            <br />
            <span className='text-blue-600'>Karir Masa Depan Anda</span>
          </h1>
          <p className='text-gray-500 text-base leading-relaxed mb-8 max-w-md'>Latih kemampuan Anda melalui simulasi interview berbasis AI dengan evaluasi otomatis dan real-time.</p>
          <div className='flex items-center gap-4'>
            <Link to='/login' className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2'>
              Mulai Sekarang <ArrowRight size={16} />
            </Link>
            <a href='#about' className='text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors flex items-center gap-1'>
              Pelajari lebih <ChevronRight size={15} />
            </a>
          </div>
          <div className='flex items-center gap-6 mt-10'>
            {[
              ['500+', 'Pengguna Aktif'],
              ['98%', 'Tingkat Kepuasan'],
              ['24/7', 'Akses Platform'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className='text-xl font-bold text-gray-900'>{v}</div>
                <div className='text-xs text-gray-500'>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Desktop: Right side image */}
        <motion.div className='hidden md:block relative flex justify-center' initial={{ opacity: 0, scale: 0.9, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
          <img src='/images/main-illustration.png' alt='Illustration' className='w-full max-w-md' />
        </motion.div>
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section className='py-5 md:py-20 bg-white' id='about'>
      <div className='max-w-6xl mx-auto px-6'>
        <Reveal>
          <p className='text-center text-gray-500 text-sm mb-10'>
            Belum yakin dengan kesiapan karier Anda?
            <br />
            <span className='font-semibold text-gray-700'>Tenang, ada Evalify</span>
          </p>
        </Reveal>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <Reveal delay={0.1}>
            <motion.div initial={{ opacity: 0, scale: 0.9, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className='relative flex justify-center'>
              <img src='/images/about-evalify.png' alt='Illustration' className='w-full max-w-md' />
            </motion.div>
          </Reveal>
          <Reveal delay={0.15}>
            <div>
              <h2 className='text-center md:text-left text-3xl font-bold text-gray-900 mb-4 ' style={{ fontFamily: 'Syne, sans-serif' }}>
                Tentang Evalify
              </h2>
              <p className='text-gray-500 text-sm leading-relaxed mb-6'>Evalify adalah platform berbasis AI yang membantu Anda mempersiapkan karier lebih efektif melalui evaluasi CV dan simulasi interview secara otomatis.</p>
              <div className='space-y-3'>
                {['Analisis CV mendalam dengan teknologi AI terkini', 'Simulasi interview realistis berbasis pertanyaan industri', 'Feedback instan dan actionable untuk perbaikan'].map((p) => (
                  <div key={p} className='flex items-start gap-3'>
                    <CheckCircle2 size={16} className='text-blue-600 mt-0.5 shrink-0' />
                    <span className='text-sm text-gray-600'>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Solusi ────────────────────────────────────────────────────────────────────
function Solusi() {
  return (
    <section className='py-6 md:py-20 bg-gray-50'>
      <div className='max-w-6xl mx-auto px-6'>
        <Reveal>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-12' style={{ fontFamily: 'Syne, sans-serif' }}>
            Solusi Kami
          </h2>
        </Reveal>
        <div className='grid md:grid-cols-2 gap-8'>
          {[
            {
              image: '/images/cv-illustration.png',
              title: 'CV Review',
              subtitle: 'Buat CV Anda lebih menarik di mata recruiter',
              desc: 'Belum yakin dengan CV Anda? Biarkan AI membantu mengevaluasi dan memperbaikinya',
              cta: 'Coba Sekarang',
              to: '/cv-review',
            },
            {
              image: '/images/interview-illustration.png',
              title: 'Interview Simulation',
              subtitle: 'Persiapkan diri anda untuk sukses interview',
              desc: 'Sudah siapkah anda untuk mengikuti interview secara nyata? Biarkan AI membantu mempersiapkan anda.',
              cta: 'Coba Sekarang',
              to: '/interview',
            },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className='bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full'>
                {/* Image Container */}
                <div className='w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-4'>
                  <img src={s.image} alt={s.title} className='object-contain' style={{ maxWidth: '200', maxHeight: '200px' }} />
                </div>

                {/* Content Container */}
                <div className='p-8 flex flex-col flex-grow'>
                  <h3 className='font-bold text-2xl text-gray-900 mb-2' style={{ fontFamily: 'Syne, sans-serif' }}>
                    {s.title}
                  </h3>
                  <p className='text-gray-700 text-sm font-semibold mb-4 text-justify'>{s.subtitle}</p>
                  <p className='text-gray-500 text-sm leading-relaxed mb-6 flex-grow text-justify'>{s.desc}</p>
                  <Link to={s.to} className='w-fit inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all active:scale-95'>
                    {s.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Benefits ──────────────────────────────────────────────────────────────────
function Benefits() {
  const items = [
    'Mengetahui kekurangan dari CV Anda secara lebih jelas',
    'Lebih siap dan percaya diri saat menghadapi interview',
    'Meningkatkan peluang diterima kerja',
    'Latihan secara fleksibel kapan saja tanpa batasan waktu',
    'Mendapatkan feedback berbasis AI secara otomatis dan objektif',
  ];
  return (
    <section className='py-10 md:py-20 bg-white'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <Reveal>
            <div>
              <h2 className='text-center md:text-left text-3xl font-bold text-gray-900 mb-8' style={{ fontFamily: 'Syne, sans-serif' }}>
                Dapatkan Persiapan Karier yang Lebih Matang dan Percaya Diri
              </h2>
              <div className='space-y-4'>
                {items.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }} viewport={{ once: true }} className='flex items-start gap-3'>
                    <CheckCircle2 size={18} className='text-blue-600 mt-0.5 shrink-0' />
                    <span className='text-sm text-gray-600'>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className='bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white'>
              <div className='text-4xl mb-4'>🚀</div>
              <h3 className='font-bold text-xl mb-3' style={{ fontFamily: 'Syne, sans-serif' }}>
                Siap Memulai?
              </h3>
              <p className='text-blue-100 text-sm leading-relaxed mb-6'>Bergabung dengan ribuan pengguna yang sudah mempersiapkan karier mereka dengan Evalify.</p>
              <Link to='/login' className='inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-all active:scale-95'>
                Daftar Gratis <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials – infinite carousel ─────────────────────────────────────────
const testimonialsRow1 = [
  { name: 'Rina', role: 'Mahasiswi', text: 'Evalify membantu saya latihan interview tanpa takut salah. Feedback-nya sangat membantu.' },
  { name: 'Budi', role: 'Fresh Graduate', text: 'Simulasi interviewnya sangat realistis. Saya jadi jauh lebih percaya diri.' },
  { name: 'Sari', role: 'Job Seeker', text: 'CV saya langsung dapat feedback detail. Alhamdulillah diterima kerja!' },
  { name: 'Dian', role: 'Profesional', text: 'Platform terbaik untuk persiapan karier. Sangat direkomendasikan!' },
  { name: 'Adit', role: 'Mahasiswa', text: 'AI-nya pintar banget. Pertanyaannya relevan dan feedbacknya akurat.' },
  { name: 'Nisa', role: 'Freelancer', text: 'Mudah digunakan dan hasilnya langsung terlihat. Top banget!' },
];
const testimonialsRow2 = [
  { name: 'Reza', role: 'Engineer', text: 'Latihan interview jadi menyenangkan. Skor saya meningkat drastis setelah pakai Evalify.' },
  { name: 'Maya', role: 'Designer', text: 'Review CV-nya detail sekali. Membantu saya tahu kekurangan yang tidak saya sadari.' },
  { name: 'Hendra', role: 'Manager', text: 'Solusi cerdas untuk persiapan karier. Fiturnya lengkap dan mudah dipahami.' },
  { name: 'Fitri', role: 'Guru', text: 'Sangat membantu meski bukan dari background tech. Antarmukanya ramah pengguna.' },
  { name: 'Galih', role: 'Startup Founder', text: 'Kami rekomendasikan Evalify ke semua tim untuk persiapan presentasi.' },
  { name: 'Putri', role: 'Content Creator', text: 'Evalify membantu saya tampil lebih profesional di wawancara pertama saya!' },
];

function TestimonialCard({ t }) {
  return (
    <div className='flex-shrink-0 w-64 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mx-2'>
      <div className='flex items-center gap-3 mb-3'>
        <div className='w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>{t.name[0]}</div>
        <div>
          <div className='text-sm font-bold text-gray-800'>{t.name}</div>
          <div className='text-xs text-gray-500'>{t.role}</div>
        </div>
      </div>
      <div className='flex gap-0.5 mb-2'>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={10} className='fill-yellow-400 text-yellow-400' />
        ))}
      </div>
      <p className='text-xs text-gray-600 leading-relaxed'>"{t.text}"</p>
    </div>
  );
}

function InfiniteCarousel({ items, direction = 'left' }) {
  const doubled = [...items, ...items];
  const duration = items.length * 4;
  return (
    <div className='overflow-hidden w-full'>
      <motion.div className='flex' animate={{ x: direction === 'left' ? [0, -items.length * 272] : [-items.length * 272, 0] }} transition={{ duration, repeat: Infinity, ease: 'linear' }}>
        {doubled.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </motion.div>
    </div>
  );
}

function Testimonials() {
  return (
    <section className='py-20 bg-blue-600 overflow-hidden' id='testimonials'>
      <Reveal>
        <h2 className='text-3xl font-bold text-center text-white mb-12' style={{ fontFamily: 'Syne, sans-serif' }}>
          Apa Kata Mereka?
        </h2>
      </Reveal>
      <div className='space-y-4'>
        <InfiniteCarousel items={testimonialsRow1} direction='left' />
        <InfiniteCarousel items={testimonialsRow2} direction='right' />
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'Apa itu Evalify?',
    a: 'Evalify adalah platform berbasis AI yang dirancang untuk membantu Anda mempersiapkan karier dengan lebih efektif melalui evaluasi CV dan simulasi interview. Platform ini memberikan feedback instan dan terstruktur untuk meningkatkan peluang kesuksesan Anda.',
  },
  {
    q: 'Fitur apa saja yang tersedia di Evalify?',
    a: 'Evalify menyediakan dua fitur utama: CV Review untuk menganalisis dan memperbaiki CV Anda, serta Interview Simulation untuk berlatih interview dengan pertanyaan yang realistis dan mendapatkan feedback dari AI.',
  },
  {
    q: 'Bagaimana cara menggunakan Evalify?',
    a: 'Cukup daftar akun, pilih fitur yang ingin Anda gunakan (CV Review atau Interview Simulation), upload atau mulai simulasi, dan AI akan memberikan evaluasi mendalam beserta rekomendasi perbaikan.',
  },
  { q: 'Apakah data saya aman di Evalify?', a: 'Ya, kami mengutamakan keamanan data Anda. Semua data diproses secara aman dan hanya digunakan untuk keperluan analisis. Data Anda tidak akan dibagikan kepada pihak ketiga tanpa izin Anda.' },
  { q: 'Berapa biaya untuk menggunakan Evalify?', a: 'Anda dapat memulai dengan gratis dan mengakses fitur-fitur dasar. Untuk fitur premium dengan analisis yang lebih mendalam, tersedia paket berlangganan dengan harga yang terjangkau.' },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className='py-20 bg-gray-50'>
      <div className='max-w-3xl mx-auto px-6'>
        <Reveal>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-12' style={{ fontFamily: 'Syne, sans-serif' }}>
            Pertanyaan yang Sering Ditanyakan
          </h2>
        </Reveal>
        <div className='space-y-3'>
          {faqs.map((f, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
                <button className='w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors' onClick={() => setOpen(open === i ? null : i)}>
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
    <section className='py-10 md:py-20 bg-blue-600' id='contact'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid md:grid-cols-2 gap-12 items-start'>
          <Reveal>
            <div className='text-white'>
              <h2 className='text-center md:text-left text-3xl font-bold mb-4' style={{ fontFamily: 'Syne, sans-serif' }}>
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
                    <button type='submit' disabled={contactLoading} className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-95'>
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

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const links = ['Home', 'Tentang', 'Solusi Kami', 'FAQ'];
  return (
    <footer className='bg-gray-900 text-gray-400 py-12'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-10'>
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3'>Quick Links</div>
              <ul className='space-y-2'>
                {links.map((l) => (
                  <li key={l}>
                    <a href='#' className='text-sm hover:text-white transition-colors'>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <BrainCircuit size={16} className='text-white' />
              </div>
              <span className='font-bold text-white' style={{ fontFamily: 'Syne, sans-serif' }}>
                Evalify
              </span>
            </div>
            <div className='text-xs text-gray-500 mb-3'>Ikuti Kami</div>
            <div className='flex gap-2'>
              {['f', 'in', 't', 'ig'].map((s) => (
                <div key={s} className='w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors text-xs font-bold text-gray-400 hover:text-white'>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='border-t border-gray-800 pt-6 text-center text-xs text-gray-600'>© 2026 Evalify. All rights reserved.</div>
      </div>
    </footer>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className='font-sans'>
      <Navbar />
      <Hero />
      <About />
      <Solusi />
      <Benefits />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
