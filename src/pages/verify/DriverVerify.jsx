import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { ShieldCheck, AlertCircle, User, Calendar, MapPin, Phone, Droplet, Fingerprint, CheckCircle2, XCircle } from 'lucide-react'
import { resolveUploadSrc } from '../../utils/media'

const resolvePhotoSrc = resolveUploadSrc

const DriverVerify = () => {
  const { id } = useParams()
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verify = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/drivers/verify/${id}`)
        setDriver(response.data.driver)
      } catch (err) {
        setError('Driver verification failed or record not found.')
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !driver) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="rounded-full bg-rose-100 p-4 text-rose-600">
          <XCircle className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Invalid or Expired QR Code</h1>
        <p className="mt-2 text-slate-600">{error || 'No driver record could be found for this code.'}</p>
      </div>
    )
  }

  const isVerified = driver.status === 'Approved'

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-500"></div>
          <div className="relative px-6 pb-6 pt-0">
            <div className="-mt-12 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[22px] border-4 border-white bg-gradient-to-br from-primary-600 via-primary-500 to-fuchsia-500 text-white shadow-lg">
                {driver.photo ? (
                  <img src={resolvePhotoSrc(driver.photo)} alt={driver.full_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-black">{driver.full_name?.[0] || 'D'}</span>
                )}
              </div>
            </div>

            <div className="mt-4 text-center">
              <h1 className="text-xl font-black text-slate-900">{driver.full_name || 'Unknown Driver'}</h1>
              <p className="text-sm text-slate-500">National ID: {driver.national_id || 'N/A'}</p>
              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {isVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                {isVerified ? 'Verified Driver' : `Status: ${driver.status || 'Pending'}`}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Driver ID</p>
                  <p className="text-sm font-semibold text-slate-900">#{driver.driver_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gender</p>
                  <p className="text-sm font-semibold text-slate-900">{driver.gender || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date of Birth</p>
                  <p className="text-sm font-semibold text-slate-900">{driver.date_of_birth ? new Date(driver.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                  <Droplet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Blood Group</p>
                  <p className="text-sm font-semibold text-slate-900">{driver.blood_group || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">City</p>
                  <p className="text-sm font-semibold text-slate-900">{driver.city || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</p>
                  <p className="text-sm font-semibold text-slate-900">{driver.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">DLMS Driver Verification</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/dashboard" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DriverVerify
