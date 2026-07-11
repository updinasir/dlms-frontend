import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import {
  Megaphone, Send, CalendarClock, History, Mail, Info, CheckCircle2,
  AlertTriangle, AlertCircle, RefreshCw, Download, Archive, Trash2, X, Clock
} from 'lucide-react'
import { formatDateTime, relativeTime, categoryStyles, priorityStyles, CATEGORIES, PRIORITIES } from '../../utils/notifications'

const TABS = [
  { key: 'compose', label: 'Announcement', icon: Megaphone },
  { key: 'schedule', label: 'Scheduled', icon: CalendarClock },
  { key: 'history', label: 'History', icon: History },
  { key: 'emails', label: 'Email Delivery', icon: Mail }
]

const ROLE_OPTIONS = [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Admin' },
  { id: 3, name: 'Examiner' },
  { id: 5, name: 'Cashier' }
]

const AUDIENCES = [
  { key: 'all', label: 'Everyone' },
  { key: 'staff', label: 'All Staff' },
  { key: 'drivers', label: 'All Drivers' },
  { key: 'roles', label: 'Specific Roles' },
  { key: 'user', label: 'Specific User' },
  { key: 'driver', label: 'Specific Driver' }
]

const CHANNELS = ['System', 'Email', 'Both']

const categoryIcon = (category) => {
  switch (category) {
    case 'Success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case 'Warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case 'Error': return <AlertCircle className="h-4 w-4 text-rose-500" />
    default: return <Info className="h-4 w-4 text-sky-500" />
  }
}

const NotificationCenter = () => {
  const { user } = useAuth()
  const userRole = Number(user?.role)
  const isSuperAdmin = userRole === 1
  const isAdmin = userRole === 1 || userRole === 2

  const availableAudiences = isSuperAdmin
    ? AUDIENCES
    : isAdmin
      ? AUDIENCES.filter((a) => ['staff', 'drivers', 'user', 'driver'].includes(a.key))
      : AUDIENCES.filter((a) => ['drivers', 'user', 'driver'].includes(a.key))

  const visibleTabs = isSuperAdmin
    ? TABS
    : isAdmin
      ? TABS.filter((t) => t.key !== 'emails')
      : TABS.filter((t) => t.key === 'compose')

  const [tab, setTab] = useState('compose')

  // Compose form
  const [form, setForm] = useState({
    title: '', message: '', category: 'Information', priority: 'Medium',
    delivery_channel: 'System', audience_type: isSuperAdmin ? 'all' : 'drivers', roles: [], scheduled_at: ''
  })
  const [sending, setSending] = useState(false)

  const [scheduled, setScheduled] = useState([])
  const [history, setHistory] = useState([])
  const [emailLogs, setEmailLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const toggleRole = (id) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(id) ? f.roles.filter((r) => r !== id) : [...f.roles, id]
    }))
  }

  const loadScheduled = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications/scheduled')
      setScheduled(res.data.scheduled || [])
    } catch { toast.error('Failed to load scheduled') } finally { setLoading(false) }
  }, [])

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications', { params: { limit: 50 } })
      setHistory(res.data.notifications || [])
    } catch { toast.error('Failed to load history') } finally { setLoading(false) }
  }, [])

  const loadEmails = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications/admin/email-logs', { params: { limit: 50 } })
      setEmailLogs(res.data.logs || [])
    } catch { toast.error('Failed to load email logs') } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (tab === 'schedule') loadScheduled()
    if (tab === 'history') loadHistory()
    if (tab === 'emails') loadEmails()
  }, [tab, loadScheduled, loadHistory, loadEmails])

  const submit = async (schedule) => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required')
      return
    }
    if (form.audience_type === 'user' && !form.user_id) {
      toast.error('Enter a user ID')
      return
    }
    if (form.audience_type === 'driver' && !form.driver_id) {
      toast.error('Enter a driver ID')
      return
    }
    if (schedule && !form.scheduled_at) {
      toast.error('Pick a schedule date/time')
      return
    }
    setSending(true)
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        priority: form.priority,
        delivery_channel: form.delivery_channel,
        audience_type: form.audience_type,
        roles: form.roles
      }
      if (form.audience_type === 'user' && form.user_id) payload.user_id = Number(form.user_id)
      if (form.audience_type === 'driver' && form.driver_id) payload.driver_id = Number(form.driver_id)
      if (schedule) {
        await api.post('/notifications/scheduled', { ...payload, scheduled_at: form.scheduled_at })
        toast.success('Notification scheduled')
        setTab('schedule')
      } else {
        const res = await api.post('/notifications/announcement', payload)
        toast.success(`Announcement sent to ${res.data.recipients} recipient(s)`)
      }
      setForm((f) => ({ ...f, title: '', message: '', scheduled_at: '', user_id: '', driver_id: '' }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const cancelScheduled = async (id) => {
    try {
      await api.delete(`/notifications/scheduled/${id}`)
      toast.success('Scheduled notification cancelled')
      loadScheduled()
    } catch { toast.error('Failed to cancel') }
  }

  const retryEmail = async (id) => {
    try {
      await api.post(`/notifications/admin/email-logs/${id}/retry`)
      toast.success('Email resent')
      loadEmails()
    } catch (err) { toast.error(err.response?.data?.message || 'Retry failed') }
  }

  const exportLogs = async () => {
    try {
      const res = await api.get('/notifications/admin/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'notification-logs.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch { toast.error('Export failed') }
  }

  const archiveOld = async () => {
    try {
      const res = await api.post('/notifications/admin/archive-old', { days: 90 })
      toast.success(`Archived ${res.data.archived} old notification(s)`)
      loadHistory()
    } catch { toast.error('Archive failed') }
  }

  const statusBadge = (status) => {
    const map = {
      Sent: 'bg-emerald-50 text-emerald-700', Pending: 'bg-amber-50 text-amber-700',
      Failed: 'bg-rose-50 text-rose-700', Read: 'bg-sky-50 text-sky-700', Cancelled: 'bg-slate-100 text-slate-500'
    }
    return map[status] || 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <Megaphone className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{isSuperAdmin ? 'Notification Center' : isAdmin ? 'Messages' : 'Messages'}</h1>
          <p className="text-sm text-slate-500">{isSuperAdmin ? 'Full control: send to anyone, schedule, view history, and manage email delivery.' : isAdmin ? 'Send to staff, drivers, or specific users. View schedule and history.' : 'Send messages to drivers or specific users.'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {visibleTabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${
                active ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Compose */}
      {tab === 'compose' && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Audience</label>
              <div className="flex flex-wrap gap-2">
                {availableAudiences.map((a) => (
                  <button key={a.key} type="button" onClick={() => setField('audience_type', a.key)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                      form.audience_type === a.key ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}>
                    {a.label}
                  </button>
                ))}
              </div>
              {form.audience_type === 'roles' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <button key={r.id} type="button" onClick={() => toggleRole(r.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        form.roles.includes(r.id) ? 'border-primary-300 bg-primary-100 text-primary-700' : 'border-slate-200 bg-white text-slate-500'
                      }`}>
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
              <input value={form.title} onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g. Scheduled maintenance this weekend"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
              <textarea value={form.message} onChange={(e) => setField('message', e.target.value)} rows={5}
                placeholder="Write the full message..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
                <select value={form.category} onChange={(e) => setField('category', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Priority</label>
                <select value={form.priority} onChange={(e) => setField('priority', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Channel</label>
                <select value={form.delivery_channel} onChange={(e) => setField('delivery_channel', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {form.audience_type === 'user' && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">User ID</label>
                <input type="number" value={form.user_id || ''} onChange={(e) => setField('user_id', e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
            )}

            {form.audience_type === 'driver' && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Driver ID</label>
                <input type="number" value={form.driver_id || ''} onChange={(e) => setField('driver_id', e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
            )}

            {isAdmin && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Schedule for later (optional)</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setField('scheduled_at', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={() => submit(false)} disabled={sending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60">
                <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send now'}
              </button>
              {isAdmin && (
                <button onClick={() => submit(true)} disabled={sending || !form.scheduled_at}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                  <CalendarClock className="h-4 w-4" /> Schedule
                </button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Preview</p>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center gap-2">
                {categoryIcon(form.category)}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[form.priority]}`}>
                  {form.priority}
                </span>
                <span className="ml-auto text-xs text-slate-400 capitalize">{form.delivery_channel}</span>
              </div>
              <h4 className="mt-3 text-base font-bold text-slate-900">{form.title || 'Notification title'}</h4>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">{form.message || 'Notification message body...'}</p>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              SMS is not available yet. Only In-App and Email channels are active. The architecture supports adding SMS later.
            </p>
          </div>
        </div>
      )}

      {/* Scheduled */}
      {tab === 'schedule' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" /></div>
          ) : scheduled.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No scheduled notifications.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Audience</th>
                  <th className="px-5 py-3">Scheduled</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scheduled.map((s) => (
                  <tr key={s.scheduled_id}>
                    <td className="px-5 py-3 font-semibold text-slate-800">{s.title}</td>
                    <td className="px-5 py-3 capitalize text-slate-600">{s.audience_type}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDateTime(s.scheduled_at)}</td>
                    <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge(s.status)}`}>{s.status}</span></td>
                    <td className="px-5 py-3 text-right">
                      {s.status === 'Pending' && (
                        <button onClick={() => cancelScheduled(s.scheduled_id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-4">
          {isSuperAdmin && (
            <div className="flex items-center justify-end gap-2">
              <button onClick={archiveOld}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <Archive className="h-4 w-4" /> Archive older than 90 days
              </button>
              <button onClick={exportLogs}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" /></div>
            ) : history.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">No notifications yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((n) => (
                  <div key={n.id} className="flex items-center gap-4 px-5 py-3">
                    {categoryIcon(n.category)}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{n.title}</p>
                      <p className="truncate text-xs text-slate-400">{relativeTime(n.created_at)} &middot; {n.delivery_channel}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityStyles[n.priority]}`}>{n.priority}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge(n.status)}`}>{n.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email logs */}
      {tab === 'emails' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" /></div>
          ) : emailLogs.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No email delivery records.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Recipient</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Sent</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailLogs.map((log) => (
                  <tr key={log.email_log_id}>
                    <td className="px-5 py-3 font-medium text-slate-800">{log.recipient_email}</td>
                    <td className="px-5 py-3 max-w-xs truncate text-slate-600">{log.subject}</td>
                    <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge(log.status)}`}>{log.status}</span></td>
                    <td className="px-5 py-3 text-slate-500">{log.sent_at ? formatDateTime(log.sent_at) : '-'}</td>
                    <td className="px-5 py-3 text-right">
                      {log.status === 'Failed' && (
                        <button onClick={() => retryEmail(log.email_log_id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                          <RefreshCw className="h-3.5 w-3.5" /> Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
