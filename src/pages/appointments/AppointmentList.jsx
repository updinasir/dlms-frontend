import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  Edit3,
  X,
  CheckCircle2,
  Filter,
  CalendarDays,
  Clock,
  MapPin,
  User,
  ClipboardList,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LogIn,
  PlayCircle,
  UserX,
  CalendarClock,
  Check,
  ClockAlert,
  Users,
  Download,
  Trash2
} from 'lucide-react'

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({ total: 0, scheduled: 0, completed: 0, cancelled: 0 })
  const [selectedAppointments, setSelectedAppointments] = useState([])

  useEffect(() => {
    fetchAppointments()
  }, [searchTerm, statusFilter, typeFilter, page])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      params.append('page', page)
      params.append('limit', 10)

      const [listRes, statsRes] = await Promise.all([
        api.get(`/appointments?${params}`),
        api.get('/appointments/stats/overview')
      ])

      setAppointments(listRes.data.appointments)
      setPagination(listRes.data.pagination)
      setStats(statsRes.data.statistics)
    } catch (error) {
      toast.error('Error fetching appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    try {
      await api.patch(`/appointments/${id}/cancel`)
      toast.success('Appointment cancelled successfully')
      fetchAppointments()
    } catch (error) {
      toast.error('Error cancelling appointment')
    }
  }

  const handleComplete = async (id) => {
    try {
      await api.patch(`/appointments/${id}/complete`)
      toast.success('Appointment completed successfully')
      fetchAppointments()
    } catch (error) {
      toast.error('Error completing appointment')
    }
  }

  const runAction = async (id, path, successMsg, errorMsg, body) => {
    try {
      await api.patch(`/appointments/${id}/${path}`, body)
      toast.success(successMsg)
      fetchAppointments()
    } catch (error) {
      toast.error(error.response?.data?.message || errorMsg)
    }
  }

  const handleCheckIn = (id) => runAction(id, 'check-in', 'Driver checked in', 'Error checking in')
  const handleStart = (id) => runAction(id, 'start', 'Exam started', 'Error starting exam')
  const handleNoShow = (id) => {
    if (!window.confirm('Mark this driver as No Show?')) return
    runAction(id, 'no-show', 'Marked as No Show', 'Error updating appointment')
  }
  const handleMarkLate = (id) => {
    if (!window.confirm('Mark this appointment as Late?')) return
    runAction(id, 'late', 'Marked as late', 'Error updating appointment')
  }
  const handleReassignExaminer = (id) => {
    const examinerId = window.prompt('Enter the examiner user ID:')
    if (!examinerId) return
    runAction(id, 'reassign-examiner', 'Examiner reassigned', 'Error reassigning examiner', { examiner_id: Number(examinerId) })
  }
  const handleApproveReschedule = (id) => {
    const newDate = window.prompt('Enter the new date & time (YYYY-MM-DD HH:MM):')
    if (!newDate) return
    runAction(id, 'approve-reschedule', 'Reschedule approved', 'Error approving reschedule', { appointment_date: newDate })
  }
  const handleRejectReschedule = (id) => {
    const reason = window.prompt('Reason for rejecting the reschedule request (optional):') || ''
    runAction(id, 'reject-reschedule', 'Reschedule request rejected', 'Error rejecting reschedule', { reason })
  }

  const handleSelectAppointment = (appointmentId) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId) 
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAppointments.length === appointments.length) {
      setSelectedAppointments([])
    } else {
      setSelectedAppointments(appointments.map(a => a.id || a.appointment_id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedAppointments.length === 0) {
      toast.error('Please select at least one appointment')
      return
    }

    const confirmMessage = action === 'cancel'
      ? `Are you sure you want to cancel ${selectedAppointments.length} appointment(s)?`
      : action === 'complete'
      ? `Are you sure you want to mark ${selectedAppointments.length} appointment(s) as complete?`
      : `Are you sure you want to delete ${selectedAppointments.length} appointment(s)?`

    if (!window.confirm(confirmMessage)) return

    try {
      if (action === 'delete') {
        await Promise.all(selectedAppointments.map(id => api.delete(`/appointments/${id}`)))
        toast.success(`${selectedAppointments.length} appointment(s) deleted successfully`)
      } else if (action === 'cancel') {
        await Promise.all(selectedAppointments.map(id => api.patch(`/appointments/${id}/cancel`)))
        toast.success(`${selectedAppointments.length} appointment(s) cancelled successfully`)
      } else {
        await Promise.all(selectedAppointments.map(id => api.patch(`/appointments/${id}/complete`)))
        toast.success(`${selectedAppointments.length} appointment(s) completed successfully`)
      }
      setSelectedAppointments([])
      fetchAppointments()
    } catch (error) {
      toast.error(`Error performing ${action} action`)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      
      const response = await api.get(`/appointments/export?${params}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `appointments-export-${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Export successful')
    } catch (error) {
      toast.error('Error exporting appointments')
    }
  }

  const statusConfig = {
    Pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    Approved: { label: 'Approved', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
    'Checked In': { label: 'Checked In', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    Waiting: { label: 'Waiting', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
    'In Progress': { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    Completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    Cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
    Rescheduled: { label: 'Rescheduled', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
    'No Show': { label: 'No Show', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    Expired: { label: 'Expired', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' }
  }

  const typeIcons = {
    'Theory Test': <ClipboardList className="w-4 h-4" />,
    'Practical Test': <ClipboardList className="w-4 h-4" />,
    'License Collection': <ClipboardList className="w-4 h-4" />,
    'Renewal': <ClipboardList className="w-4 h-4" />
  }

  const formatDate = (value) => {
    if (!value) return 'â€”'
    const date = new Date(value)
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  const StatCard = ({ label, value, icon, colorClass }) => (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-black tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Link to="/dashboard/appointments/new" className="btn btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto">
          <Plus className="w-5 h-5" />
          <span>Schedule Appointment</span>
        </Link>
        {selectedAppointments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('cancel')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel ({selectedAppointments.length})</span>
            </button>
            <button
              onClick={() => handleBulkAction('complete')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete ({selectedAppointments.length})</span>
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn btn-secondary flex items-center space-x-2 text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedAppointments.length})</span>
            </button>
          </div>
        )}
        <button
          onClick={handleExport}
          className="btn btn-secondary flex items-center justify-center space-x-2 w-full lg:w-auto"
        >
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Appointments"
          value={stats.total || 0}
          icon={<CalendarDays className="w-5 h-5 text-slate-700" />}
          colorClass="bg-slate-100"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled || 0}
          icon={<Clock className="w-5 h-5 text-sky-700" />}
          colorClass="bg-sky-100"
        />
        <StatCard
          label="Completed"
          value={stats.completed || 0}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
          colorClass="bg-emerald-100"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled || 0}
          icon={<X className="w-5 h-5 text-rose-700" />}
          colorClass="bg-rose-100"
        />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[auto_2fr_1fr_1fr_auto]">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedAppointments.length === appointments.length && appointments.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, national ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-0 transition"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Checked In">Checked In</option>
              <option value="Waiting">Waiting</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="No Show">No Show</option>
              <option value="Expired">Expired</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
            >
              <option value="">All Types</option>
              <option value="Theory Test">Theory Test</option>
              <option value="Practical Test">Practical Test</option>
              <option value="License Collection">License Collection</option>
              <option value="Renewal">Renewal</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); setTypeFilter(''); setPage(1); setSelectedAppointments([]) }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs w-10">
                      <input
                        type="checkbox"
                        checked={selectedAppointments.length === appointments.length && appointments.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Driver</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Type</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Date & Time</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Center</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appointment) => {
                    const s = statusConfig[appointment.status] || statusConfig.Pending
                    return (
                      <tr
                        key={appointment.id || appointment.appointment_id}
                        className="group hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAppointments.includes(appointment.id || appointment.appointment_id)}
                            onChange={() => handleSelectAppointment(appointment.id || appointment.appointment_id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {appointment.first_name} {appointment.last_name}
                              </p>
                              <p className="text-xs text-slate-500">{appointment.national_id || 'â€”'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            {typeIcons[appointment.appointment_type] || <ClipboardList className="w-4 h-4" />}
                            <span className="font-medium">{appointment.appointment_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-slate-900">{formatDate(appointment.appointment_date)}</span>
                            <span className="text-xs text-slate-500">{formatTime(appointment.appointment_date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{appointment.center_name || appointment.location || '—'}</span>
                            </div>
                            {appointment.examiner_name && (
                              <span className="pl-5 text-xs text-slate-400">Examiner: {appointment.examiner_name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                              {s.label}
                            </span>
                            {['Pending', 'Approved'].includes(appointment.status) && new Date(appointment.appointment_date) < new Date() && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                                <AlertCircle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                            {appointment.reschedule_requested ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
                                <CalendarClock className="w-3 h-3" />
                                Reschedule Requested
                              </span>
                            ) : null}
                            {appointment.late_at && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                                <ClockAlert className="w-3 h-3" />
                                Late
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const aid = appointment.id || appointment.appointment_id
                            return (
                          <div className="flex items-center justify-end gap-1.5">
                            {appointment.reschedule_requested && (
                              <>
                                <button
                                  onClick={() => handleApproveReschedule(aid)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-cyan-600 hover:bg-cyan-50 transition"
                                  title="Approve reschedule"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectReschedule(aid)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 transition"
                                  title="Reject reschedule"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {['Pending', 'Approved'].includes(appointment.status) && (
                              <>
                                <Link
                                  to={`/dashboard/appointments/${aid}/edit`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleCheckIn(aid)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                                  title="Check in"
                                >
                                  <LogIn className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleMarkLate(aid)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-orange-500 hover:bg-orange-50 transition"
                                  title="Mark late"
                                >
                                  <ClockAlert className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReassignExaminer(aid)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-violet-600 hover:bg-violet-50 transition"
                                  title="Reassign examiner"
                                >
                                  <Users className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCancel(aid)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 transition"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {['Checked In', 'Waiting'].includes(appointment.status) && (
                              <>
                                <button
                                  onClick={() => handleStart(aid)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                  title="Start"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleNoShow(aid)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-orange-600 hover:bg-orange-50 transition"
                                  title="No Show"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {appointment.status === 'In Progress' && (
                              <button
                                onClick={() => handleComplete(aid)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                title="Complete"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {['Completed', 'Cancelled', 'No Show', 'Expired'].includes(appointment.status) && !appointment.reschedule_requested && (
                              <span className="inline-flex h-8 items-center px-2 text-xs text-slate-400">—</span>
                            )}
                          </div>
                            )
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {appointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                  <CalendarDays className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No appointments found</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                  Try adjusting your filters or schedule a new appointment to get started.
                </p>
                <Link
                  to="/dashboard/appointments/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Appointment
                </Link>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-slate-900">{pagination.total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum
                    if (pagination.pages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                          pageNum === pagination.page
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
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

export default AppointmentList

