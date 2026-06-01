import { motion } from 'framer-motion'

/**
 * Reusable Card component
 */
export default function Card({ children, className = '', hover = false, ...props }) {
  const base = 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-card'

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 10px 40px -10px rgba(37, 99, 235, 0.15)' }}
        transition={{ duration: 0.2 }}
        className={`${base} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  )
}
