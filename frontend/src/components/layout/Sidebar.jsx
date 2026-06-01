import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Mic2,
  MessageSquare,
  Settings,
  LogOut,
  X,
  BrainCircuit,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { fmt } from '../../utils/helpers'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/dashboard/review-cv', label: 'Review CV', icon: FileText },
  { to: '/dashboard/interview', label: 'Interview', icon: Mic2 },
  { to: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
]

export default function Sidebar({ mobile = false, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [logoutModal, setLogoutModal] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setLogoutModal(false)
  }

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-6">
        <button
          onClick={() => {
            navigate('/')
            if (mobile) onClose()
          }}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Go to home"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <span className="font-display text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            Evalify
          </span>
        </button>
        {mobile && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-700 pt-3">
        <NavLink
          to="/dashboard/settings"
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={18} />
          <span>Setting</span>
        </NavLink>

        <button
          onClick={() => setLogoutModal(true)}
          className="sidebar-link w-full text-left hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Modal */}
      <Modal open={logoutModal} onClose={() => setLogoutModal(false)} title="Confirm Logout" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to log out of your Evalify account?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Modal>
    </div>
  )

  if (mobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 z-40 shadow-xl"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 fixed inset-y-0 left-0 z-30">
      {content}
    </aside>
  )
}
