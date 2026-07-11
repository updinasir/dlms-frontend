import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ChevronLeft, Bell, Mail, Save } from 'lucide-react'

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? 'bg-primary-600' : 'bg-slate-300'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
)

const NotificationPreferences = () => {
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState({ in_app_enabled: true, email_enabled: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/notifications/user/preferences')
        const p = res.data.preferences || {}
        setPrefs({ in_app_enabled: !!p.in_app_enabled, email_enabled: !!p.email_enabled })
      } catch {
        toast.error('Failed to load preferences')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/notifications/user/preferences', prefs)
      toast.success('Preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <button onClick={() => navigate('/dashboard/notifications')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" /> Back to notifications
      </button>

      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Notification Preferences</h1>
        <p className="text-sm text-slate-500">Choose how you want to be notified.</p>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">In-App Notifications</p>
              <p className="text-xs text-slate-500">Show notifications in the app bell and list.</p>
            </div>
          </div>
          <Toggle checked={prefs.in_app_enabled} onChange={(v) => setPrefs((p) => ({ ...p, in_app_enabled: v }))} />
        </div>
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive important notifications by email.</p>
            </div>
          </div>
          <Toggle checked={prefs.email_enabled} onChange={(v) => setPrefs((p) => ({ ...p, email_enabled: v }))} />
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60">
        <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save preferences'}
      </button>
    </div>
  )
}

export default NotificationPreferences
