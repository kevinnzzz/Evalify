import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

const API_BASE =
  import.meta.env.VITE_API_GATEWAY ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://evalify-backend.vercel.app')

const STATUS_STYLES = {
  pending: {
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    label: 'Pending',
  },
  read: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    label: 'Dibaca',
  },
  resolved: {
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    label: 'Selesai',
  },
}

const STATUS_OPTIONS = ['pending', 'read', 'resolved']

function StatusDropdown({ currentStatus, feedbackId, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = async (newStatus) => {
    if (newStatus === currentStatus) { setOpen(false); return }
    setLoading(true)
    const token = localStorage.getItem('evalify_token')
    try {
      const res = await fetch(`${API_BASE}/api/admin/feedbacks/${feedbackId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate(feedbackId, newStatus)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const style = STATUS_STYLES[currentStatus] || STATUS_STYLES.pending

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${style.badge} disabled:opacity-60`}
      >
        {loading ? '...' : style.label}
        <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[120px]">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleChange(s)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  s === currentStatus ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {STATUS_STYLES[s].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState(null)

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true)
    const token = localStorage.getItem('evalify_token')
    const params = new URLSearchParams({ page, limit: 20 })
    if (statusFilter) params.set('status', statusFilter)

    try {
      const res = await fetch(`${API_BASE}/api/admin/feedbacks?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setFeedbacks(data.feedbacks || [])
      setPagination(data.pagination || {})
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchFeedbacks() }, [fetchFeedbacks])

  const handleStatusUpdate = (id, newStatus) => {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)))
  }

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
      : '-'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100">Feedback Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola feedback pengguna — {pagination.total?.toLocaleString() || 0} total
        </p>
      </div>

      {/* Filter */}
      <div className="card flex flex-wrap gap-2">
        {[{ value: '', label: 'Semua' }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_STYLES[s].label }))].map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-24 skeleton" />
            ))
          : feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="card cursor-pointer hover:shadow-card-hover transition-shadow"
                onClick={() => setExpanded(expanded === fb.id ? null : fb.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{fb.name}</p>
                      <span className="text-gray-400 dark:text-gray-500 text-xs">{fb.email}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{fb.subject}</p>
                    {expanded !== fb.id && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{fb.message}</p>
                    )}
                    {expanded === fb.id && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">{fb.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <StatusDropdown
                      currentStatus={fb.status}
                      feedbackId={fb.id}
                      onUpdate={handleStatusUpdate}
                    />
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {fmtDate(fb.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

        {!loading && feedbacks.length === 0 && (
          <div className="card text-center py-12 text-gray-400 dark:text-gray-500">
            Tidak ada feedback ditemukan.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
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
  )
}
