import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  UserRound, IdCard, CalendarDays, CreditCard,
  ClipboardList, FileText, Download, LogOut, ChevronRight,
  BadgeCheck, AlertCircle, Clock, MapPin, Car, Bell, X, Info,
  CheckCheck, TriangleAlert, CircleAlert, CalendarClock
} from 'lucide-react'

const DriverPortal = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)

  const fetchPortalData = async () => {
    try {
      const res = await api.get('/drivers/portal/me')
      setData(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load portal data')
      if (err.response?.status === 404) {
        toast.error('No driver record linked to this account')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/drivers/portal/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    fetchPortalData()
    fetchNotifications()

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const requestReschedule = async (appointmentId) => {
    const preferredDate = window.prompt('Enter your preferred date & time (YYYY-MM-DD HH:MM):')
    if (!preferredDate) return
    const reason = window.prompt('Reason for reschedule (optional):') || ''
    try {
      await api.patch(`/appointments/${appointmentId}/request-reschedule`, {
        preferred_date: preferredDate,
        reason
      })
      toast.success('Reschedule request submitted')
      fetchPortalData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request')
    }
  }

  const handleMarkNotifRead = async (id) => {
    try {
      await api.patch(`/drivers/portal/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const formatNotifTime = (value) => {
    if (!value) return 'Just now'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Just now'
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getNotifIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'sms': return <TriangleAlert className="h-4 w-4 text-amber-500" />
      case 'email': return <CheckCheck className="h-4 w-4 text-emerald-500" />
      case 'system': return <Info className="h-4 w-4 text-sky-500" />
      default: return <Info className="h-4 w-4 text-sky-500" />
    }
  }

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await api.get(`/documents/${docId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName || `document-${docId}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  const getFileName = (filePath) => {
    if (!filePath) return 'File'
    return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    if (amount == null) return '-'
    return '$' + parseFloat(amount).toFixed(2)
  }

  const statusBadge = (status) => {
    const map = {
      Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      Expired: 'bg-slate-100 text-slate-600 border-slate-200',
      Suspended: 'bg-orange-50 text-orange-700 border-orange-200',
      Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
      Pass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Fail: 'bg-rose-50 text-rose-700 border-rose-200',
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
      'National ID': 'bg-blue-50 text-blue-700 border-blue-200',
      Passport: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Medical Certificate': 'bg-rose-50 text-rose-700 border-rose-200',
      Photo: 'bg-pink-50 text-pink-700 border-pink-200'
    }
    return map[status] || 'bg-slate-50 text-slate-600 border-slate-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    )
  }

  if (!data?.driver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Driver Record Found</h2>
          <p className="text-sm text-slate-500 mb-6">This account is not linked to a driver profile.</p>
          <button onClick={handleLogout} className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition">
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  const { driver, license, exams, payments, appointments, documents } = data

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">Driver Portal</h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">DLMS11</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-11 w-80 rounded-2xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/10 z-50 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</h3>
                      <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifLoading && (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">Loading...</div>
                      )}
                      {!notifLoading && notifications.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</div>
                      )}
                      {notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-slate-50 ${n.status === 'unread' ? 'bg-sky-50/40' : ''}`}>
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">{getNotifIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 leading-tight">{n.title}</p>
                              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{n.message}</p>
                              <p className="mt-1 text-[10px] text-slate-400">{formatNotifTime(n.created_at)}</p>
                            </div>
                            {n.status === 'unread' && (
                              <button
                                onClick={() => handleMarkNotifRead(n.id)}
                                className="shrink-0 rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition"
                              >
                                Read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span className="hidden sm:inline text-xs text-slate-500">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <UserRound className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{driver.first_name} {driver.last_name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
                  <span className="inline-flex items-center gap-1"><IdCard className="h-3.5 w-3.5" /> {driver.national_id}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {driver.city || '-'}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(driver.registration_date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusBadge(driver.status || 'Pending')}`}>
                  {driver.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gender</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{driver.gender || '-'}</p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Blood Group</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{driver.blood_group || '-'}</p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Phone</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{driver.phone || '-'}</p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Email</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{driver.email || '-'}</p>
            </div>
          </div>
        </div>

        {/* License Card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">License</h3>
            </div>
            {license ? (
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadge(license.license_status)}`}>
                {license.license_status}
              </span>
            ) : (
              <span className="text-xs text-slate-400">No license on record</span>
            )}
          </div>
          {license ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-100">
              <div className="bg-white px-5 py-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">License Number</p>
                <p className="mt-1 text-base font-bold text-slate-900">{license.license_number}</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Category</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{license.category_name || `Category ${license.category_id}`}</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Expires</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(license.expiry_date)}</p>
              </div>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-slate-500">You do not have a license on record yet.</p>
            </div>
          )}
        </div>

        {/* Exams & Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exams */}
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Exams</h3>
              <span className="ml-auto text-xs text-slate-400 font-medium">{exams.length} total</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {exams.length === 0 && (
                <div className="px-6 py-6 text-center text-sm text-slate-500">No exams scheduled yet.</div>
              )}
              {exams.map((e) => (
                <div key={e.exam_uid} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 capitalize">{e.exam_type} Exam</p>
                    <p className="text-xs text-slate-500">{formatDate(e.exam_date)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadge(e.status)}`}>
                      {e.status}
                    </span>
                    {e.result && (
                      <p className="mt-0.5 text-xs font-semibold text-slate-700">{e.result} ({e.score})</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Appointments</h3>
              <span className="ml-auto text-xs text-slate-400 font-medium">{appointments.length} total</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {appointments.length === 0 && (
                <div className="px-6 py-6 text-center text-sm text-slate-500">No appointments scheduled yet.</div>
              )}
              {appointments.map((a) => (
                <div key={a.appointment_id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{a.appointment_type}</p>
                    <p className="text-xs text-slate-500">{formatDate(a.appointment_date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {['Pending', 'Approved'].includes(a.status) && !a.reschedule_requested && (
                      <button
                        onClick={() => requestReschedule(a.appointment_id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        <CalendarClock className="h-3 w-3" /> Reschedule
                      </button>
                    )}
                    {a.reschedule_requested && (
                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
                        Requested
                      </span>
                    )}
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payments</h3>
            <span className="ml-auto text-xs text-slate-400 font-medium">{payments.length} total</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {payments.length === 0 && (
              <div className="px-6 py-6 text-center text-sm text-slate-500">No payments on record.</div>
            )}
            {payments.map((p) => (
              <div key={p.payment_id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{p.payment_type}</p>
                  <p className="text-xs text-slate-500">{formatDate(p.payment_date)} &middot; {p.payment_method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadge(p.payment_status)}`}>
                    {p.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Documents</h3>
            <span className="ml-auto text-xs text-slate-400 font-medium">{documents.length} total</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {documents.length === 0 && (
              <div className="px-6 py-6 text-center text-sm text-slate-500">No documents uploaded yet.</div>
            )}
            {documents.map((d) => (
              <div key={d.document_id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${statusBadge(d.document_type)}`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{d.document_type}</p>
                    <p className="text-xs text-slate-500">{formatDate(d.uploaded_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(d.document_id, getFileName(d.file_path))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">Driver Portal &middot; DLMS11 &middot; All data is read-only</p>
        </div>
      </main>
    </div>
  )
}

export default DriverPortal

