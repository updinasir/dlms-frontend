import { useState, useEffect } from 'react'
import { Globe, Languages, Save, RefreshCw, CheckCircle2, Flag } from 'lucide-react'
import api from '../../api/axios'

const LanguageSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    defaultLanguage: 'en',
    availableLanguages: ['en', 'es', 'fr', 'ar'],
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    numberFormat: 'en-US',
    currency: 'USD',
    timezone: 'UTC'
  })
  const [notification, setNotification] = useState({ show: false, type: 'success', message: '' })

  useEffect(() => {
    fetchLanguageSettings()
  }, [])

  const fetchLanguageSettings = async () => {
    try {
      const response = await api.get('/settings/language')
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }))
      }
    } catch (error) {
      console.error('Error fetching language settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings/language', settings)
      showNotification('success', 'Language settings saved successfully')
    } catch (error) {
      console.error('Error saving language settings:', error)
      showNotification('error', 'Failed to save language settings')
    } finally {
      setSaving(false)
    }
  }

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000)
  }

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  ]

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY', example: '31.12.2024' },
  ]

  const timeFormats = [
    { value: '12h', label: '12-hour (AM/PM)', example: '2:30 PM' },
    { value: '24h', label: '24-hour', example: '14:30' },
  ]

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
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
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Language Settings</h1>
            <p className="text-sm text-gray-500">Configure language and localization</p>
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
        {/* Default Language */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Default Language</h3>
          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSettings({ ...settings, defaultLanguage: lang.code })}
                className={`flex items-center gap-3 w-full rounded-xl border p-4 text-left transition ${
                  settings.defaultLanguage === lang.code
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{lang.name}</p>
                  <p className="text-xs text-gray-500">{lang.nativeName}</p>
                </div>
                {settings.defaultLanguage === lang.code && (
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Available Languages */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Available Languages</h3>
          <p className="mb-4 text-sm text-gray-500">Select which languages should be available to users</p>
          <div className="space-y-3">
            {languages.map((lang) => (
              <label key={lang.code} className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.availableLanguages.includes(lang.code)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettings({ ...settings, availableLanguages: [...settings.availableLanguages, lang.code] })
                    } else {
                      setSettings({ ...settings, availableLanguages: settings.availableLanguages.filter(l => l !== lang.code) })
                    }
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{lang.name}</p>
                  <p className="text-xs text-gray-500">{lang.nativeName}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date Format */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Date Format</h3>
          <div className="space-y-2">
            {dateFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => setSettings({ ...settings, dateFormat: format.value })}
                className={`flex items-center justify-between w-full rounded-lg border p-4 text-left transition ${
                  settings.dateFormat === format.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{format.label}</p>
                  <p className="text-xs text-gray-500">Example: {format.example}</p>
                </div>
                {settings.dateFormat === format.value && (
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Time Format */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Time Format</h3>
          <div className="space-y-2">
            {timeFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => setSettings({ ...settings, timeFormat: format.value })}
                className={`flex items-center justify-between w-full rounded-lg border p-4 text-left transition ${
                  settings.timeFormat === format.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{format.label}</p>
                  <p className="text-xs text-gray-500">Example: {format.example}</p>
                </div>
                {settings.timeFormat === format.value && (
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Currency</h3>
          <div className="space-y-2">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => setSettings({ ...settings, currency: currency.code })}
                className={`flex items-center justify-between w-full rounded-lg border p-4 text-left transition ${
                  settings.currency === currency.code
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{currency.name}</p>
                  <p className="text-xs text-gray-500">Symbol: {currency.symbol}</p>
                </div>
                {settings.currency === currency.code && (
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Timezone</h3>
          <div>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Europe/Berlin">Berlin (CET)</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
              <option value="Asia/Riyadh">Riyadh (AST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Preview</h3>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit' 
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: settings.timeFormat === '12h'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Currency</p>
              <p className="text-lg font-semibold text-gray-900">
                {currencies.find(c => c.code === settings.currency)?.symbol}1,234.56
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LanguageSettings
