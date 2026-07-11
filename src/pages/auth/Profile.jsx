import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  ArrowLeft, LogOut, Mail, Phone, MapPin, BadgeCheck, Clock3, UserRound,
  Camera, Loader2, ShieldCheck, Calendar, User, IdCard
} from 'lucide-react'
import { resolveUploadSrc } from '../../utils/media'

const resolveImageSrc = resolveUploadSrc

const Profile = () => {
  const { user, logout, updateUser } = useAuth()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Account'
  const userInitial = user?.first_name?.[0] || 'A'
  const profileImage = user?.profile_image || user?.photo || ''

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'N/A'

  const roleLabels = { 1: 'Super Admin', 2: 'Admin', 3: 'Examiner', 4: 'Staff', 5: 'Cashier', 6: 'Driver' }
  const roleName = roleLabels[user?.role] || user?.role_name || 'Account'

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="group flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-colors hover:bg-slate-100/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('profile_image', file)
      const response = await api.patch('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(response.data.user)
      toast.success('Profile image updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-primary-600 via-primary-500 to-fuchsia-500"></div>
        <div className="relative px-6 pb-6 pt-20">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
              <div className="group relative -mt-2">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[26px] border-4 border-white bg-gradient-to-br from-primary-600 via-primary-500 to-fuchsia-500 text-white shadow-xl shadow-primary-600/20">
                  {profileImage ? (
                    <img
                      src={resolveImageSrc(profileImage)}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black">{userInitial}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50"
                  title="Change profile image"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="pb-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Account</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{fullName}</h1>
                <p className="mt-1 text-sm text-slate-500">{user?.email || 'No email available'}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {roleName}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.9fr]">
        <div className="space-y-6">
          {/* Account Details */}
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <UserRound className="h-4 w-4" />
              Account Details
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow icon={User} label="First Name" value={user?.first_name || 'N/A'} />
              <InfoRow icon={User} label="Last Name" value={user?.last_name || 'N/A'} />
              <InfoRow icon={Mail} label="Email Address" value={user?.email || 'N/A'} />
              <InfoRow icon={Phone} label="Phone Number" value={user?.phone || 'N/A'} />
              <InfoRow icon={MapPin} label="Address" value={user?.address || 'N/A'} />
              <InfoRow icon={BadgeCheck} label="Role" value={roleName} />
            </div>
          </div>

          {/* Photo Management */}
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <Camera className="h-4 w-4" />
              Profile Photo
            </div>
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {profileImage ? (
                  <img src={resolveImageSrc(profileImage)} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-fuchsia-50 text-primary-600">
                    <UserRound className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">Change your profile picture</p>
                <p className="max-w-md text-xs text-slate-500">
                  JPG or PNG recommended. The image will appear in the top navigation bar and on this profile page.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  Upload New Photo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <Clock3 className="h-4 w-4" />
              Account Status
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Status</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {user?.status || 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">User ID</span>
                <span className="text-sm font-semibold text-slate-900">#{user?.id || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Joined</span>
                <span className="text-sm font-semibold text-slate-900">{createdAt}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-gradient-to-br from-primary-600 via-primary-500 to-fuchsia-500 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Quick Tip</p>
            <p className="mt-3 text-lg font-semibold leading-7">Use the profile page to review your account. Upload a clear photo so others can recognize you easily.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

