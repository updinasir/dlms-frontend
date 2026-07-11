import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  ChevronLeft, Info, CheckCircle2, AlertTriangle, AlertCircle,
  Trash2, Archive, ExternalLink, Clock, User, Hash, Layers, Radio, CheckCheck
} from 'lucide-react'
import { formatDateTime, relativeTime, categoryStyles, priorityStyles } from '../../utils/notifications'

const categoryIcon = (category, cls = 'h-6 w-6') => {
  switch (category) {
    case 'Success': return <CheckCircle2 className={`${cls} text-emerald-500`} />
    case 'Warning': return <AlertTriangle className={`${cls} text-amber-500`} />
    case 'Error': return <AlertCircle className={`${cls} text-rose-500`} />
    default: return <Info className={`${cls} text-sky-500`} />
  }
}

const Row = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 py-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-slate-800">{children}</div>
    </div>
  </div>
)

const NotificationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/notifications/${id}`)
        setNotification(res.data.notification)
        if (res.data.notification?.is_read === 0) {
          api.patch(`/notifications/${id}/read`).catch(() => {})
        }
      } catch {
        toast.error('Notification not found')
        navigate('/dashboard/notifications')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const remove = async () => {
    try {
      await api.delete(`/notifications/${id}`)
      toast.success('Notification deleted')
      navigate('/dashboard/notifications')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const archive = async () => {
    try {
      await api.patch(`/notifications/${id}/archive`)
      toast.success('Notification archived')
      navigate('/dashboard/notifications')
    } catch {
      toast.error('Failed to archive')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" />
      </div>
    )
  }

  if (!notification) return null

  const style = categoryStyles[notification.category] || categoryStyles.Information

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <button
        onClick={() => navigate('/dashboard/notifications')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to notifications
      </button>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Header */}
        <div className={`flex items-start gap-4 border-b border-slate-100 p-6 ${style.bg}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            {categoryIcon(notification.category)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text} ring-1 ${style.ring}`}>
                {notification.category}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[notification.priority] || priorityStyles.Medium}`}>
                {notification.priority} priority
              </span>
              {notification.is_read === 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  <CheckCheck className="h-3 w-3" /> Read
                </span>
              )}
            </div>
            <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900">{notification.title}</h1>
            <p className="mt-1 text-xs text-slate-500">{relativeTime(notification.created_at)}</p>
          </div>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{notification.message}</p>

          {notification.related_link && (
            <Link
              to={notification.related_link}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
            >
              <ExternalLink className="h-4 w-4" /> View related record
            </Link>
          )}
        </div>

        {/* Meta grid */}
        <div className="grid gap-x-8 border-t border-slate-100 px-6 py-2 sm:grid-cols-2">
          <Row icon={Hash} label="Notification ID">#{notification.id}</Row>
          <Row icon={Layers} label="Related Module">
            <span className="capitalize">{notification.related_module || 'General'}</span>
          </Row>
          <Row icon={Radio} label="Delivery Channel">
            <span className="capitalize">{notification.delivery_channel}</span>
          </Row>
          <Row icon={CheckCheck} label="Status">{notification.status}</Row>
          <Row icon={User} label="Triggered By">{notification.triggered_by_name || 'System'}</Row>
          <Row icon={User} label="Recipient">
            {notification.recipient_user_name || notification.recipient_driver_name || 'You'}
          </Row>
          <Row icon={Clock} label="Date & Time">{formatDateTime(notification.created_at)}</Row>
          {notification.read_at && (
            <Row icon={Clock} label="Read At">{formatDateTime(notification.read_at)}</Row>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button onClick={archive}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Archive className="h-4 w-4" /> Archive
          </button>
          <button onClick={remove}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationDetail
