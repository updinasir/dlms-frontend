import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  Search,
  User,
  Shield,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  Edit3,
  CheckCircle2,
  XCircle,
  Lock,
  Plus
} from 'lucide-react'

const UserManagement = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [editingUser, setEditingUser] = useState(null)
  const [editRoleId, setEditRoleId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', phone: '', role_id: '', status: 'Active' })
  const [creating, setCreating] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter) params.append('role', roleFilter)
      if (statusFilter) params.append('status', statusFilter)
      params.append('page', page)
      params.append('limit', 10)

      const res = await api.get(`/roles/users/all?${params}`)
      setUsers(res.data.users)
      setRoles(res.data.roles)
      setPagination(res.data.pagination)
    } catch (error) {
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, statusFilter, page])

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/roles/users/${userId}/status`)
      toast.success('User status updated')
      fetchUsers()
    } catch {
      toast.error('Error updating user status')
    }
  }

  const openEditRole = (user) => {
    setEditingUser(user)
    setEditRoleId(user.role_id)
  }

  const handleCreate = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.password) {
      toast.error('Name, email and password are required')
      return
    }
    setCreating(true)
    try {
      await api.post('/users', newUser)
      toast.success('User created successfully')
      setShowCreate(false)
      setNewUser({ full_name: '', email: '', password: '', phone: '', role_id: '', status: 'Active' })
      fetchUsers()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'Error creating user'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  const saveRole = async () => {
    if (!editingUser) return
    try {
      await api.patch(`/roles/users/${editingUser.user_id}/role`, { role_id: editRoleId })
      toast.success('Role updated successfully')
      setEditingUser(null)
      fetchUsers()
    } catch {
      toast.error('Error updating role')
    }
  }

  const getRoleName = (roleId) => {
    const r = roles.find((role) => role.role_id === roleId)
    return r?.role_name || 'Unknown'
  }

  const getRoleColor = (roleId) => {
    const colors = {
      1: 'bg-violet-100 text-violet-700',
      2: 'bg-sky-100 text-sky-700',
      3: 'bg-amber-100 text-amber-700',
      4: 'bg-orange-100 text-orange-700',
      5: 'bg-emerald-100 text-emerald-700',
      6: 'bg-slate-100 text-slate-700'
    }
    return colors[roleId] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <button
          onClick={() => setShowCreate(true)}
          className="btn btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-900">{pagination.total || 0}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Total Users</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {users.filter((u) => u.status === 'Active').length}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Active Users</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {users.filter((u) => u.status !== 'Active').length}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Inactive Users</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={() => { setSearchTerm(''); setRoleFilter(''); setStatusFilter(''); setPage(1) }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">User</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Role</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Email</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Phone</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.user_id} className="group hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => navigate(`/dashboard/admin/users/${u.user_id}/activity`)}
                              className="block text-left font-semibold text-slate-900 transition hover:text-primary-600"
                              title="View user activity"
                            >
                              {u.full_name}
                            </button>
                            <p className="text-xs text-slate-500">ID: {u.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openEditRole(u)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleColor(u.role_id)} hover:opacity-80 transition`}
                        >
                          <Shield className="w-3 h-3" />
                          {getRoleName(u.role_id)}
                          <Edit3 className="w-3 h-3 opacity-50" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4 text-slate-600">{u.phone || 'â€”'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(u.user_id)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              u.status === 'Active'
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            {u.status === 'Active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No users found</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your filters.</p>
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-slate-900">{pagination.total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum
                    if (pagination.pages <= 5) pageNum = i + 1
                    else if (pagination.page <= 3) pageNum = i + 1
                    else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                    else pageNum = pagination.page - 2 + i
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                          pageNum === pagination.page ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New User</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
              />
              <div className="relative">
                <select
                  value={newUser.role_id}
                  onChange={(e) => setNewUser({ ...newUser, role_id: Number(e.target.value) })}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                >
                  <option value="">Select Role</option>
                  {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewUser({ full_name: '', email: '', password: '', phone: '', role_id: '', status: 'Active' }) }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Change Role</h3>
                <p className="text-sm text-slate-500">{editingUser.full_name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <select
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(Number(e.target.value))}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                >
                  {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveRole}
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  Save Role
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement

