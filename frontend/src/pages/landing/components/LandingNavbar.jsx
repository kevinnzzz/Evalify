import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BrainCircuit, FileText, Mic2, Menu, X } from 'lucide-react';

export default function LandingNavbar() {
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
