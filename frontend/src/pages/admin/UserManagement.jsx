import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, UserCheck, UserX, Shield, User } from 'lucide-react'

const API_BASE =
  import.meta.env.VITE_API_GATEWAY ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://evalify-backend.vercel.app')

const ROLE_COLORS = {
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  user: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}
const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const token = localStorage.getItem('evalify_token')
    const params = new URLSearchParams({ page, limit: 20 })
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)

    try {
      const res = await fetch(`${API_BASE}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setUsers(data.users || [])
      setPagination(data.pagination || {})
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), search ? 400 : 0)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    setActionLoading(userId + '_status')
    const token = localStorage.getItem('evalify_token')
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(data.message)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)))
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`Ubah role user ini menjadi "${newRole}"?`)) return
    setActionLoading(userId + '_role')
    const token = localStorage.getItem('evalify_token')
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(data.message)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-green-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100">User Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola pengguna — {pagination.total?.toLocaleString() || 0} total user
        </p>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Cari nama, username, atau email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="input-field w-full sm:w-40"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
        >
          <option value="">Semua Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">Username</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 hidden lg:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 hidden xl:table-cell">Bergabung</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded skeleton" />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{user.full_name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">@{user.usernama}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                          {user.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs hidden xl:table-cell">{fmtDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusChange(user.id, user.status)}
                            disabled={!!actionLoading}
                            title={user.status === 'active' ? 'Suspend user' : 'Aktifkan user'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === 'active'
                                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                            } disabled:opacity-40`}
                          >
                            {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => handleRoleChange(user.id, user.role)}
                            disabled={!!actionLoading}
                            title={user.role === 'admin' ? 'Jadikan user biasa' : 'Jadikan admin'}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-40"
                          >
                            <Shield size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && users.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              Tidak ada user ditemukan.
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Halaman {pagination.page} dari {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
