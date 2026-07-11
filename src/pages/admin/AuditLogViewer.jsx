import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  Shield, Search, Calendar, User, Database, Activity,
  ChevronLeft, ChevronRight, Filter, Clock, Eye
} from 'lucide-react'

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ actionStats: [], tableStats: [], todayCount: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    search: '',
    table_name: '',
    action_performed: '',
    from_date: '',
    to_date: '',
  })

  const fetchLogs = async (currentPage = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage)
      params.append('limit', 15)
      if (filters.search) params.append('search', filters.search)
      if (filters.table_name) params.append('table_name', filters.table_name)
      if (filters.action_performed) params.append('action_performed', filters.action_performed)
      if (filters.from_date) params.append('from_date', filters.from_date)
      if (filters.to_date) params.append('to_date', filters.to_date)

      const [logsRes, statsRes] = await Promise.all([
        api.get(`/audit-logs?${params}`),
        api.get('/audit-logs/stats')
      ])

      setLogs(logsRes.data.logs || [])
      setPagination(logsRes.data.pagination || {})
      setStats(statsRes.data)
    } catch (error) {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const applyFilters = () => {
    setPage(1)
    fetchLogs(1)
  }

  const resetFilters = () => {
    setFilters({ search: '', table_name: '', action_performed: '', from_date: '', to_date: '' })
    setPage(1)
    fetchLogs(1)
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    return date.toLocaleString([], {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getActionColor = (action) => {
    const colors = {
      POST: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      PUT: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
      PATCH: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      DELETE: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
      GET: 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
    }
    return colors[action] || colors.GET
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-600" />
          Audit Log Viewer
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review all system actions performed by users. Track changes, deletions, and data modifications.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-900">{stats.todayCount || 0}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Today Actions</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-900">{stats.tableStats?.length || 0}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Tables Affected</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Database className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-900">{pagination.total || 0}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Total Logs</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="User, action, or table..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Table</label>
            <select
              name="table_name"
              value={filters.table_name}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">All tables</option>
              <option value="drivers">Drivers</option>
              <option value="licenses">Licenses</option>
              <option value="exams">Exams</option>
              <option value="payments">Payments</option>
              <option value="users">Users</option>
              <option value="appointments">Appointments</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Action</label>
            <select
              name="action_performed"
              value={filters.action_performed}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">All actions</option>
              <option value="POST">Create (POST)</option>
              <option value="PUT">Update (PUT)</option>
              <option value="PATCH">Modify (PATCH)</option>
              <option value="DELETE">Delete (DELETE)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">From</label>
            <input
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">To</label>
            <input
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <button
            onClick={applyFilters}
            className="btn btn-primary"
          >
            <Filter className="w-4 h-4 inline mr-1" />
            Filter
          </button>
          <button
            onClick={resetFilters}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Eye className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold">No audit logs found</p>
            <p className="text-sm mt-1">Actions will appear here once users perform create, update, or delete operations.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Table</th>
                    <th className="px-5 py-3.5">Record ID</th>
                    <th className="px-5 py-3.5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr
                      key={log.audit_log_id || log.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{log.audit_log_id || log.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900">{log.user_name || 'System'}</span>
                          </div>
                          {log.user_email && (
                            <p className="text-xs text-slate-400 ml-6">{log.user_email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${getActionColor(log.action_performed)}`}>
                          {log.action_performed}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-slate-400" />
                          <span className="capitalize text-slate-700">{log.table_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{log.record_id || 'â€”'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(log.action_time)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page >= pagination.pages}
                    className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  )
}

export default AuditLogViewer

