import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

const safeGetUser = () => {
  try {
    const data = localStorage.getItem('user')
    return data ? JSON.parse(data) : null
  } catch (e) {
    localStorage.removeItem('user')
    return null
  }
}

const safeGetToken = () => {
  try {
    return localStorage.getItem('token') || null
  } catch (e) {
    localStorage.removeItem('token')
    return null
  }
}

const safeGetPermissions = () => {
  try {
    const data = localStorage.getItem('permissions')
    return data ? JSON.parse(data) : {}
  } catch (e) {
    localStorage.removeItem('permissions')
    return {}
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = safeGetToken()
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setUser(safeGetUser())
    setPermissions(safeGetPermissions())
    setLoading(false)
  }, [])

  const fetchPermissions = async () => {
    try {
      const res = await api.get('/roles/my-permissions')
      const perms = res.data.permissions || {}
      localStorage.setItem('permissions', JSON.stringify(perms))
      setPermissions(perms)
      return perms
    } catch {
      return {}
    }
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { user, token } = res.data
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    fetchPermissions().catch(() => {})
    return res.data
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { user, token } = res.data
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    fetchPermissions().catch(() => {})
    return res.data
  }

  const logout = () => {
    api.post('/auth/logout').catch(() => {})

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setPermissions({})
  }

  const updateUser = (userData) => {
    const nextUser = { ...user, ...userData }
    localStorage.setItem('user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const hasPermission = (module, action) => {
    if (!permissions) return false
    if (user?.role === 1) return true // Super Admin
    const modPerms = permissions[module]
    if (!modPerms) return false
    return modPerms.includes(action)
  }

  const value = {
    user,
    permissions,
    login,
    register,
    logout,
    updateUser,
    hasPermission,
    isAuthenticated: !!user
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
