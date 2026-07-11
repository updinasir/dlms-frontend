import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'
import { CreditCard, Calendar, ClipboardCheck, Wallet, FileText, ChevronRight, User, Sparkles } from 'lucide-react'

const DriverDashboard = () => {
  const { user } = useAuth()
  const [portalData, setPortalData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [portalRes, notifRes] = await Promise.all([
        api.get('/drivers/portal/me'),
        api.get('/drivers/portal/notifications')
      ])
      setPortalData(portalRes.data)
      setNotifications(notifRes.data.notifications || [])
      setUnreadCount(notifRes.data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching driver data:', error)
    } finally {
      setLoading(false)
    }
  }

  const driver = portalData?.driver
  const license = portalData?.license
  const exams = portalData?.exams || []
  const payments = portalData?.payments || []
  const appointments = portalData?.appointments || []

  const upcomingExams = exams.filter(e => e.status === 'scheduled').slice(0, 3)
  const upcomingAppointments = appointments.filter(a => a.status === 'Approved' || a.status === 'Pending').slice(0, 3)
  const recentPayments = payments.slice(0, 3)

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const licenseStatusColor = (status) => {
    if (status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (status === 'Expired') return 'bg-amber-50 text-amber-700 border-amber-200'
    if (status === 'Suspended') return 'bg-rose-50 text-rose-700 border-rose-200'
    return 'bg-slate-50 text-slate-700 border-slate-200'
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'Driver'

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{greeting}, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back to your driver dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            Driver
          </span>
          <span className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">License Status</p>
          <p className={`mt-1 inline-block rounded-full border px-3 py-1 text-sm font-bold ${licenseStatusColor(license?.license_status)}`}>
            {license?.license_status || 'No License'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {license ? `Expires: ${formatDate(license.expiry_date)}` : 'Apply for a license to get started.'}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ClipboardCheck className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">Upcoming Exams</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{upcomingExams.length}</p>
          <p className="mt-1 text-xs text-slate-500">Scheduled test appointments</p>
        </div>

      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">My License</h3>
              <p className="mt-1 text-sm text-slate-500">Current license details.</p>
            </div>
          </div>
          {license ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                  <CreditCard className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{license.license_number}</p>
                  <p className="text-xs text-slate-500">License Number</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Issue Date</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(license.issue_date)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Expiry Date</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(license.expiry_date)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="text-sm font-bold text-slate-900">{license.category_name || 'Standard'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className={`text-sm font-bold ${license.license_status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>{license.license_status}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No license on record.</p>
              <Link to="/dashboard/appointments/new" className="mt-2 inline-block text-sm font-semibold text-primary-600 hover:underline">Schedule a test</Link>
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upcoming Appointments</h3>
              <p className="mt-1 text-sm text-slate-500">Your scheduled visits.</p>
            </div>
            <Link to="/dashboard/appointments" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 && (
              <p className="text-sm text-slate-400">No upcoming appointments.</p>
            )}
            {upcomingAppointments.map((appt) => (
              <div key={appt.appointment_id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{appt.appointment_type}</p>
                    <p className="text-xs text-slate-500">{formatDate(appt.appointment_date)}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  appt.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Exams</h3>
              <p className="mt-1 text-sm text-slate-500">Your test history.</p>
            </div>
          </div>
          <div className="space-y-3">
            {exams.length === 0 && (
              <p className="text-sm text-slate-400">No exam records found.</p>
            )}
            {exams.slice(0, 4).map((exam) => (
              <div key={exam.exam_uid} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${exam.result === 'Pass' ? 'bg-emerald-50 text-emerald-600' : exam.result === 'Fail' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{exam.exam_type} Exam</p>
                    <p className="text-xs text-slate-500">{formatDate(exam.exam_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    exam.result === 'Pass' ? 'bg-emerald-50 text-emerald-700' :
                    exam.result === 'Fail' ? 'bg-rose-50 text-rose-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {exam.result || 'Scheduled'}
                  </span>
                  {exam.score != null && (
                    <p className="mt-1 text-xs text-slate-500">Score: {exam.score}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Payments</h3>
              <p className="mt-1 text-sm text-slate-500">Your transaction history.</p>
            </div>
          </div>
          <div className="space-y-3">
            {payments.length === 0 && (
              <p className="text-sm text-slate-400">No payment records found.</p>
            )}
            {recentPayments.map((p) => (
              <div key={p.payment_id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.payment_status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.payment_type}</p>
                    <p className="text-xs text-slate-500">{p.payment_method} &middot; {formatDate(p.payment_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${Number(p.amount || 0).toLocaleString()}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.payment_status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {p.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard


