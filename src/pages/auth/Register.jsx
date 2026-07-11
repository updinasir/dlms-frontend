import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Car, UserPlus, Eye, EyeOff } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role_id: '6'
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])

  const validatePassword = (value) => {
    const errors = []
    if (value.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(value)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(value)) errors.push('One lowercase letter')
    if (!/[0-9]/.test(value)) errors.push('One number')
    if (!/[!@#$%^&*]/.test(value)) errors.push('One special character (!@#$%^&*)')
    setPasswordErrors(errors)
    return errors.length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (name === 'password') validatePassword(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validatePassword(formData.password)) {
      toast.error('Password does not meet requirements')
      return
    }
    setLoading(true)
    try {
      await register({
        ...formData,
        role_id: Number(formData.role_id)
      })
      toast.success('Registration successful!')
      navigate('/dashboard')
    } catch (error) {
      const msg = error?.response?.data?.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
              <Car className="w-8 h-8 text-slate-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 mt-1 text-sm">Join the DLMS11 system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                placeholder="Enter your phone"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                  placeholder="Create a strong password"
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
              {passwordErrors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {passwordErrors.map((err) => (
                    <li key={err} className="text-xs text-rose-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-rose-500" />
                      {err}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

