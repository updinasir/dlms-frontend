import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  Shield,
  ShieldCheck,
  Save,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Users,
  X,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react'

const RoleManagement = () => {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState(null)
  const [rolePermissions, setRolePermissions] = useState([])
  const [expandedModules, setExpandedModules] = useState({})
  const [saving, setSaving] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')

  const [editingRole, setEditingRole] = useState(null)
  const [editName, setEditName] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/permissions')
      ])
      setRoles(rolesRes.data.roles)
      setPermissions(permsRes.data.permissions)
    } catch {
      toast.error('Error loading roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const selectRole = async (role) => {
    setSelectedRole(role)
    setRolePermissions(role.permissions.map((p) => p.permission_id))
    // Expand all modules by default
    const allExpanded = {}
    Object.keys(permissions).forEach((m) => { allExpanded[m] = true })
    setExpandedModules(allExpanded)
  }

  const togglePermission = (pid) => {
    setRolePermissions((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    )
  }

  const toggleModule = (module) => {
    setExpandedModules((prev) => ({ ...prev, [module]: !prev[module] }))
  }

  const savePermissions = async () => {
    if (!selectedRole) return
    setSaving(true)
    try {
      await api.put(`/roles/${selectedRole.role_id}/permissions`, { permissionIds: rolePermissions })
      toast.success('Permissions saved successfully')
      fetchAll()
    } catch {
      toast.error('Error saving permissions')
    } finally {
      setSaving(false)
    }
  }

  const createRole = async () => {
    if (!newRoleName.trim()) return
    try {
      await api.post('/roles', { role_name: newRoleName.trim() })
      toast.success('Role created')
      setNewRoleName('')
      setShowCreate(false)
      fetchAll()
    } catch {
      toast.error('Error creating role')
    }
  }

  const updateRole = async () => {
    if (!editingRole || !editName.trim()) return
    try {
      await api.put(`/roles/${editingRole.role_id}`, { role_name: editName.trim() })
      toast.success('Role updated')
      setEditingRole(null)
      fetchAll()
    } catch {
      toast.error('Error updating role')
    }
  }

  const deleteRole = async (role) => {
    if (!window.confirm(`Are you sure you want to delete "${role.role_name}"?`)) return
    try {
      await api.delete(`/roles/${role.role_id}`)
      toast.success('Role deleted')
      if (selectedRole?.role_id === role.role_id) setSelectedRole(null)
      fetchAll()
    } catch {
      toast.error('Error deleting role')
    }
  }

  const allPermissionIds = Object.values(permissions).flat().map((p) => p.permission_id)
  const selectAll = () => setRolePermissions([...allPermissionIds])
  const deselectAll = () => setRolePermissions([])

  const getModuleLabel = (module) => {
    const labels = {
      dashboard: 'Dashboard',
      drivers: 'Drivers',
      licenses: 'Licenses',
      exams: 'Exams',
      appointments: 'Appointments',
      payments: 'Payments',
      reports: 'Reports',
      ai: 'AI Features',
      users: 'Users',
      roles: 'Roles & Permissions'
    }
    return labels[module] || module.charAt(0).toUpperCase() + module.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <button
          onClick={() => setShowCreate(true)}
          className="btn btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Create Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Roles List */}
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Roles</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {roles.map((role) => (
              <button
                key={role.role_id}
                onClick={() => selectRole(role)}
                className={`flex w-full items-center gap-3 px-5 py-4 text-left transition ${
                  selectedRole?.role_id === role.role_id
                    ? 'bg-slate-50'
                    : 'hover:bg-slate-50/60'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  selectedRole?.role_id === role.role_id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{role.role_name}</p>
                  <p className="text-xs text-slate-500">{role.permissions?.length || 0} permissions</p>
                </div>
                {role.role_id !== 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingRole(role); setEditName(role.role_name) }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRole(role) }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-700 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {selectedRole?.role_id === role.role_id && (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2 card overflow-hidden">
          {!selectedRole ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Select a role</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">Click on a role from the list to manage its permissions.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedRole.role_name}</h2>
                    <p className="text-xs text-slate-500">{rolePermissions.length} of {allPermissionIds.length} permissions granted</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={savePermissions}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              <div className="max-h-[32rem] overflow-y-auto">
                {Object.entries(permissions).map(([module, perms]) => {
                  const isExpanded = expandedModules[module] !== false
                  const moduleSelected = perms.filter((p) => rolePermissions.includes(p.permission_id)).length
                  const allSelected = moduleSelected === perms.length
                  return (
                    <div key={module} className="border-b border-slate-50 last:border-0">
                      <button
                        onClick={() => toggleModule(module)}
                        className="flex w-full items-center gap-3 px-6 py-3 text-left hover:bg-slate-50/40 transition"
                      >
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                        <span className="flex-1 text-sm font-bold text-slate-800">{getModuleLabel(module)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          allSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {moduleSelected}/{perms.length}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="px-6 pb-3">
                          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {perms.map((p) => {
                              const checked = rolePermissions.includes(p.permission_id)
                              return (
                                <label
                                  key={p.permission_id}
                                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                                    checked
                                      ? 'border-slate-300 bg-slate-50'
                                      : 'border-transparent hover:bg-slate-50/40'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => togglePermission(p.permission_id)}
                                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">{p.label}</p>
                                  </div>
                                  {checked ? (
                                    <Unlock className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-slate-300" />
                                  )}
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Role</h3>
            <input
              type="text"
              placeholder="Role name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={createRole}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Create
              </button>
              <button
                onClick={() => { setShowCreate(false); setNewRoleName('') }}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Role Name</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={updateRole}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditingRole(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleManagement

