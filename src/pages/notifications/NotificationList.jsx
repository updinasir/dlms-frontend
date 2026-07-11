import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  Bell, Search, CheckCheck, Trash2, Archive, Info, CheckCircle2,
  AlertTriangle, AlertCircle, ChevronLeft, ChevronRight, Filter, X, Settings
} from 'lucide-react'
import {
  relativeTime, categoryStyles, priorityStyles, CATEGORIES, PRIORITIES
} from '../../utils/notifications'

const categoryIcon = (category) => {
  switch (category) {
    case 'Success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    case 'Warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
    case 'Error': return <AlertCircle className="h-5 w-5 text-rose-500" />
    default: return <Info className="h-5 w-5 text-sky-500" />
  }
}

const NotificationList = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 })
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    search: '', category: '', priority: '', readState: '', date_from: '', date_to: '', archived: false
  })
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== false) params[k] = v
      })
      const res = await api.get('/notifications/user/my-notifications', { params })
      setNotifications(res.data.notifications || [])
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0, limit: 10 })
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { load() }, [load])

  const handleOpen = async (n) => {
    try {
      if (n.is_read === 0) await api.patch(`/notifications/${n.id}/read`)
    } catch { /* ignore */ }
    navigate(`/dashboard/notifications/${n.id}`)
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      toast.success('All notifications marked as read')
      load()
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const remove = async (e, id) => {
    e.stopPropagation()
    try {
      await api.delete(`/notifications/${id}`)
      toast.success('Notification deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const archive = async (e, id) => {
    e.stopPropagation()
    try {
      await api.patch(`/notifications/${id}/archive`)
      toast.success('Notification archived')
      load()
    } catch {
      toast.error('Failed to archive')
    }
  }

  const setFilter = (key, value) => {
    setPage(1)
    setFilters((f) => ({ ...f, [key]: value }))
  }

  const clearFilters = () => {
    setPage(1)
    setFilters({ search: '', category: '', priority: '', readState: '', date_from: '', date_to: '', archived: false })
  }

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v !== '' && v !== false).length

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500">{pagination.total} total notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/notifications/preferences')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Settings className="h-4 w-4" /> Preferences
          </button>
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        </div>
      </div>

      {/* Search + filter toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search notifications..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            activeFilterCount ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Filter className="h-4 w-4" /> Filters {activeFilterCount ? `(${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
            <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">All types</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Priority</label>
            <select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
            <select value={filters.readState} onChange={(e) => setFilter('readState', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">View</label>
            <select value={filters.archived ? 'archived' : 'active'} onChange={(e) => setFilter('archived', e.target.value === 'archived')}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">From date</label>
            <input type="date" value={filters.date_from} onChange={(e) => setFilter('date_from', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">To date</label>
            <input type="date" value={filters.date_to} onChange={(e) => setFilter('date_to', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <X className="h-4 w-4" /> Clear
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Bell className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No notifications</h3>
            <p className="mt-1 text-sm text-slate-500">You are all caught up.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => {
              const style = categoryStyles[n.category] || categoryStyles.Information
              return (
                <div
                  key={n.id}
                  onClick={() => handleOpen(n)}
                  className={`flex cursor-pointer items-start gap-4 px-5 py-4 transition hover:bg-slate-50 ${n.is_read === 0 ? 'bg-primary-50/40' : ''}`}
                >
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
                    {categoryIcon(n.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {n.is_read === 0 && <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />}
                      <p className={`truncate text-sm ${n.is_read === 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{n.title}</p>
                      <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[n.priority] || priorityStyles.Medium}`}>
                        {n.priority}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{n.message}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                      <span>{relativeTime(n.created_at)}</span>
                      {n.related_module && <span className="capitalize">&middot; {n.related_module}</span>}
                      <span className="capitalize">&middot; {n.delivery_channel}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={(e) => archive(e, n.id)} title="Archive"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                      <Archive className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => remove(e, n.id)} title="Delete"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationList
