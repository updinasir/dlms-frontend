import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Send, Bell, ChevronLeft, Megaphone, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

const NotificationComposer = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [notificationType, setNotificationType] = useState('System')
  const [loading, setLoading] = useState(false)

  const types = [
    { key: 'System', label: 'System', desc: 'In-app only', icon: Info, color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { key: 'Email', label: 'Email', desc: 'Real email to driver', icon: Megaphone, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'SMS', label: 'SMS', desc: 'Real SMS to driver phone', icon: AlertTriangle, color: 'bg-amber-50 text-amber-700 border-amber-200' }
  ]

  const handleSend = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/notifications/broadcast', {
        title: title.trim(),
        message: message.trim(),
        notification_type: notificationType
      })
      const extra = res.data.sent != null ? ` (${res.data.sent} sent, ${res.data.failed} failed)` : ''
      toast.success(`${res.data.message} â€” ${res.data.recipients} drivers${extra}`)
      setTitle('')
      setMessage('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = types.find((t) => t.key === notificationType)
  const TypeIcon = selectedType?.icon || Info

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notification Composer</h1>
          <p className="text-sm text-slate-500">Send a message to all registered drivers</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Broadcast Message</h2>
              <p className="text-xs text-slate-500">Every driver with a portal account will receive this.</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Type selector */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Notification Type</label>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => {
                  const Icon = t.icon
                  const active = notificationType === t.key
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setNotificationType(t.key)}
                      className={`inline-flex flex-col items-center gap-0.5 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                        active ? t.color : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" />
                        {t.label}
                      </span>
                      <span className="text-[10px] font-medium normal-case tracking-normal opacity-80">{t.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New License Renewal Policy"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the full message here..."
                rows={6}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition resize-none"
                required
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>This will be sent to every driver immediately.</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send to All Drivers'}
            </button>
          </div>
        </form>

      {title.trim() || message.trim() ? (
        <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Preview</h3>
            </div>
            <div className="px-6 py-5">
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide mb-3 ${selectedType?.color}`}>
                <TypeIcon className="h-3 w-3" />
                {selectedType?.label}
              </div>
              <h4 className="text-base font-bold text-slate-900">{title || 'Notification Title'}</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{message || 'Notification message body...'}</p>
            </div>
          </div>
        ) : null}
    </div>
  )
}

export default NotificationComposer

