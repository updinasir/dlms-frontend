import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token')
    }
  }, [token])

  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
    if (!/[0-9]/.test(password)) errors.push('One digit')
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('One special character')
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      toast.error('Reset token is missing')
      return
    }

    const errors = validatePassword(newPassword)
    if (errors.length > 0) {
      toast.error(`Password must contain: ${errors.join(', ')}`)
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword })
      setSuccess(true)
      toast.success('Password reset successfully')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Password reset complete</h2>
          <p className="text-sm text-slate-500 mb-6">
            Your password has been updated. You will be redirected to login.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create new password</h1>
          <p className="mt-1 text-sm text-slate-500">Enter a strong password for your account</p>
        </div>

        {!token && (
          <div className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
            Invalid or missing reset token. Please request a new password reset link.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, number, symbol"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && (
              <ul className="mt-2 space-y-1">
                {validatePassword(newPassword).map((err) => (
                  <li key={err} className="text-xs text-rose-600 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-rose-500" />
                    {err}
                  </li>
                ))}
                {validatePassword(newPassword).length === 0 && (
                  <li className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Password meets all requirements
                  </li>
                )}
              </ul>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                required
              />
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-xs text-rose-600">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

