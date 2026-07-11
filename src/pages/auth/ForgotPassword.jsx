import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setSent(true)
      toast.success('If an account exists, a reset link has been sent')
    } catch {
      toast.error('Unable to process request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-sm text-slate-500 mb-6">
            If an account exists for {email}, we have sent a password reset link.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                required
              />
            </div>
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
                <Send className="w-4 h-4" />
                Send Reset Link
              </>
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

export default ForgotPassword

