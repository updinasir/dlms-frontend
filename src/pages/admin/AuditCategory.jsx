import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  Search, Filter, ChevronLeft, ChevronRight, Download, Printer, RefreshCw,
  User, Database, Clock, Calendar, Eye, Shield, Globe, FileText, CreditCard,
  DollarSign, GraduationCap, Car, Bell, Layers, ServerCog, Bug, Tag, Settings,
  CheckCircle, XCircle, AlertCircle, Info, ArrowRight
} from 'lucide-react'
import { getAuditCategory } from '../../config/auditCategories'

const ACTION_LABELS = { POST: 'Created', PUT: 'Updated', PATCH: 'Modified', DELETE: 'Deleted', GET: 'Viewed', LOGIN: 'Login', LOGOUT: 'Logout' }

const actionBadge = (action) => {
  const colors = {
    POST: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PUT: 'bg-blue-100 text-blue-700 border-blue-200',
    PATCH: 'bg-amber-100 text-amber-700 border-amber-200',
    DELETE: 'bg-rose-100 text-rose-700 border-rose-200',
    GET: 'bg-slate-100 text-slate-700 border-slate-200',
    LOGIN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    LOGOUT: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return colors[action] || 'bg-slate-100 text-slate-700 border-slate-200'
}

const getModuleIcon = (module) => {
  const icons = {
    users: User,
    drivers: User,
    licenses: CreditCard,
    payments: DollarSign,
    appointments: Calendar,
    exams: GraduationCap,
    documents: FileText,
    services: Tag,
    notifications: Bell,
    system: ServerCog,
    security: Shield,
    api: Globe,
    error: Bug,
    default: Database
  }
  return icons[module?.toLowerCase()] || icons.default
}

const getStatusIcon = (status) => {
  if (status === 'success') return <CheckCircle className="h-4 w-4 text-emerald-600" />
  if (status === 'failed') return <XCircle className="h-4 w-4 text-rose-600" />
  return <AlertCircle className="h-4 w-4 text-amber-600" />
}

const AuditCategory = () => {
  const { category } = useParams()
  const navigate = useNavigate()
  const config = useMemo(() => getAuditCategory(category), [category])

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({ search: '', action_performed: '', status: '', from_date: '', to_date: '' })

  const fetchLogs = async () => {
    if (!config) return
    setLoading(true)
    try {
      const params = { page, limit: 20, ...(config.filters || {}) }
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
      const res = await api.get('/audit-logs', { params })
      setLogs(res.data.logs || [])
      setPagination(res.data.pagination || {})
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setFilters({ search: '', action_performed: '', status: '', from_date: '', to_date: '' })
  }, [category])

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page])

  const applyFilters = (e) => {
    e?.preventDefault()
    if (page !== 1) setPage(1)
    else fetchLogs()
  }

  const resetFilters = () => {
    setFilters({ search: '', action_performed: '', status: '', from_date: '', to_date: '' })
    if (page !== 1) setPage(1)
    else fetchLogs()
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const exportCsv = () => {
    if (!logs.length) return toast.error('Nothing to export')
    const headers = ['Log ID', 'User', 'Email', 'Action', 'Module', 'Table', 'Record ID', 'Status', 'IP Address', 'Date']
    const rows = logs.map((l) => [
      l.log_id, l.user_name || 'System', l.user_email || '', ACTION_LABELS[l.action_performed] || l.action_performed,
      l.module || '', l.table_name || '', l.record_id || '', l.status || '', l.ip_address || '', formatDate(l.action_time)
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-${category}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!config) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="font-semibold">Unknown audit category</p>
        <button onClick={() => navigate('/dashboard/admin/audit-logs')} className="mt-3 text-sm font-semibold text-primary-600">Back to Audit Logs</button>
      </div>
    )
  }

  const Icon = config.icon
  const isApi = config.columns === 'api'

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{config.name}</h1>
            <p className="text-sm text-slate-500">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLogs} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      {/* Tracked chips */}
      {config.tracked?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 print:hidden">
          {config.tracked.map((t) => (
            <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{t}</span>
          ))}
        </div>
      )}

      {/* Filters */}
      <form onSubmit={applyFilters} className="card print:hidden">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, action, table..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <select
            value={filters.action_performed}
            onChange={(e) => setFilters({ ...filters, action_performed: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">All Actions</option>
            <option value="POST">Created</option>
            <option value="PUT">Updated</option>
            <option value="PATCH">Modified</option>
            <option value="DELETE">Deleted</option>
            <option value="GET">Viewed</option>
          </select>
          <input type="date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100" />
          <input type="date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-700">
            <Filter className="h-3.5 w-3.5" /> Apply Filters
          </button>
          <button type="button" onClick={resetFilters} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Reset</button>
        </div>
      </form>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Action</th>
                {isApi ? <th className="px-5 py-4">Endpoint</th> : <th className="px-5 py-4">Module / Table</th>}
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">IP Address</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                  <span className="font-medium">Loading...</span>
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-600">
                  <div className="flex flex-col items-center gap-2">
                    <Info className="h-8 w-8 text-slate-400 mx-auto" />
                    <span className="font-medium">No records found for this category.</span>
                  </div>
                </td></tr>
              ) : (
                logs.map((log) => {
                  const ModuleIcon = getModuleIcon(log.module || log.table_name)
                  return (
                    <tr
                      key={log.log_id}
                      onClick={() => navigate(`/dashboard/admin/audit-logs/${log.log_id}`)}
                      className="cursor-pointer transition hover:bg-slate-50 border-b border-slate-50 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          #{log.log_id}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 ring-2 ring-blue-100">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{log.user_name || 'System'}</p>
                            {log.user_email && <p className="text-xs text-slate-600">{log.user_email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${actionBadge(log.action_performed)}`}>
                          {ACTION_LABELS[log.action_performed] || log.action_performed}
                        </span>
                      </td>
                      {isApi ? (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-slate-500" />
                            <span className="font-mono text-xs font-medium text-slate-700">/api/{log.module || log.table_name}</span>
                          </div>
                        </td>
                      ) : (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 ring-1 ring-slate-200">
                              <ModuleIcon className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-slate-700 capitalize">{log.module || log.table_name || 'N/A'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="font-medium text-slate-700 capitalize">{log.status || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{log.ip_address || '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span className="font-medium text-xs">{formatDate(log.action_time)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 hover:from-primary-100 hover:to-primary-200 transition-all shadow-sm hover:shadow-md">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 print:hidden">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total} records
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditCategory
