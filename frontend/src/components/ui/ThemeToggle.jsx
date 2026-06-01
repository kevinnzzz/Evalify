import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme()

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        dark ? 'bg-blue-600' : 'bg-gray-200'
      } ${className}`}
      aria-label="Toggle dark mode"
    >
      <motion.div
        animate={{ x: dark ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center"
      >
        {dark ? (
          <Moon size={10} className="text-blue-600" />
        ) : (
          <Sun size={10} className="text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  )
}
