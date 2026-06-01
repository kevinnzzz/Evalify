import { motion } from 'framer-motion';
import { Mic2 } from 'lucide-react';

export default function InterviewSimulatorCard() {
  return (
    <div className='relative flex justify-center'>
      <div className='relative w-full max-w-md'>
        <div className='bg-white rounded-3xl shadow-2xl p-8 border border-gray-100'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center'>
                <Mic2 size={20} className='text-white' />
              </div>
              <div>
                <div className='text-sm font-bold text-gray-800'>Interview Simulator</div>
                <div className='text-xs text-green-500 flex items-center gap-1'>
                  <span className='w-1.5 h-1.5 bg-green-500 rounded-full inline-block' />
                  Sesi Aktif
                </div>
              </div>
            </div>
            <div className='bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1'>
              <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block' />
              REC
            </div>
          </div>
          <div className='space-y-3 mb-6'>
            <div className='bg-indigo-50 rounded-xl p-3'>
              <div className='text-xs text-indigo-500 mb-1'>Pertanyaan #{1}</div>
              <div className='text-sm text-gray-800 font-medium'>"Apa kelebihan dan kekurangan terbesar Anda?"</div>
            </div>
            <div className='bg-gray-50 rounded-xl p-3'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='text-xs text-gray-500'>Merekam...</div>
                <div className='flex gap-0.5 items-end h-4'>
                  {[3, 5, 4, 7, 3, 6, 4, 5, 3].map((h, i) => (
                    <motion.div key={i} animate={{ height: [`${h * 3}px`, `${(h + 3) * 3}px`, `${h * 3}px`] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }} className='w-1 bg-blue-500 rounded-full' />
                  ))}
                </div>
              </div>
              <div className='text-sm text-gray-600'>"Kelebihan saya adalah kemampuan beradaptasi..."</div>
            </div>
          </div>
          <div className='grid grid-cols-3 gap-2'>
            {[
              ['Kejelasan', 88],
              ['Relevansi', 82],
              ['Percaya Diri', 90],
            ].map(([label, score]) => (
              <div key={label} className='bg-blue-50 rounded-xl p-2 text-center'>
                <div className='text-lg font-bold text-blue-600'>{score}</div>
                <div className='text-xs text-gray-500'>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className='absolute -top-4 -right-4 bg-white shadow-lg rounded-2xl px-4 py-2 border border-gray-100'>
          <div className='text-xs font-bold text-gray-800'>🎙️ Evaluasi Suara AI</div>
        </motion.div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className='absolute -bottom-4 -left-4 bg-indigo-600 shadow-lg rounded-2xl px-4 py-2'>
          <div className='text-xs font-bold text-white'>💡 Saran Real-time</div>
        </motion.div>
      </div>
    </div>
  );
}
