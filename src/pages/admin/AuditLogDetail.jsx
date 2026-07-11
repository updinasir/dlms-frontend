import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  ChevronLeft, User, Shield, Database, Clock, Globe, Monitor, Smartphone,
  Server, FileText, Activity, MapPin, Printer, Download, Copy, X, History,
  ArrowRightLeft, CheckCircle2, XCircle, AlertTriangle, Flag, FileDigit,
  PenTool, Ban, Eye, LogIn, LogOut, Car, CreditCard, ClipboardList,
  Calendar, HardDrive, StickyNote, FileCheck, Link2, ExternalLink
} from 'lucide-react'

const AuditLogDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [showCompare, setShowCompare] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/audit-logs/${id}`)
      setData(res.data)
    } catch (error) {
      toast.error('Failed to load audit log details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString([], {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  const formatTime = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

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

  const getSeverity = (action) => {
    if (action === 'DELETE') return 'Critical'
    if (action === 'POST') return 'Medium'
    if (action === 'PUT' || action === 'PATCH') return 'High'
    if (action === 'LOGIN' || action === 'LOGOUT') return 'Low'
    return 'Low'
  }

  const getSeverityColor = (severity) => {
    const colors = {
      Low: 'bg-slate-50 text-slate-600 border-slate-100',
      Medium: 'bg-blue-50 text-blue-600 border-blue-100',
      High: 'bg-amber-50 text-amber-600 border-amber-100',
      Critical: 'bg-rose-50 text-rose-600 border-rose-100'
    }
    return colors[severity] || colors.Low
  }

  const getStatusBadge = (status) => {
    if (status === 'success' || status === 'Active') {
      return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">Success</span>
    }
    if (status === 'failed') {
      return <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-600">Failed</span>
    }
    return <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-600">{status || 'N/A'}</span>
  }

  const parseJson = (value) => {
    if (!value) return null
    try {
      return typeof value === 'string' ? JSON.parse(value) : value
    } catch {
      return null
    }
  }

  const DetailRow = ({ label, value }) => (
    <div className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-xs font-medium text-slate-900">{value || 'N/A'}</span>
    </div>
  )

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="card overflow-hidden">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  )

  if (loading) {
    return (
      <div className="pb-10">
        <div className="p-12 text-center text-slate-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
          Loading audit log details...
        </div>
      </div>
    )
  }

  if (!data?.log) {
    return (
      <div className="pb-10">
        <div className="p-12 text-center text-slate-500">
          <p className="font-semibold">Audit log not found</p>
        </div>
      </div>
    )
  }

  const log = data.log
  const user = data.user || {}
  const session = data.session || {}
  const affected = data.affectedRecord || {}
  const related = data.relatedRecords || {}
  const oldValue = parseJson(log.old_value)
  const newValue = parseJson(log.new_value)
  const changedFields = parseJson(log.changed_fields) || []
  const severity = getSeverity(log.action_performed)
  const ActionIcon = getActionIcon(log.action_performed)
  const totalFieldsChanged = changedFields.length || (oldValue && newValue ? Object.keys(newValue).length : 0)

  const changes = changedFields.length > 0 && oldValue && newValue
    ? changedFields.map(field => ({
        field,
        before: oldValue[field],
        after: newValue[field]
      }))
    : oldValue && newValue
      ? Object.keys(newValue).map(field => ({
          field,
          before: oldValue[field],
          after: newValue[field]
        }))
      : []

  const roleLabels = { 1: 'Super Admin', 2: 'Admin', 3: 'Examiner', 4: 'Staff', 5: 'Cashier', 6: 'Driver' }

  const table = (log.table_name || '').toLowerCase()
  const driverId = table === 'drivers' ? affected.id : (related.driver?.id || affected.driver_id || null)
  const hasDriver = Boolean(driverId)

  const handleCompare = () => {
    if (changes.length === 0) {
      toast('No field changes to compare')
      return
    }
    setShowCompare(true)
    document.getElementById('audit-change-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCopyDetails = async () => {
    const lines = [
      `Audit Log ID: AUD-${String(log.log_id).padStart(6, '0')}`,
      `Action: ${getActionLabel(log.action_performed)}`,
      `Module: ${log.module || log.table_name || 'N/A'}`,
      `Status: ${log.status || 'N/A'}`,
      `Severity: ${severity}`,
      `Performed By: ${user.full_name || log.user_name || 'System'}`,
      `Role: ${roleLabels[user.role_id] || 'System'}`,
      `Record ID: ${log.record_id || 'N/A'}`,
      `IP Address: ${log.ip_address || session.ip_address || 'N/A'}`,
      `Date: ${formatDate(log.action_time)}`,
      changes.length ? `\nChanges:\n${changes.map(c => `  ${c.field}: ${String(c.before ?? '—')} -> ${String(c.after ?? '—')}`).join('\n')}` : ''
    ].filter(Boolean).join('\n')
    try {
      await navigator.clipboard.writeText(lines)
      toast.success('Audit details copied to clipboard')
    } catch {
      toast.error('Failed to copy details')
    }
  }

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
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Hero header */}
      <div className="card bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="mb-4 flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase border ${getActionColor(log.action_performed)}`}>
            <ActionIcon className="h-3.5 w-3.5" />
            {getActionLabel(log.action_performed)}
          </span>
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase border ${getSeverityColor(severity)}`}>
            <Flag className="h-3.5 w-3.5 mr-1" />
            {severity}
          </span>
          <span className="text-sm text-slate-300">Log #{log.log_id}</span>
        </div>
        <h1 className="text-xl font-bold sm:text-2xl leading-relaxed">
          {user.full_name || log.user_name || 'System'} <span className="font-normal text-slate-300">{getActionLabel(log.action_performed).toLowerCase()}</span> <span className="font-semibold capitalize">{log.module || log.table_name || 'Record'}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300">{formatDate(log.action_time)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {getStatusBadge(log.status)}
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300">
            <Database className="h-3 w-3" /> {log.table_name || 'N/A'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300">
            <FileText className="h-3 w-3" /> Record ID: {log.record_id || 'N/A'}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5 lg:col-span-1">
          <SectionCard title="Performed By" icon={User}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
                {(user.full_name || log.user_name || 'S')[0]}
              </div>
              <div>
                <p className="font-bold text-slate-900">{user.full_name || log.user_name || 'System'}</p>
                <p className="text-xs text-slate-500">{roleLabels[user.role_id] || 'System'}</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              <DetailRow label="Employee ID" value={user.employee_id} />
              <DetailRow label="Username" value={user.username} />
              <DetailRow label="Email" value={user.email || log.user_email} />
              <DetailRow label="Phone" value={user.phone} />
              <DetailRow label="Department" value={user.department} />
              <DetailRow label="Branch" value={user.branch_office} />
              <DetailRow label="User Status" value={user.status} />
              <DetailRow label="Last Login" value={formatDate(user.last_login)} />
            </div>
            <button
              type="button"
              onClick={() => user.user_id && navigate(`/dashboard/admin/users/${user.user_id}/activity`)}
              className="mt-4 w-full rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
              disabled={!user.user_id}
            >
              View User Activity
            </button>
          </SectionCard>

          <SectionCard title="Device Information" icon={Monitor}>
            <div className="divide-y divide-slate-100">
              <DetailRow label="Device Type" value={log.device_type || session.device_type} />
              <DetailRow label="Operating System" value={log.os || session.os} />
              <DetailRow label="Browser" value={log.browser || session.browser} />
              <DetailRow label="User Agent" value={log.user_agent || session.user_agent} />
              <DetailRow label="Screen Resolution" value={session.screen_resolution} />
            </div>
          </SectionCard>

          <SectionCard title="Network Information" icon={Globe}>
            <div className="divide-y divide-slate-100">
              <DetailRow label="IP Address" value={log.ip_address || session.ip_address || session.public_ip} />
              <DetailRow label="Country" value={session.country} />
              <DetailRow label="City" value={session.city} />
              <DetailRow label="ISP" value={session.isp} />
              <DetailRow label="VPN Detected" value={session.vpn_detected ? 'Yes' : 'No'} />
              <DetailRow label="Proxy Detected" value={session.proxy_detected ? 'Yes' : 'No'} />
            </div>
          </SectionCard>

          <SectionCard title="Session Information" icon={Clock}>
            <div className="divide-y divide-slate-100">
              <DetailRow label="Session ID" value={log.session_id?.slice(-8)} />
              <DetailRow label="Login Time" value={formatDate(session.login_time)} />
              <DetailRow label="Logout Time" value={formatDate(session.logout_time)} />
              <DetailRow label="Duration" value={formatDuration(session.duration || session.session_duration)} />
              <DetailRow label="Session Status" value={session.is_active ? 'Active' : 'Closed'} />
            </div>
          </SectionCard>
        </div>

        {/* Center column */}
        <div className="space-y-5 lg:col-span-2">
          <SectionCard title="Audit Information" icon={Shield}>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Audit Log ID" value={`AUD-${String(log.log_id).padStart(6, '0')}`} />
              <DetailRow label="Action" value={getActionLabel(log.action_performed)} />
              <DetailRow label="Module" value={log.module || log.table_name} />
              <DetailRow label="Table Name" value={log.table_name} />
              <DetailRow label="Description" value={log.description} />
              <DetailRow label="Status" value={log.status} />
              <DetailRow label="Severity" value={severity} />
              <DetailRow label="Date & Time" value={formatDate(log.action_time)} />
              <DetailRow label="Record ID" value={log.record_id} />
              <DetailRow label="Digital Signature" value={log.digital_signature} />
            </div>
          </SectionCard>

          <SectionCard title="Affected Record" icon={Database}>
            {affected.id ? (
              <div className="divide-y divide-slate-100">
                <DetailRow label="Record Type" value={log.table_name} />
                <DetailRow label="Record ID" value={affected.id} />
                <DetailRow label="Record Name" value={affected.full_name || affected.name || `${affected.first_name || ''} ${affected.last_name || ''}`.trim()} />
                <DetailRow label="License Number" value={affected.license_number} />
                <DetailRow label="National ID" value={affected.national_id} />
                <DetailRow label="Phone" value={affected.phone} />
                <DetailRow label="Current Status" value={affected.status} />
                <DetailRow label="Created At" value={formatDate(affected.created_at)} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">No affected record details available.</p>
            )}
          </SectionCard>

          <div id="audit-change-history" className={showCompare ? 'rounded-2xl ring-2 ring-primary-300 transition' : 'transition'}>
          <SectionCard title="Change History" icon={ArrowRightLeft}>
            {changes.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Field</th>
                      <th className="px-3 py-2">Before</th>
                      <th className="px-3 py-2">After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {changes.map((change, idx) => (
                      <tr key={idx} className={`hover:bg-slate-50/50 ${showCompare && String(change.before) !== String(change.after) ? 'bg-amber-50/50' : ''}`}>
                        <td className="px-3 py-2 font-medium text-slate-900 capitalize">{change.field}</td>
                        <td className="px-3 py-2 text-rose-500 line-through">{String(change.before ?? '—')}</td>
                        <td className="px-3 py-2 font-medium text-emerald-600">{String(change.after ?? '—')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No field changes recorded.</p>
            )}
          </SectionCard>
          </div>

          <SectionCard title="Activity Summary" icon={Activity}>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Total Fields Changed" value={totalFieldsChanged} />
              <DetailRow label="Changed By" value={user.full_name || log.user_name} />
              <DetailRow label="Reason" value="N/A" />
              <DetailRow label="Notes" value="N/A" />
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p>{totalFieldsChanged || 0} field(s) were modified.</p>
              <p>Performed by: {user.full_name || log.user_name || 'System'}</p>
            </div>
          </SectionCard>

          <SectionCard title="Request Information" icon={Server}>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Request ID" value={log.request_id} />
              <DetailRow label="HTTP Method" value={log.action_performed} />
              <DetailRow label="API Endpoint" value={`/api/${log.module || log.table_name}`} />
              <DetailRow label="Response Code" value={log.status === 'success' ? '200' : log.status === 'failed' ? '400/500' : 'N/A'} />
              <DetailRow label="DB Transaction ID" value="N/A" />
              <DetailRow label="Correlation ID" value={log.correlation_id} />
            </div>
          </SectionCard>

          <SectionCard title="Timeline" icon={History}>
            <div className="space-y-0">
              {session.login_time && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary-600" />
                    <div className="h-full w-0.5 bg-slate-100" />
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-semibold text-slate-900">Login</p>
                    <p className="text-xs text-slate-500">{formatDate(session.login_time)}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary-600" />
                  <div className="h-full w-0.5 bg-slate-100" />
                </div>
                <div className="pb-4">
                  <p className="text-xs font-semibold text-slate-900">{getActionLabel(log.action_performed)} {log.module || log.table_name}</p>
                  <p className="text-xs text-slate-500">{formatDate(log.action_time)}</p>
                </div>
              </div>
              {session.logout_time && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Logout</p>
                    <p className="text-xs text-slate-500">{formatDate(session.logout_time)}</p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Related Records" icon={Link2}>
            {Object.keys(related).length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {related.driver && (
                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-900">Driver Profile</p>
                    <p className="text-xs text-slate-600">{related.driver.full_name}</p>
                    <p className="text-xs text-slate-400">{related.driver.national_id}</p>
                  </div>
                )}
                {related.licenses?.length > 0 && (
                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-900">Licenses ({related.licenses.length})</p>
                    <p className="text-xs text-slate-600">{related.licenses.map(l => l.license_number).join(', ')}</p>
                  </div>
                )}
                {related.vehicles?.length > 0 && (
                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-900">Vehicles ({related.vehicles.length})</p>
                    <p className="text-xs text-slate-600">{related.vehicles.map(v => v.plate_number).join(', ')}</p>
                  </div>
                )}
                {related.payments?.length > 0 && (
                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-900">Payments ({related.payments.length})</p>
                    <p className="text-xs text-slate-600">{related.payments.map(p => p.amount).join(', ')}</p>
                  </div>
                )}
                {related.exams?.length > 0 && (
                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-900">Exams ({related.exams.length})</p>
                    <p className="text-xs text-slate-600">{related.exams.map(e => e.exam_type).join(', ')}</p>
                  </div>
                )}
                {related.appointments?.length > 0 && (
                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-900">Appointments ({related.appointments.length})</p>
                    <p className="text-xs text-slate-600">{related.appointments.map(a => a.appointment_type).join(', ')}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No related records available.</p>
            )}
          </SectionCard>

          <SectionCard title="Attachments" icon={HardDrive}>
            <p className="text-sm text-slate-500">No attachments available for this audit log.</p>
          </SectionCard>

          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => user.user_id && navigate(`/dashboard/admin/users/${user.user_id}/activity`)}
              disabled={!user.user_id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <User className="h-3.5 w-3.5" /> View User Profile
            </button>
            <button
              type="button"
              onClick={() => hasDriver && navigate(`/dashboard/drivers/${driverId}`)}
              disabled={!hasDriver}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Car className="h-3.5 w-3.5" /> View Driver Profile
            </button>
            <button
              type="button"
              onClick={handleCompare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" /> Compare Changes
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
            <button type="button" onClick={handleCopyDetails} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <Copy className="h-3.5 w-3.5" /> Copy Details
            </button>
            <button type="button" onClick={() => navigate('/dashboard/admin/audit-logs')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <X className="h-3.5 w-3.5" /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditLogDetail
