import { Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'
import { fmt } from '../../utils/helpers'

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between">
      {/* Left: hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Spacer on desktop */}
      <div className="hidden md:block" />

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold select-none">
            {fmt.initials(user?.fullName || 'U')}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
              {user?.fullName?.split(' ')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
