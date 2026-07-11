import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const role = String(user?.role || '').toLowerCase()
  const roleId = Number(user?.role)
  const isPrivileged = ['admin', 'staff'].includes(role) || [1, 2, 3, 4, 5].includes(roleId)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const isChangingPassword = location.pathname === '/change-password'
  if (user?.must_change_password && !isChangingPassword) {
    return <Navigate to="/change-password" replace />
  }

  if (location.pathname.startsWith('/dashboard') && !isPrivileged) {
    return <Navigate to="/search-driver" replace />
  }

  return children
}

export default ProtectedRoute
