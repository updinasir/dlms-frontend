import { useState, useEffect } from 'react'
import { Database, HardDrive, Download, Upload, RefreshCw, Trash2, AlertTriangle, CheckCircle, Clock, FileText, Activity } from 'lucide-react'
import api from '../../api/axios'

const DatabaseManagement = () => {
  const [loading, setLoading] = useState(true)
  const [backingUp, setBackingUp] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [stats, setStats] = useState({
    totalSize: 0,
    tableCount: 0,
    lastBackup: null,
    backupCount: 0,
    status: 'healthy'
  })
  const [backups, setBackups] = useState([])
  const [notification, setNotification] = useState({ show: false, type: 'success', message: '' })

  useEffect(() => {
    fetchDatabaseStats()
    fetchBackups()
  }, [])

  const fetchDatabaseStats = async () => {
    try {
      const response = await api.get('/database/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching database stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBackups = async () => {
    try {
      const response = await api.get('/database/backups')
      setBackups(response.data || [])
    } catch (error) {
      console.error('Error fetching backups:', error)
    }
  }

  const handleBackup = async () => {
    setBackingUp(true)
    try {
      await api.post('/database/backup')
      showNotification('success', 'Backup created successfully')
      await fetchDatabaseStats()
      await fetchBackups()
    } catch (error) {
      console.error('Error creating backup:', error)
      showNotification('error', 'Failed to create backup')
    } finally {
      setBackingUp(false)
    }
  }

  const handleRestore = async (backupId) => {
    if (confirm('Are you sure you want to restore this backup? This will replace the current database.')) {
      setRestoring(true)
      try {
        await api.post(`/database/restore/${backupId}`)
        showNotification('success', 'Database restored successfully')
        await fetchDatabaseStats()
      } catch (error) {
        console.error('Error restoring backup:', error)
        showNotification('error', 'Failed to restore backup')
      } finally {
        setRestoring(false)
      }
    }
  }

  const handleDeleteBackup = async (backupId) => {
    if (confirm('Are you sure you want to delete this backup?')) {
      try {
        await api.delete(`/database/backups/${backupId}`)
        showNotification('success', 'Backup deleted successfully')
        await fetchBackups()
        await fetchDatabaseStats()
      } catch (error) {
        console.error('Error deleting backup:', error)
        showNotification('error', 'Failed to delete backup')
      }
    }
  }

  const handleOptimize = async () => {
    try {
      await api.post('/database/optimize')
      showNotification('success', 'Database optimized successfully')
      await fetchDatabaseStats()
    } catch (error) {
      console.error('Error optimizing database:', error)
      showNotification('error', 'Failed to optimize database')
    }
  }

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000)
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
            <p className="text-sm text-gray-500">Manage database operations, backups, and maintenance</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOptimize}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Optimize
          </button>
          <button
            onClick={handleBackup}
            disabled={backingUp}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {backingUp ? 'Creating...' : 'Create Backup'}
          </button>
        </div>
      </div>

      {notification.show && (
        <div className={`rounded-lg p-4 ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      {/* Database Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Database Size</p>
              <p className="text-lg font-bold text-gray-900">{formatSize(stats.totalSize)}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tables</p>
              <p className="text-lg font-bold text-gray-900">{stats.tableCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{stats.status}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Backup</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
          <span className="text-sm text-gray-500">{backups.length} backups</span>
        </div>
        {backups.length === 0 ? (
          <div className="py-12 text-center">
            <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No backups found. Create your first backup.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{backup.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(backup.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatSize(backup.size)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        backup.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {backup.status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(backup.id)}
                          disabled={restoring}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                        >
                          <Upload className="h-3 w-3" />
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Maintenance Actions */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Maintenance Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={handleOptimize}
            className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-4 text-left transition hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Optimize Database</p>
              <p className="text-xs text-gray-500">Improve performance and reclaim space</p>
            </div>
          </button>
          <button
            onClick={() => alert('Vacuum functionality coming soon')}
            className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-4 text-left transition hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Vacuum Database</p>
              <p className="text-xs text-gray-500">Clean up unused data</p>
            </div>
          </button>
          <button
            onClick={() => alert('Analyze functionality coming soon')}
            className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-4 text-left transition hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Analyze Tables</p>
              <p className="text-xs text-gray-500">Check table integrity</p>
            </div>
          </button>
        </div>
      </div>

      {/* Warning Section */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900">Important Notice</h4>
            <p className="mt-1 text-sm text-amber-800">
              Database operations can be critical. Always create a backup before performing maintenance actions. 
              Restoring from backup will replace all current data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatabaseManagement
