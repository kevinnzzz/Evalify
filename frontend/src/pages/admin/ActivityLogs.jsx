import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const API_BASE =
  import.meta.env.VITE_API_GATEWAY ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://evalify-backend.vercel.app')

const ACTIVITY_COLORS = {
  register: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  login: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  interview_completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cv_review: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  admin_action: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const PERIODS = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7days', label: '7 Hari' },
  { value: '30days', label: '30 Hari' },
]

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('7days')
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const token = localStorage.getItem('evalify_token')
    const params = new URLSearchParams({ page, limit: 30, period })
    if (search) params.set('search', search)

    try {
      const res = await fetch(`${API_BASE}/api/admin/activity-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setLogs(data.logs || [])
      setPagination(data.pagination || {})
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, period])

  useEffect(() => {
    const t = setTimeout(() => fetchLogs(), search ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchLogs])

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100">Activity Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor aktivitas pengguna — {pagination.total?.toLocaleString() || 0} entri
        </p>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Cari berdasarkan nama user..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => { setPeriod(p.value); setPage(1) }}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Tipe</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Judul</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 hidden lg:table-cell">Deskripsi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded skeleton" />
                        </td>
                      ))}
                    </tr>
                  ))
                : logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{log.user.fullName}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">@{log.user.username}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            ACTIVITY_COLORS[log.activityType] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {log.activityType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">{log.title}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell max-w-xs truncate">
                        {log.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {fmtDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && logs.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              Tidak ada aktivitas ditemukan.
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
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
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
