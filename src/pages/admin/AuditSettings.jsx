import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Settings, Save, Archive, Trash2, ShieldCheck, Bell, Database, FileDown
} from 'lucide-react'

const STORAGE_KEY = 'dlms_audit_settings'

const defaultSettings = {
  retentionDays: 365,
  autoCleanup: true,
  archiveEnabled: true,
  archiveAfterDays: 180,
  exportPermissions: 'admin',
  securityNotifications: true,
  integrityVerification: true,
  storageLocation: 'database',
}

const AuditSettings = () => {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setSettings({ ...defaultSettings, ...JSON.parse(saved) })
    } catch { /* ignore */ }
  }, [])

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }))

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    toast.success('Audit settings saved')
  }

  const Toggle = ({ label, description, value, onChange, icon: Icon }) => (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? 'bg-primary-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  )

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Audit Settings</h1>
            <p className="text-sm text-slate-500">Configure audit retention, cleanup, archiving and integrity.</p>
          </div>
        </div>
        <button onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700">
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Retention & Cleanup</h2>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Audit retention period (days)</label>
            <input
              type="number"
              min={1}
              value={settings.retentionDays}
              onChange={(e) => update('retentionDays', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <Toggle label="Automatic cleanup" description="Automatically delete logs older than the retention period." value={settings.autoCleanup} onChange={(v) => update('autoCleanup', v)} icon={Trash2} />
        </div>

        <div className="card">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Archiving</h2>
          <Toggle label="Log archiving" description="Archive old logs instead of deleting them." value={settings.archiveEnabled} onChange={(v) => update('archiveEnabled', v)} icon={Archive} />
          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Archive logs after (days)</label>
            <input
              type="number"
              min={1}
              value={settings.archiveAfterDays}
              onChange={(e) => update('archiveAfterDays', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        <div className="card">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Permissions & Security</h2>
          <div className="mb-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Export permissions</label>
            <select
              value={settings.exportPermissions}
              onChange={(e) => update('exportPermissions', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            >
              <option value="admin">Admins only</option>
              <option value="admin_examiner">Admins & Examiners</option>
              <option value="all_staff">All staff</option>
            </select>
          </div>
          <Toggle label="Security notifications" description="Notify admins of suspicious or critical audit events." value={settings.securityNotifications} onChange={(v) => update('securityNotifications', v)} icon={Bell} />
          <Toggle label="Log integrity verification" description="Verify logs using digital signatures to detect tampering." value={settings.integrityVerification} onChange={(v) => update('integrityVerification', v)} icon={ShieldCheck} />
        </div>

        <div className="card">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Storage</h2>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Audit storage location</label>
            <select
              value={settings.storageLocation}
              onChange={(e) => update('storageLocation', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            >
              <option value="database">Primary Database</option>
              <option value="cold_storage">Cold Storage</option>
              <option value="external">External / Cloud</option>
            </select>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <Database className="h-4 w-4 text-slate-400" />
            Settings are stored locally in this browser. Connect a backend endpoint to persist them system-wide.
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditSettings
