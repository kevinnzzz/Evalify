import { motion } from 'framer-motion'

export default function Toggle({ on, onToggle, className = '' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        on ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      } ${className}`}
    >
      <motion.span
        animate={{ x: on ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
      />
    </motion.button>
  )
}
