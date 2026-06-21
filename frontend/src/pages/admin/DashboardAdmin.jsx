import { useState, useEffect } from 'react'
import {
  Users,
  FileText,
  Mic2,
  MessageSquare,
  Activity,
  UserPlus,
  TrendingUp,
} from 'lucide-react'

const API_BASE =
  import.meta.env.VITE_API_GATEWAY ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://evalify-backend.vercel.app')

function StatCard({ icon: Icon, label, value, color = 'blue', loading }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        {loading ? (
          <div className="h-7 w-16 rounded skeleton mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value?.toLocaleString() ?? '-'}</p>
        )}
      </div>
    </div>
  )
}

function MiniBarChart({ data = [], label, color = '#3b82f6' }) {
  if (!data.length) return null
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">{label}</p>
      <div className="flex items-end gap-1 h-24">
        {data.map((d, i) => {
          const height = max === 0 ? 0 : Math.max((d.count / max) * 100, d.count > 0 ? 8 : 0)
          const dayLabel = new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' })
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1" title={`${d.date}: ${d.count}`}>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{ height: `${height}%`, backgroundColor: color, minHeight: d.count > 0 ? '4px' : '0' }}
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{dayLabel}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('evalify_token')
    fetch(`${API_BASE}/api/admin/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setStats(data)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const summary = stats?.summary || {}
  const charts = stats?.charts || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Statistik sistem Evalify secara keseluruhan
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total User" value={summary.totalUsers} color="blue" loading={loading} />
        <StatCard icon={FileText} label="Total CV Review" value={summary.totalCvReviews} color="green" loading={loading} />
        <StatCard icon={Mic2} label="Total Mock Interview" value={summary.totalInterviews} color="purple" loading={loading} />
        <StatCard icon={MessageSquare} label="Total Feedback" value={summary.totalFeedbacks} color="orange" loading={loading} />
        <StatCard icon={Activity} label="Aktivitas Hari Ini" value={summary.activityToday} color="teal" loading={loading} />
        <StatCard icon={UserPlus} label="User Baru Minggu Ini" value={summary.newUsersThisWeek} color="indigo" loading={loading} />
      </div>

      {/* Charts */}
      {!loading && charts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-green-500" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">CV Review (7 hari)</h3>
            </div>
            <MiniBarChart data={charts.cvReviews} label="" color="#22c55e" />
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Interview (7 hari)</h3>
            </div>
            <MiniBarChart data={charts.interviews} label="" color="#a855f7" />
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Aktivitas User (7 hari)</h3>
            </div>
            <MiniBarChart data={charts.activity} label="" color="#3b82f6" />
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-40 skeleton" />
          ))}
        </div>
      )}
    </div>
  )
}
