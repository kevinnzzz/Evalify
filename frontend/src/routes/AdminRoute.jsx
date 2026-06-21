import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

/**
 * AdminRoute – Hanya bisa diakses oleh user dengan role 'admin'.
 * Jika belum login → redirect /login
 * Jika login tapi bukan admin → redirect /dashboard
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={36} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
