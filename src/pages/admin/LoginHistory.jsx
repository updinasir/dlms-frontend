import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  Search, Filter, ChevronLeft, ChevronRight, Download, Printer, RefreshCw,
  LogIn, Monitor, Globe, MapPin, Clock, ShieldCheck, ShieldAlert
} from 'lucide-react'

const LoginHistory = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({ search: '', status: '', from_date: '', to_date: '' })

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
      const res = await api.get('/audit-logs/login-history', { params })
      setLogs(res.data.logs || [])
      setPagination(res.data.pagination || {})
    } catch {
      toast.error('Failed to load login history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const applyFilters = (e) => {
    e?.preventDefault()
    if (page !== 1) setPage(1)
    else fetchLogs()
  }

  const resetFilters = () => {
    setFilters({ search: '', status: '', from_date: '', to_date: '' })
    if (page !== 1) setPage(1)
    else fetchLogs()
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '—'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <LogIn className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Login History</h1>
            <p className="text-sm text-slate-500">Login/logout records with device, location and session details.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLogs} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </div>

      <form onSubmit={applyFilters} className="card print:hidden">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, email, IP..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
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

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Login Time</th>
                <th className="px-5 py-3">Logout Time</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Device / OS</th>
                <th className="px-5 py-3">IP Address</th>
                <th className="px-5 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                  Loading...
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400">No login records found.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.login_id || log.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{log.user_name || 'Unknown'}</p>
                      {log.user_email && <p className="text-xs text-slate-400">{log.user_email}</p>}
                    </td>
                    <td className="px-5 py-3">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600"><ShieldCheck className="h-3 w-3" /> Success</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600"><ShieldAlert className="h-3 w-3" /> Failed</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDate(log.login_time)}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDate(log.logout_time)}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDuration(log.session_duration)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Monitor className="h-3.5 w-3.5 text-slate-400" />
                        <span>{log.device_type || 'N/A'} · {log.os || 'N/A'}</span>
                      </div>
                      <p className="ml-5 text-[11px] text-slate-400">{log.browser || ''}</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{log.ip_address || log.public_ip || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {[log.city, log.country].filter(Boolean).join(', ') || '—'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 print:hidden">
            <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages} · {pagination.total} records</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginHistory
