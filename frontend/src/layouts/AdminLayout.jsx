import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Activity,
  MessageSquare,
  LogOut,
  BrainCircuit,
  X,
  Menu,
  Shield,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/activity-logs', label: 'Activity Logs', icon: Activity },
  { to: '/admin/feedbacks', label: 'Feedbacks', icon: MessageSquare },
]

function AdminSidebar({ mobile = false, onClose }) {
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
      {/* Logo + Admin Badge */}
      <div className="flex items-center justify-between px-5 py-6">
        <button
          onClick={() => { navigate('/'); if (mobile) onClose() }}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
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
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Admin badge */}
      <div className="mx-4 mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-2">
        <Shield size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="px-3 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-700 pt-3">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Logged in as</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
            {user?.fullName || user?.email}
          </p>
        </div>
        <button
          onClick={() => setLogoutModal(true)}
          className="sidebar-link w-full text-left hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <Modal open={logoutModal} onClose={() => setLogoutModal(false)} title="Confirm Logout" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to log out?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setLogoutModal(false)}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={handleLogout}>Logout</Button>
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

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <AdminSidebar />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <AdminSidebar mobile onClose={() => setMobileOpen(false)} />
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:ml-56 lg:ml-64 min-h-screen">
        {/* Topbar mobile */}
        <header className="md:hidden h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-blue-600 dark:text-blue-400">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
