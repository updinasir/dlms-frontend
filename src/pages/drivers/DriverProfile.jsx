import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, BadgeCheck, User, QrCode,
  IdCard, Activity, FileText, Briefcase, ShieldCheck, CircleUser, Droplet,
  Fingerprint, Signature, Upload, Loader2
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { resolveUploadSrc } from '../../utils/media'

const DriverProfile = () => {
  const { id } = useParams()
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bioLoading, setBioLoading] = useState(false)
  const [fingerprintData, setFingerprintData] = useState('')
  const signatureInputRef = useRef(null)

  useEffect(() => {
    fetchDriver()
  }, [id])

  useEffect(() => {
    if (driver?.fingerprint_data) {
      setFingerprintData(driver.fingerprint_data)
    }
  }, [driver])

  const fetchDriver = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/drivers/${id}`)
      setDriver(response.data.driver)
    } catch (error) {
      toast.error('Error fetching driver data')
    } finally {
      setLoading(false)
    }
  }

  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('signature', file)
    setBioLoading(true)
    try {
      const response = await api.post(`/drivers/${id}/signature`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setDriver(response.data.driver)
      toast.success('Signature uploaded successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload signature')
    } finally {
      setBioLoading(false)
    }
  }

  const handleFingerprintSave = async () => {
    if (!fingerprintData.trim()) {
      toast.error('Fingerprint data is required')
      return
    }
    setBioLoading(true)
    try {
      const response = await api.post(`/drivers/${id}/fingerprint`, { fingerprint_data: fingerprintData.trim() })
      setDriver(response.data.driver)
      toast.success('Fingerprint saved successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save fingerprint')
    } finally {
      setBioLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Driver not found</p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      Approved: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      Pending: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      Rejected: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const resolvePhotoSrc = resolveUploadSrc

  const getInitials = () => {
    const first = driver.first_name?.[0] || ''
    const last = driver.last_name?.[0] || ''
    return (first + last).toUpperCase() || 'D'
  }

  const getAge = () => {
    if (!driver.date_of_birth) return null
    const diff = Date.now() - new Date(driver.date_of_birth).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Profile</h1>
            <p className="text-gray-600 mt-1">View driver identity, contact details, and approval status</p>
          </div>
        </div>
        <Link to={`/dashboard/drivers/${id}/edit`} className="btn btn-primary flex items-center justify-center space-x-2">
          <Edit className="w-5 h-5" />
          <span>Edit Driver</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-primary-600 to-primary-500"></div>
            <div className="relative px-6 pb-6 pt-16">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
                <div className="relative -mt-2 h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                  {driver.photo ? (
                    <img src={resolvePhotoSrc(driver.photo)} alt={`${driver.first_name} ${driver.last_name}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700">
                      <span className="text-3xl font-bold">{getInitials()}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{driver.first_name} {driver.last_name}</h2>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(driver.status)}`}>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {driver.status}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <IdCard className="h-4 w-4" />
                    {driver.national_id || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Gender</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{driver.gender || 'N/A'}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Age</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{getAge() ?? 'N/A'} yrs</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Blood Group</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{driver.blood_group || 'N/A'}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Member Since</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{driver.registration_date ? new Date(driver.registration_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info Card */}
          <div className="card border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <CircleUser className="h-4 w-4" />
              Personal Information
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoRow icon={User} label="Full Name" value={`${driver.first_name} ${driver.last_name}`} />
              <InfoRow icon={IdCard} label="National ID" value={driver.national_id || 'N/A'} />
              <InfoRow icon={User} label="Gender" value={driver.gender || 'N/A'} />
              <InfoRow icon={Calendar} label="Date of Birth" value={driver.date_of_birth ? `${new Date(driver.date_of_birth).toLocaleDateString()} (${getAge()} yrs)` : 'N/A'} />
              <InfoRow icon={Droplet} label="Blood Group" value={driver.blood_group || 'N/A'} />
            </div>
          </div>

          {/* Contact Card */}
          <div className="card border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <MapPin className="h-4 w-4" />
              Contact & Location
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoRow icon={Mail} label="Email Address" value={driver.email || 'N/A'} />
              <InfoRow icon={Phone} label="Phone Number" value={driver.phone || 'N/A'} />
              <InfoRow icon={Phone} label="Emergency Contact" value={driver.emergency_contact || 'N/A'} />
              <InfoRow icon={MapPin} label="City" value={driver.city || 'N/A'} />
              <InfoRow icon={MapPin} label="Address" value={driver.address || 'N/A'} />
            </div>
          </div>

          {/* Photo Card */}
          <div className="card border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <Activity className="h-4 w-4" />
              Driver Photo
            </div>
            {driver.photo ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <img src={resolvePhotoSrc(driver.photo)} alt={`${driver.first_name} ${driver.last_name}`} className="h-72 w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-500">
                <CircleUser className="h-10 w-10" />
                <p className="text-sm font-medium">No photo available</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Card */}
          <div className="card border border-gray-100 shadow-sm text-center">
            <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <QrCode className="h-4 w-4" />
              Driver QR Code
            </div>
            <div className="flex justify-center">
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <QRCodeSVG
                  value={`http://localhost:5177/verify/driver/${driver.driver_id}`}
                  size={180}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-gray-500">
              Scan to verify driver identity
            </p>
          </div>

          {/* Status Card */}
          <div className="card border border-gray-100 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <BadgeCheck className="h-5 w-5 text-primary-600" />
              Account Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm text-gray-600">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(driver.status)}`}>{driver.status}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm text-gray-600">Driver ID</span>
                <span className="text-sm font-semibold text-gray-900">#{driver.driver_id}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm text-gray-600">Registered</span>
                <span className="text-sm font-semibold text-gray-900">{driver.registration_date ? new Date(driver.registration_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Biometrics Card */}
          <div className="card border border-gray-100 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Fingerprint className="h-5 w-5 text-primary-600" />
              Biometrics
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Signature</label>
                <input
                  ref={signatureInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleSignatureUpload}
                />
                {driver.signature ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <img src={resolvePhotoSrc(driver.signature)} alt="Signature" className="h-32 w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 text-gray-500">
                    <Signature className="h-6 w-6" />
                    <p className="text-xs font-medium">No signature captured</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  disabled={bioLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {bioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {driver.signature ? 'Replace Signature' : 'Upload Signature'}
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Fingerprint Data</label>
                <textarea
                  value={fingerprintData}
                  onChange={(e) => setFingerprintData(e.target.value)}
                  placeholder="Paste fingerprint template or base64 data"
                  rows={4}
                  className="input w-full text-xs"
                />
                <button
                  type="button"
                  onClick={handleFingerprintSave}
                  disabled={bioLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {bioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
                  Save Fingerprint
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card border border-gray-100 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Briefcase className="h-5 w-5 text-primary-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to={`/dashboard/licenses/new?driver_id=${driver.driver_id}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">Issue License</Link>
              <Link to={`/dashboard/exams/new?driver_id=${driver.driver_id}`} className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">Schedule Exam</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverProfile

