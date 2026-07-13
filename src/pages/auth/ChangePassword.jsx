import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from 'lucide-react'

const ChangePassword = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const isForced = Boolean(user?.must_change_password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const payload = isForced
        ? { newPassword: formData.newPassword }
        : { currentPassword: formData.currentPassword, newPassword: formData.newPassword }
      await api.put('/auth/change-password', payload)
      toast.success('Password changed successfully. Please log in again.')
      updateUser({ must_change_password: false })
      logout()
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isForced ? 'Change Temporary Password' : 'Change Password'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isForced
              ? 'For security, you must change your temporary password before continuing.'
              : 'Update your account password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isForced && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="input w-full pl-10 pr-10"
                  placeholder="Enter current password"
                  required={!isForced}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="input w-full pl-10 pr-10"
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input w-full pl-10 pr-10"
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex w-full items-center justify-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
