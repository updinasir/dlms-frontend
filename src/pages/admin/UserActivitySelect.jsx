import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Search, UserCog, ChevronRight } from 'lucide-react'

const roleLabels = { 1: 'Super Admin', 2: 'Admin', 3: 'Examiner', 4: 'Staff', 5: 'Cashier', 6: 'Driver' }

const UserActivitySelect = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users', { params: { limit: 100, search } })
      setUsers(res.data.users || res.data || [])
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <UserCog className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Activity</h1>
          <p className="text-sm text-slate-500">Select a user to view their complete activity history and timeline.</p>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No users found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <button
                key={u.user_id}
                type="button"
                onClick={() => navigate(`/dashboard/admin/users/${u.user_id}/activity`)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-slate-50/70"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                    {(u.full_name || 'U')[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{u.full_name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{roleLabels[u.role_id] || 'User'}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserActivitySelect
