import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

export default function LandingFooter() {
  const links = ['Home', 'Tentang', 'Solusi Kami', 'FAQ'];
  const services = [
    { name: 'CV Review', path: '/CVReviewLandingPage' },
    { name: 'Simulasi Interview', path: '/InterviewLandingPage' },
  ];

  return (
    <footer className='bg-gray-900 text-gray-400 py-12'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='flex justify-center gap-16 mb-10'>
          <div>
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
          <div>
            <div className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3'>Layanan</div>
            <ul className='space-y-2'>
              {services.map((service) => (
                <li key={service.name}>
                  <Link to={service.path} className='text-sm hover:text-white transition-colors'>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
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
            <div className='flex gap-2 justify-center'>
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
