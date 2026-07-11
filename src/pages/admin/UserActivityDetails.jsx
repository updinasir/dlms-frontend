import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  ChevronLeft, Calendar, User, Clock, Activity, Database, Eye, FileText,
  Globe, Monitor, Smartphone, Mail, Phone, CheckCircle2, XCircle, AlertTriangle,
  Printer, Filter, Search, LayoutDashboard, Shield, CreditCard, HardDrive,
  MapPin, Settings, Server, Download, Bell, LogIn, LogOut,
  FileDigit, PenTool, Ban, PrinterIcon, FileCheck, StickyNote, Flag
} from 'lucide-react'

const UserActivityDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedLog, setSelectedLog] = useState(null)
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    action: '',
    status: '',
    search: ''
  })

  const roleLabels = { 1: 'Super Admin', 2: 'Admin', 3: 'Examiner', 4: 'Staff', 5: 'Cashier', 6: 'Driver' }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.from_date) params.append('from_date', filters.from_date)
      if (filters.to_date) params.append('to_date', filters.to_date)
      if (filters.action) params.append('action', filters.action)
      if (filters.status) params.append('status', filters.status)
      const res = await api.get(`/users/${id}/activity?${params}`)
      setData(res.data)
      if (res.data.auditLogs?.length) {
        setSelectedLog(res.data.auditLogs[0])
      }
    } catch (error) {
      toast.error('Failed to load user activity details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id, filters.from_date, filters.to_date, filters.action, filters.status])

  const formatDate = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatTimeOnly = (value) => {
    if (!value) return ''
    const date = new Date(value)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '—'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  const filteredLogs = useMemo(() => {
    if (!data?.auditLogs) return []
    let logs = [...data.auditLogs]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      logs = logs.filter(l =>
        (l.description || '').toLowerCase().includes(q) ||
        (l.module || '').toLowerCase().includes(q) ||
        (l.table_name || '').toLowerCase().includes(q) ||
        (l.action_performed || '').toLowerCase().includes(q)
      )
    }
    return logs
  }, [data?.auditLogs, filters.search])

  const logsByCategory = useMemo(() => {
    const all = filteredLogs
    const licenses = all.filter(l => /license|driver|driving|vehicle|renewal|suspension|revocation|approval|printed/i.test((l.module || l.table_name || '')))
    const payments = all.filter(l => /payment|receipt|refund|invoice|transaction|cash/i.test((l.module || l.table_name || '')))
    const documents = all.filter(l => /document|file|upload|download|pdf|image|scan/i.test((l.module || l.table_name || '')))
    const reports = all.filter(l => /report|analytics|statistics|export|print/i.test((l.module || l.table_name || '')))
    const system = all.filter(l => /system|setting|config|auth|login|logout|role|permission|user/i.test((l.module || l.table_name || '')))
    return { all, licenses, payments, documents, reports, system }
  }, [filteredLogs])

  const activeLogs = useMemo(() => {
    if (activeTab === 'logs') return data?.loginHistory || []
    return logsByCategory[activeTab] || []
  }, [activeTab, logsByCategory, data])

  const getActionIcon = (action) => {
    switch (action) {
      case 'POST': return FileDigit
      case 'PUT': return PenTool
      case 'PATCH': return PenTool
      case 'DELETE': return Ban
      case 'GET': return Eye
      case 'LOGIN': return LogIn
      case 'LOGOUT': return LogOut
      default: return Activity
    }
  }

  const getActionColor = (action) => {
    const colors = {
      POST: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      PUT: 'bg-blue-50 text-blue-600 border-blue-100',
      PATCH: 'bg-amber-50 text-amber-600 border-amber-100',
      DELETE: 'bg-rose-50 text-rose-600 border-rose-100',
      GET: 'bg-slate-50 text-slate-600 border-slate-100',
      LOGIN: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      LOGOUT: 'bg-slate-50 text-slate-600 border-slate-100'
    }
    return colors[action] || colors.GET
  }

  const getActionLabel = (action) => {
    const labels = { POST: 'Created', PUT: 'Updated', PATCH: 'Modified', DELETE: 'Deleted', GET: 'Viewed', LOGIN: 'Login', LOGOUT: 'Logout' }
    return labels[action] || action
  }

  const getStatusBadge = (status) => {
    if (status === 'success' || status === 'active') {
      return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">Success</span>
    }
    if (status === 'failed') {
      return <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-600">Failed</span>
    }
    return <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-600">{status || '—'}</span>
  }

  const tabs = [
    { id: 'all', label: 'All Activities', icon: LayoutDashboard },
    { id: 'licenses', label: 'Drive License Activities', icon: FileCheck },
    { id: 'logs', label: 'Logs & Sessions', icon: Shield },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: HardDrive },
    { id: 'reports', label: 'Reports', icon: PrinterIcon },
    { id: 'system', label: 'System Activities', icon: Settings }
  ]

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight text-slate-900">{value ?? 0}</p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
    </div>
  )

  const DetailRow = ({ label, value }) => (
    <div className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-xs font-medium text-slate-900">{value || '—'}</span>
    </div>
  )

  const selectedSession = useMemo(() => {
    if (!selectedLog?.session_id || !data?.sessions) return null
    return data.sessions.find(s => s.session_id === selectedLog.session_id)
  }, [selectedLog, data])

  if (loading) {
    return (
      <div className="pb-10">
        <div className="p-12 text-center text-slate-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
          Loading user activity details...
        </div>
      </div>
    )
  }

  if (!data?.user) {
    return (
      <div className="pb-10">
        <div className="p-12 text-center text-slate-500">
          <p className="font-semibold">User not found</p>
        </div>
      </div>
    )
  }

  const user = data.user
  const stats = data.statistics || {}

  return (
    <div className="space-y-5 pb-10">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate('/dashboard/admin/audit-logs')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Audit Logs
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">01 May 2025 - 28 May 2025</span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {/* Left sidebar - User Information */}
        <div className="space-y-5 lg:col-span-1">
          <div className="card">
            <h2 className="mb-4 text-sm font-bold text-slate-900">User Information</h2>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600">
                {user.full_name?.[0] || 'U'}
              </div>
              <div>
                <p className="font-bold text-slate-900">{user.full_name || 'User'}</p>
                <p className="text-xs text-slate-500">{roleLabels[user.role_id] || 'User'}</p>
                <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${user.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {user.status || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              <DetailRow label="User ID" value={`USR-${String(user.user_id).padStart(6, '0')}`} />
              <DetailRow label="Employee ID" value={user.employee_id} />
              <DetailRow label="Username" value={user.username} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Phone" value={user.phone} />
              <DetailRow label="Role" value={roleLabels[user.role_id] || 'User'} />
              <DetailRow label="Department" value={user.department} />
              <DetailRow label="Branch/Office" value={user.branch_office} />
              <DetailRow label="Last Login" value={formatDate(user.last_login)} />
              <DetailRow label="Total Logins" value={stats.total_logins || 0} />
              <DetailRow label="Active Hours" value={formatDuration(data.sessions?.reduce((acc, s) => acc + (s.duration || 0), 0))} />
              <DetailRow label="Account Created" value={formatDate(user.created_at)} />
              <DetailRow label="Last Password Change" value={formatDate(user.password_changed_at)} />
              <DetailRow label="Current Sessions" value={stats.active_sessions > 0 ? 'Active' : 'Inactive'} />
            </div>
            <button
              type="button"
              onClick={() => navigate(`/dashboard/admin/users/${user.user_id}`)}
              className="mt-4 w-full rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-700"
            >
              View Full Profile
            </button>
          </div>

          <div className="card">
            <h2 className="mb-3 text-sm font-bold text-slate-900">User Statistics <span className="text-xs font-normal text-slate-400">(This Period)</span></h2>
            <div className="space-y-2">
              {[
                { label: 'Licenses Created', value: stats.total_created || 0 },
                { label: 'Licenses Approved', value: logsByCategory.licenses.filter(l => /approve/i.test(l.description || '')).length },
                { label: 'Licenses Updated', value: stats.total_updated || 0 },
                { label: 'Licenses Rejected', value: stats.total_failed || 0 },
                { label: 'Licenses Printed', value: logsByCategory.licenses.filter(l => /print/i.test(l.description || '')).length },
                { label: 'Total Applications', value: stats.total_actions || 0 },
                { label: 'Reports Generated', value: logsByCategory.reports.length || 0 }
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <span className="text-xs font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-3 text-xs font-bold text-primary-600 transition hover:text-primary-700">
              View All Statistics
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard icon={LogIn} label="Total Logins" value={stats.total_logins || 0} color="bg-blue-50 text-blue-600" />
            <StatCard icon={Clock} label="Active Hours" value={formatDuration(data.sessions?.reduce((acc, s) => acc + (s.duration || 0), 0))} color="bg-emerald-50 text-emerald-600" />
            <StatCard icon={Activity} label="Total Actions" value={stats.total_actions || 0} color="bg-purple-50 text-purple-600" />
            <StatCard icon={FileCheck} label="License Created" value={logsByCategory.licenses.filter(l => l.action_performed === 'POST').length} color="bg-blue-50 text-blue-600" />
            <StatCard icon={CheckCircle2} label="License Approved" value={logsByCategory.licenses.filter(l => /approve/i.test(l.description || '')).length} color="bg-emerald-50 text-emerald-600" />
            <StatCard icon={Printer} label="License Printed" value={logsByCategory.licenses.filter(l => /print/i.test(l.description || '')).length} color="bg-amber-50 text-amber-600" />
            <StatCard icon={Ban} label="License Rejected" value={logsByCategory.licenses.filter(l => /reject/i.test(l.description || '') || l.status === 'failed').length} color="bg-rose-50 text-rose-600" />
          </div>

      {/* Tabs */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity timeline */}
      <div className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            {activeTab === 'logs' ? 'Login & Session Timeline' : `${tabs.find(t => t.id === activeTab)?.label} Timeline`}
          </h2>
          <div className="flex items-center gap-2">
            <select className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">
              <option>All Actions</option>
              <option>Created</option>
              <option>Updated</option>
              <option>Deleted</option>
            </select>
            <select className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">
              <option>All Status</option>
              <option>Success</option>
              <option>Failed</option>
            </select>
            <button className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50">
              <Filter className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {activeTab === 'logs' ? (
          data.loginHistory?.length ? (
            <div className="space-y-2">
              {data.loginHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${selectedLog?.isLoginEntry && selectedLog?.session_id === entry.session_id ? 'border-primary-300 bg-primary-50' : 'border-slate-100 hover:bg-slate-50'}`}
                  onClick={() => setSelectedLog({ ...entry, isLoginEntry: true })}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${entry.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {entry.status === 'success' ? <LogIn className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{entry.status === 'success' ? 'Login successful' : 'Login failed'}</p>
                    <p className="text-xs text-slate-500">{entry.browser || 'Unknown'} · {entry.os || 'Unknown'} · {entry.ip_address || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">{formatDate(entry.login_time)}</p>
                    <p className="text-[10px] text-slate-400">{formatTimeOnly(entry.login_time)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No login history found.</div>
          )
        ) : activeLogs.length ? (
          <div className="space-y-2">
            {activeLogs.map((log) => {
              const Icon = getActionIcon(log.action_performed)
              return (
                <div
                  key={log.log_id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${selectedLog?.log_id === log.log_id ? 'border-primary-300 bg-primary-50' : 'border-slate-100 hover:bg-slate-50'}`}
                  onClick={() => setSelectedLog(log)}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${getActionColor(log.action_performed)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{getActionLabel(log.action_performed)} {log.module || log.table_name || 'Record'}</p>
                      {getStatusBadge(log.status)}
                    </div>
                    <p className="text-xs text-slate-500">{log.description || `Record #${log.record_id || '—'}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">{formatDate(log.action_time)}</p>
                    <p className="text-[10px] text-slate-400">{formatTimeOnly(log.action_time)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No activity found for this category.</div>
        )}
      </div>

      {/* Bottom tables */}
      <div className="space-y-5">
        <div className="card">
          <h2 className="mb-3 text-sm font-bold text-slate-900">License CRUD History</h2>
          {logsByCategory.licenses.length ? (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 font-semibold uppercase text-slate-500">
                  <tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Module</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Record ID</th><th className="px-3 py-2">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logsByCategory.licenses.slice(0, 5).map((log) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2">{formatDate(log.action_time)}</td>
                      <td className="px-3 py-2 capitalize">{log.module || log.table_name}</td>
                      <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getActionColor(log.action_performed)}`}>{log.action_performed}</span></td>
                      <td className="px-3 py-2 font-mono">{log.record_id || '—'}</td>
                      <td className="px-3 py-2">{getStatusBadge(log.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-slate-500">No license CRUD history.</p>}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-3 text-sm font-bold text-slate-900">License Status Changes</h2>
            {logsByCategory.licenses.filter(l => /status|approve|reject|suspend|revoke/i.test(l.description || '')).length ? (
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 font-semibold uppercase text-slate-500"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Change</th><th className="px-3 py-2">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {logsByCategory.licenses.filter(l => /status|approve|reject|suspend|revoke/i.test(l.description || '')).slice(0, 5).map((log) => (
                      <tr key={log.log_id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2">{formatDate(log.action_time)}</td>
                        <td className="px-3 py-2">{log.description || '—'}</td>
                        <td className="px-3 py-2">{getStatusBadge(log.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-slate-500">No status changes.</p>}
          </div>

          <div className="card">
            <h2 className="mb-3 text-sm font-bold text-slate-900">License Documents Handled</h2>
            {logsByCategory.documents.length ? (
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 font-semibold uppercase text-slate-500"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {logsByCategory.documents.slice(0, 5).map((log) => (
                      <tr key={log.log_id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2">{formatDate(log.action_time)}</td>
                        <td className="px-3 py-2">{log.description || log.action_performed}</td>
                        <td className="px-3 py-2">{getStatusBadge(log.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-slate-500">No document activity.</p>}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Payments Related</h2>
          {logsByCategory.payments.length ? (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 font-semibold uppercase text-slate-500">
                  <tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Module</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Record ID</th><th className="px-3 py-2">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logsByCategory.payments.slice(0, 5).map((log) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2">{formatDate(log.action_time)}</td>
                      <td className="px-3 py-2 capitalize">{log.module || log.table_name}</td>
                      <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getActionColor(log.action_performed)}`}>{log.action_performed}</span></td>
                      <td className="px-3 py-2 font-mono">{log.record_id || '—'}</td>
                      <td className="px-3 py-2">{getStatusBadge(log.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-slate-500">No payment activity.</p>}
        </div>
      </div>
    </div>

    {/* Right panel - Selected Activity Details */}
    <div className="space-y-5 lg:col-span-1">
      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Selected Activity Details</h2>
        {selectedLog ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${selectedLog.isLoginEntry ? (selectedLog.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100') : getActionColor(selectedLog.action_performed)}`}>
                {selectedLog.isLoginEntry ? <LogIn className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedLog.isLoginEntry ? 'Login Event' : getActionLabel(selectedLog.action_performed)}</p>
                <p className="text-xs text-slate-500">{selectedLog.module || selectedLog.table_name || 'System'}</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              <DetailRow label="Date & Time" value={formatDate(selectedLog.action_time || selectedLog.login_time)} />
              <DetailRow label="Action Type" value={selectedLog.action_performed || 'LOGIN'} />
              <DetailRow label="Status" value={selectedLog.status || '—'} />
              <DetailRow label="User" value={user.full_name} />
              <DetailRow label="Module" value={selectedLog.module || selectedLog.table_name} />
              <DetailRow label="Record ID" value={selectedLog.record_id} />
              <DetailRow label="Description" value={selectedLog.description || selectedLog.error_message} />
              <DetailRow label="IP Address" value={selectedLog.ip_address} />
              <DetailRow label="Browser" value={selectedLog.browser} />
              <DetailRow label="OS" value={selectedLog.os} />
              <DetailRow label="Device" value={selectedLog.device_type} />
            </div>
          </div>
        ) : <p className="text-sm text-slate-500">Select an activity to view details.</p>}
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Session Information</h2>
        {selectedSession ? (
          <div className="divide-y divide-slate-100">
            <DetailRow label="Session ID" value={selectedSession.session_id?.slice(-8)} />
            <DetailRow label="Login Time" value={formatDate(selectedSession.login_time)} />
            <DetailRow label="Logout Time" value={formatDate(selectedSession.logout_time)} />
            <DetailRow label="Duration" value={formatDuration(selectedSession.duration)} />
            <DetailRow label="Device" value={selectedSession.device_type} />
            <DetailRow label="Browser" value={selectedSession.browser} />
            <DetailRow label="OS" value={selectedSession.os} />
            <DetailRow label="IP Address" value={selectedSession.ip_address} />
            <DetailRow label="Status" value={selectedSession.is_active ? 'Active' : 'Closed'} />
          </div>
        ) : <p className="text-sm text-slate-500">No session information for this activity.</p>}
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Activity Metadata</h2>
        <div className="divide-y divide-slate-100">
          <DetailRow label="Module" value={selectedLog?.module || selectedLog?.table_name} />
          <DetailRow label="Entry Type" value={selectedLog?.isLoginEntry ? 'Authentication' : 'Audit Log'} />
          <DetailRow label="Action Type" value={selectedLog?.action_performed || 'LOGIN'} />
          <DetailRow label="Record ID" value={selectedLog?.record_id} />
          <DetailRow label="Request ID" value={selectedLog?.request_id} />
          <DetailRow label="Session ID" value={selectedLog?.session_id?.slice(-8)} />
          <DetailRow label="Correlation ID" value={selectedLog?.correlation_id} />
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Change Summary</h2>
        <div className="divide-y divide-slate-100">
          <DetailRow label="New Values" value={selectedLog?.new_value ? JSON.stringify(selectedLog.new_value).slice(0, 60) : '—'} />
          <DetailRow label="Old Values" value={selectedLog?.old_value ? JSON.stringify(selectedLog.old_value).slice(0, 60) : '—'} />
          <DetailRow label="Changed Fields" value={selectedLog?.changed_fields ? JSON.stringify(selectedLog.changed_fields).slice(0, 60) : '—'} />
          <DetailRow label="Error Message" value={selectedLog?.error_message} />
        </div>
      </div>
    </div>
  </div>
</div>
  )
}

export default UserActivityDetails
