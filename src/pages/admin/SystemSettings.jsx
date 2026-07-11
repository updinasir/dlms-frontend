import { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw, Bell, Mail, Shield, Database, Globe, Clock, Users, Lock } from 'lucide-react'
import api from '../../api/axios'

const SystemSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'DLMS',
    siteDescription: 'Driving License Management System',
    contactEmail: 'admin@dlms.com',
    contactPhone: '+1-234-567-8900',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    maintenanceMode: false,
    allowRegistration: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enablePushNotifications: true,
    backupEnabled: true,
    backupFrequency: 'daily',
    backupRetentionDays: 30,
    logRetentionDays: 90,
  })

  const [notification, setNotification] = useState({ show: false, type: 'success', message: '' })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/system')
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings/system', settings)
      showNotification('success', 'Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      showNotification('error', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000)
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setLoading(true)
      try {
        await api.post('/settings/system/reset')
        await fetchSettings()
        showNotification('success', 'Settings reset to default')
      } catch (error) {
        console.error('Error resetting settings:', error)
        showNotification('error', 'Failed to reset settings')
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-sm text-gray-500">Configure system-wide settings and preferences</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {notification.show && (
        <div className={`rounded-lg p-4 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Regional Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
              <select
                value={settings.timeFormat}
                onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                <p className="text-xs text-gray-500">Disable system for maintenance</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Allow Registration</label>
                <p className="text-xs text-gray-500">Enable new user registration</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.allowRegistration ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                min={5}
                max={120}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                min={3}
                max={10}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Password Policy</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
              <input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                min={6}
                max={20}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Uppercase</label>
              <button
                onClick={() => setSettings({ ...settings, passwordRequireUppercase: !settings.passwordRequireUppercase })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.passwordRequireUppercase ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.passwordRequireUppercase ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Lowercase</label>
              <button
                onClick={() => setSettings({ ...settings, passwordRequireLowercase: !settings.passwordRequireLowercase })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.passwordRequireLowercase ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.passwordRequireLowercase ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Numbers</label>
              <button
                onClick={() => setSettings({ ...settings, passwordRequireNumbers: !settings.passwordRequireNumbers })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.passwordRequireNumbers ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.passwordRequireNumbers ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Require Special Characters</label>
              <button
                onClick={() => setSettings({ ...settings, passwordRequireSpecialChars: !settings.passwordRequireSpecialChars })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.passwordRequireSpecialChars ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.passwordRequireSpecialChars ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Send notifications via email</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enableEmailNotifications: !settings.enableEmailNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableEmailNotifications ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                <p className="text-xs text-gray-500">Send notifications via SMS</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enableSMSNotifications: !settings.enableSMSNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableSMSNotifications ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableSMSNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-xs text-gray-500">Send in-app push notifications</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enablePushNotifications: !settings.enablePushNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enablePushNotifications ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enablePushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Backup & Maintenance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Backups</label>
                <p className="text-xs text-gray-500">Automatically backup database</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, backupEnabled: !settings.backupEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.backupEnabled ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.backupEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backup Retention (days)</label>
              <input
                type="number"
                value={settings.backupRetentionDays}
                onChange={(e) => setSettings({ ...settings, backupRetentionDays: parseInt(e.target.value) })}
                min={7}
                max={365}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Log Retention (days)</label>
              <input
                type="number"
                value={settings.logRetentionDays}
                onChange={(e) => setSettings({ ...settings, logRetentionDays: parseInt(e.target.value) })}
                min={7}
                max={365}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings
