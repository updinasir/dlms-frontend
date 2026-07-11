import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { ChevronRight, Eye, EyeOff, Fingerprint, Globe, Lock, Mail, Shield } from 'lucide-react'
import logo from '../../assets/Day-Logo.png'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)
      toast.success('Login successful!')

      if (result?.user?.must_change_password) {
        navigate('/change-password')
        return
      }

      const role = String(result?.user?.role || '').toLowerCase()
      const roleId = Number(result?.user?.role)
      const canAccessDashboard = ['admin', 'staff'].includes(role) || [1, 2, 3, 4, 5].includes(roleId)

      if (roleId === 6) {
        navigate('/driver-portal')
      } else {
        navigate(canAccessDashboard ? '/dashboard' : '/search-driver')
      }
    } catch (error) {
      const status = error?.response?.status
      const serverMsg = error?.response?.data?.message
      let msg = serverMsg
      if (status === 401) {
        msg = 'Email or password is wrong'
      }
      toast.error(msg || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 px-4 sm:px-6">
      {/* Soft background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/20 blur-3xl" />
      </div>

      {/* Compact card */}
      <div className="w-full max-w-[420px] rounded-[32px] border border-white/80 bg-white/90 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <img src={logo} alt="DLMS Logo" className="mx-auto mb-3 h-14 w-auto object-contain" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">DLMS11</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-900">Driving License System</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-xs font-bold text-primary-600 transition hover:text-primary-700">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-fuchsia-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition hover:shadow-xl hover:shadow-primary-600/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Fingerprint className="h-4 w-4" />
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/search-driver')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <Globe className="h-4 w-4" />
            Search public driver records
          </button>
        </form>

        <p className="mt-5 text-center text-[10px] text-slate-400">
          <Shield className="mb-0.5 inline h-3 w-3" /> © 2024 DLMS11. Secured with role-based authentication.
        </p>
      </div>
    </div>
  )
}

export default Login

