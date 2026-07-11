import { useState, useEffect } from 'react'
import { KeyRound, Key, Plus, Copy, Trash2, Eye, EyeOff, RefreshCw, Shield, Clock, AlertTriangle } from 'lucide-react'
import api from '../../api/axios'

const ApiKeys = () => {
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [apiKeys, setApiKeys] = useState([])
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyDescription, setNewKeyDescription] = useState('')
  const [newKeyScopes, setNewKeyScopes] = useState(['read'])
  const [notification, setNotification] = useState({ show: false, type: 'success', message: '' })
  const [visibleKeys, setVisibleKeys] = useState({})

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await api.get('/api-keys')
      setApiKeys(response.data || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      showNotification('error', 'Key name is required')
      return
    }

    setCreating(true)
    try {
      const response = await api.post('/api-keys', {
        name: newKeyName,
        description: newKeyDescription,
        scopes: newKeyScopes
      })
      showNotification('success', 'API key created successfully')
      setShowCreateModal(false)
      setNewKeyName('')
      setNewKeyDescription('')
      setNewKeyScopes(['read'])
      await fetchApiKeys()
    } catch (error) {
      console.error('Error creating API key:', error)
      showNotification('error', 'Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteKey = async (keyId) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        await api.delete(`/api-keys/${keyId}`)
        showNotification('success', 'API key deleted successfully')
        await fetchApiKeys()
      } catch (error) {
        console.error('Error deleting API key:', error)
        showNotification('error', 'Failed to delete API key')
      }
    }
  }

  const handleRegenerateKey = async (keyId) => {
    if (confirm('Are you sure you want to regenerate this API key? The old key will become invalid immediately.')) {
      try {
        await api.post(`/api-keys/${keyId}/regenerate`)
        showNotification('success', 'API key regenerated successfully')
        await fetchApiKeys()
      } catch (error) {
        console.error('Error regenerating API key:', error)
        showNotification('error', 'Failed to regenerate API key')
      }
    }
  }

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key)
    showNotification('success', 'API key copied to clipboard')
  }

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000)
  }

  const maskKey = (key) => {
    if (!key) return '••••••••••••••••'
    return key.substring(0, 8) + '••••••••••••••••'
  }

  const scopes = [
    { id: 'read', label: 'Read', description: 'Read-only access to data' },
    { id: 'write', label: 'Write', description: 'Create and update data' },
    { id: 'delete', label: 'Delete', description: 'Delete data' },
    { id: 'admin', label: 'Admin', description: 'Full administrative access' }
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
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
            <p className="text-sm text-gray-500">Manage API keys and authentication</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      {notification.show && (
        <div className={`rounded-lg p-4 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Active Keys</h3>
          <span className="text-sm text-gray-500">{apiKeys.length} keys</span>
        </div>
        {apiKeys.length === 0 ? (
          <div className="py-12 text-center">
            <Key className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No API keys found. Create your first key to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{apiKey.name}</h4>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        apiKey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {apiKey.status === 'active' ? <Shield className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {apiKey.status}
                      </span>
                    </div>
                    {apiKey.description && (
                      <p className="mt-1 text-sm text-gray-600">{apiKey.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono text-gray-700">
                        {visibleKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="rounded p-1 text-gray-400 hover:text-gray-600"
                      >
                        {visibleKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleCopyKey(apiKey.key)}
                        className="rounded p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {apiKey.scopes?.map((scope) => (
                        <span key={scope} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {scope}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Created: {new Date(apiKey.created_at).toLocaleString()} • 
                      Last used: {apiKey.last_used ? new Date(apiKey.last_used).toLocaleString() : 'Never'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegenerateKey(apiKey.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Regenerate
                    </button>
                    <button
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New API Key</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name *</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  placeholder="Describe the purpose of this key"
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scopes</label>
                <div className="space-y-2">
                  {scopes.map((scope) => (
                    <label key={scope.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={newKeyScopes.includes(scope.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyScopes([...newKeyScopes, scope.id])
                          } else {
                            setNewKeyScopes(newKeyScopes.filter(s => s !== scope.id))
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">{scope.label}</span>
                        <p className="text-xs text-gray-500">{scope.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={creating}
                className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900">Security Notice</h4>
            <p className="mt-1 text-sm text-amber-800">
              API keys provide full access to your system. Never share your keys publicly. 
              Regenerate keys regularly and delete unused keys. Keep the minimum required scopes for each key.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiKeys
