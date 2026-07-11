import { useState, useEffect } from 'react'
import { Palette, Brush, Sun, Moon, Monitor, Save, RefreshCw, CheckCircle2 } from 'lucide-react'
import api from '../../api/axios'

const ThemeSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    mode: 'light',
    primaryColor: '#2563eb',
    accentColor: '#8b5cf6',
    fontSize: 'medium',
    borderRadius: 'medium',
    sidebarCollapsed: false,
    compactMode: false
  })
  const [notification, setNotification] = useState({ show: false, type: 'success', message: '' })

  useEffect(() => {
    fetchThemeSettings()
  }, [])

  const fetchThemeSettings = async () => {
    try {
      const response = await api.get('/settings/theme')
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }))
      }
    } catch (error) {
      console.error('Error fetching theme settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings/theme', settings)
      showNotification('success', 'Theme settings saved successfully')
      // Apply theme changes immediately
      applyTheme()
    } catch (error) {
      console.error('Error saving theme settings:', error)
      showNotification('error', 'Failed to save theme settings')
    } finally {
      setSaving(false)
    }
  }

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', settings.mode)
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor)
    document.documentElement.style.setProperty('--accent-color', settings.accentColor)
  }

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000)
  }

  const colorPresets = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
  ]

  const fontSizeOptions = [
    { name: 'Small', value: 'small' },
    { name: 'Medium', value: 'medium' },
    { name: 'Large', value: 'large' },
  ]

  const borderRadiusOptions = [
    { name: 'Sharp', value: 'sharp' },
    { name: 'Medium', value: 'medium' },
    { name: 'Rounded', value: 'rounded' },
  ]

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
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Theme Settings</h1>
            <p className="text-sm text-gray-500">Customize the application appearance</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {notification.show && (
        <div className={`rounded-lg p-4 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Color Mode */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Color Mode</h3>
          <div className="grid gap-3">
            {[
              { id: 'light', name: 'Light', icon: Sun, description: 'Light color scheme' },
              { id: 'dark', name: 'Dark', icon: Moon, description: 'Dark color scheme' },
              { id: 'system', name: 'System', icon: Monitor, description: 'Follow system preference' },
            ].map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setSettings({ ...settings, mode: mode.id })}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    settings.mode === mode.id
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${settings.mode === mode.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{mode.name}</p>
                    <p className="text-xs text-gray-500">{mode.description}</p>
                  </div>
                  {settings.mode === mode.id && (
                    <CheckCircle2 className="ml-auto h-5 w-5 text-primary-600" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Primary Color */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Primary Color</h3>
          <div className="grid grid-cols-3 gap-3">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                onClick={() => setSettings({ ...settings, primaryColor: color.value })}
                className={`relative h-20 rounded-xl border-2 transition ${
                  settings.primaryColor === color.value
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
              >
                {settings.primaryColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="h-10 w-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Accent Color</h3>
          <div className="grid grid-cols-3 gap-3">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                onClick={() => setSettings({ ...settings, accentColor: color.value })}
                className={`relative h-20 rounded-xl border-2 transition ${
                  settings.accentColor === color.value
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
              >
                {settings.accentColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="h-10 w-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Typography</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <div className="grid gap-2">
                {fontSizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({ ...settings, fontSize: option.value })}
                    className={`rounded-lg border p-3 text-left transition ${
                      settings.fontSize === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={`font-medium ${option.value === 'small' ? 'text-sm' : option.value === 'large' ? 'text-lg' : 'text-base'}`}>
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* UI Elements */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">UI Elements</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
              <div className="grid gap-2">
                {borderRadiusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({ ...settings, borderRadius: option.value })}
                    className={`rounded-lg border p-3 text-left transition ${
                      settings.borderRadius === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    style={{
                      borderRadius: option.value === 'sharp' ? '0px' : option.value === 'medium' ? '8px' : '16px'
                    }}
                  >
                    <span className="font-medium">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Layout Options */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Layout Options</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Compact Mode</label>
                <p className="text-xs text-gray-500">Reduce spacing for more content</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, compactMode: !settings.compactMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.compactMode ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Collapsed Sidebar</label>
                <p className="text-xs text-gray-500">Keep sidebar collapsed by default</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, sidebarCollapsed: !settings.sidebarCollapsed })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.sidebarCollapsed ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Preview</h3>
        <div 
          className="rounded-xl border p-6"
          style={{ 
            backgroundColor: settings.mode === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: settings.mode === 'dark' ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-lg"
              style={{ backgroundColor: settings.primaryColor }}
            />
            <div>
              <p className="font-semibold" style={{ color: settings.mode === 'dark' ? '#ffffff' : '#111827' }}>
                Sample Card
              </p>
              <p className="text-sm" style={{ color: settings.mode === 'dark' ? '#9ca3af' : '#6b7280' }}>
                This is how your theme will look
              </p>
            </div>
          </div>
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: settings.primaryColor }}
          >
            Sample Button
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeSettings
