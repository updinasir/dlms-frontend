import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, User, MapPin, Phone, Mail, QrCode, AlertCircle, CheckCircle2, Upload, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { resolveUploadSrc } from '../../utils/media'

const getTodayDate = () => new Date().toISOString().slice(0, 10)
const getDefaultDob = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 25)
  return d.toISOString().slice(0, 10)
}

const DriverForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    national_id: 'SOM-',
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: getDefaultDob(),
    phone: '',
    email: '',
    address: '',
    city: '',
    blood_group: '',
    emergency_contact: '',
    photo: '',
    registration_date: getTodayDate(),
    status: 'Pending'
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState({})
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [duplicates, setDuplicates] = useState({ national_id: false, email: false, phone: false })
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const selectedPhotoRef = useRef(null)
  const debounceTimerRef = useRef(null)

  useEffect(() => {
    if (isEdit) {
      fetchDriver()
    } else {
      // Load draft for new drivers
      loadDraft()
    }
  }, [id])

  useEffect(() => {
    return () => {
      stopCamera()
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [photoPreview])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraOpen(false)
  }

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validateNationalId = (nationalId) => {
    return /^SOM-\d{6}$/.test(nationalId)
  }

  const validateAge = (dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  // Auto-save draft
  const saveDraft = () => {
    if (isEdit) return
    const draftData = {
      ...formData,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('driver_draft', JSON.stringify(draftData))
  }

  const loadDraft = () => {
    const draft = localStorage.getItem('driver_draft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        const savedDate = new Date(draftData.savedAt)
        const hoursSinceSave = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60)
        if (hoursSinceSave < 24) {
          setFormData({
            ...formData,
            ...draftData,
            registration_date: getTodayDate()
          })
          toast.success('Draft loaded from previous session')
        } else {
          localStorage.removeItem('driver_draft')
        }
      } catch (e) {
        localStorage.removeItem('driver_draft')
      }
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('driver_draft')
  }

  // Duplicate checking
  const checkDuplicates = async (field, value) => {
    if (!value || isEdit) return
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(async () => {
      setCheckingDuplicates(true)
      try {
        const response = await api.get(`/drivers/check-duplicate?${field}=${encodeURIComponent(value)}`)
        setDuplicates(prev => ({ ...prev, [field]: response.data.exists }))
      } catch (error) {
        // Ignore duplicate check errors
      } finally {
        setCheckingDuplicates(false)
      }
    }, 500)
  }


  const resolvePhotoSrc = resolveUploadSrc

  const normalizeDate = (value) => {
    if (!value || typeof value !== 'string') return ''
    return value.includes('T') ? value.slice(0, 10) : value
  }

  const previewSrc = typeof photoPreview === 'string' ? photoPreview : ''

  const fetchDriver = async () => {
    setFetchLoading(true)
    try {
      const response = await api.get(`/drivers/${id}`)
      const driver = response.data.driver || {}
      setFormData({
        national_id: driver.national_id || '',
        first_name: driver.first_name || '',
        last_name: driver.last_name || '',
        gender: driver.gender || '',
        date_of_birth: normalizeDate(driver.date_of_birth),
        phone: driver.phone || '',
        email: driver.email || '',
        address: driver.address || '',
        city: driver.city || '',
        blood_group: driver.blood_group || '',
        emergency_contact: driver.emergency_contact || '',
        photo: driver.photo || '',
        registration_date: normalizeDate(driver.registration_date) || getTodayDate(),
        status: driver.status || 'Pending'
      })
      setPhotoPreview(resolvePhotoSrc(driver.photo || ''))
    } catch (error) {
      toast.error('Error fetching driver data')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Real-time validation
    const errors = { ...validationErrors }
    if (name === 'email' && value) {
      errors.email = validateEmail(value) ? '' : 'Invalid email format'
    } else if (name === 'email' && !value) {
      delete errors.email
    }
    if (name === 'phone' && value) {
      errors.phone = validatePhone(value) ? '' : 'Invalid phone format (10-15 digits)'
    } else if (name === 'phone' && !value) {
      delete errors.phone
    }
    if (name === 'national_id' && value) {
      errors.national_id = validateNationalId(value) ? '' : 'Format must be SOM-123456'
    } else if (name === 'national_id' && !value) {
      delete errors.national_id
    }
    setValidationErrors(errors)

    // Duplicate checking
    if (name === 'national_id' && validateNationalId(value)) {
      checkDuplicates('national_id', value)
    } else if (name === 'email' && validateEmail(value)) {
      checkDuplicates('email', value)
    } else if (name === 'phone' && validatePhone(value)) {
      checkDuplicates('phone', value)
    }

    // Auto-save draft
    if (!isEdit) {
      saveDraft()
    }
  }

  // National ID format: SOM-<6 digits>  e.g. SOM-123456
  const handleNationalIdChange = (e) => {
    // Everything the user types after the fixed "SOM-" prefix
    const body = e.target.value.replace(/^SOM-?/i, '').replace(/[^0-9]/g, '')
    const digits = (body.match(/\d/g) || []).slice(0, 6).join('')
    setFormData((current) => ({ ...current, national_id: `SOM-${digits}` }))
  }

  const handlePhotoFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Photo must be less than 5MB')
      return
    }

    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhotoFile(file)
    selectedPhotoRef.current = file
    setPhotoPreview(URL.createObjectURL(file))
    setFormData((current) => ({ ...current, photo: '' }))
    setValidationErrors(prev => ({ ...prev, photo: '' }))
  }

  const startCamera = async () => {
    try {
      setCameraError('')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOpen(true)
    } catch (error) {
      setCameraError('Camera access is not available. Please allow camera permission or use upload.')
    }
  }

  const capturePhoto = async () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.92))
    if (!blob) {
      toast.error('Could not capture photo')
      return
    }

    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview)
    }

    const capturedFile = new File([blob], `driver-photo-${Date.now()}.png`, { type: 'image/png' })
    setPhotoFile(capturedFile)
    selectedPhotoRef.current = capturedFile
    setPhotoPreview(URL.createObjectURL(blob))
    setFormData((current) => ({ ...current, photo: '' }))
    stopCamera()
  }

  const clearPhoto = () => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview)
    }
    setPhotoFile(null)
    selectedPhotoRef.current = null
    setPhotoPreview('')
    setFormData((current) => ({ ...current, photo: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setUploadProgress(0)

    // Validate all fields
    const errors = {}
    if (!validateNationalId(formData.national_id)) {
      errors.national_id = 'Format must be SOM-123456'
    }
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Invalid email format'
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Invalid phone format (10-15 digits)'
    }
    if (validateAge(formData.date_of_birth) < 18) {
      errors.date_of_birth = 'Driver must be at least 18 years old'
    }
    if (!photoPreview && !isEdit) {
      errors.photo = 'Photo is required'
    }

    // Check for duplicates
    if (duplicates.national_id) {
      errors.national_id = 'This National ID is already registered'
    }
    if (duplicates.email) {
      errors.email = 'This email is already registered'
    }
    if (duplicates.phone) {
      errors.phone = 'This phone number is already registered'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix the validation errors')
      setLoading(false)
      return
    }

    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photo' || key === 'registration_date') return
        payload.append(key, value ?? '')
      })

      const fileFromInput = fileInputRef.current?.files?.[0]
      const photoToSubmit = fileFromInput || selectedPhotoRef.current

      if (photoToSubmit) {
        payload.append('photo', photoToSubmit)
      } else if (formData.photo && formData.photo !== '[object Object]') {
        payload.append('photo', formData.photo)
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const response = isEdit 
        ? await api.put(`/drivers/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await api.post('/drivers', payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (isEdit) {
        toast.success('Driver successfully updated')
      } else {
        toast.success('Driver successfully registered')
        clearDraft()
      }
      setTimeout(() => navigate('/dashboard/drivers'), 500)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error saving driver'
      toast.error(errorMessage)
      
      // Handle specific validation errors from backend
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors)
      }
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/drivers')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Driver' : 'Add New Driver'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Update driver identity and contact information' : 'Create a new driver record'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <User className="h-4 w-4" />
              Identity
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <input
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleNationalIdChange}
                  className={`input ${validationErrors.national_id || duplicates.national_id ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="SOM-123456"
                  maxLength={10}
                  pattern="SOM-\d{6}"
                  title="Format: SOM- then 6 digits, e.g. SOM-123456"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Format: <span className="font-medium text-gray-700">SOM-123456</span> (SOM- + 6 digits)</p>
                {validationErrors.national_id && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.national_id}
                  </p>
                )}
                {duplicates.national_id && !validationErrors.national_id && (
                  <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> This National ID is already registered
                  </p>
                )}
              </div>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input" required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input name="first_name" value={formData.first_name} onChange={handleChange} className="input" placeholder="First name" required />
              <input name="last_name" value={formData.last_name} onChange={handleChange} className="input" placeholder="Last name" required />
              <div>
                <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className={`input ${validationErrors.date_of_birth ? 'border-red-500 focus:border-red-500' : ''}`} required />
                {validationErrors.date_of_birth && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.date_of_birth}
                  </p>
                )}
              </div>
              <div>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className={`input ${validationErrors.email || duplicates.email ? 'border-red-500 focus:border-red-500' : ''}`} placeholder="Email address" />
                {validationErrors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.email}
                  </p>
                )}
                {duplicates.email && !validationErrors.email && (
                  <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> This email is already registered
                  </p>
                )}
              </div>
              <div className="md:col-span-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <span className="font-medium text-gray-700">Registration Date:</span>{' '}
                <span>{formData.registration_date || getTodayDate()}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <MapPin className="h-4 w-4" />
              Contact & Location
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <input name="phone" value={formData.phone} onChange={handleChange} className={`input ${validationErrors.phone || duplicates.phone ? 'border-red-500 focus:border-red-500' : ''}`} placeholder="Phone number" />
                {validationErrors.phone && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.phone}
                  </p>
                )}
                {duplicates.phone && !validationErrors.phone && (
                  <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> This phone number is already registered
                  </p>
                )}
              </div>
              <input name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} className="input" placeholder="Emergency contact" />
              <input name="city" value={formData.city} onChange={handleChange} className="input" placeholder="City" />
              <textarea name="address" value={formData.address} onChange={handleChange} className="input md:col-span-2" rows={3} placeholder="Address" />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <User className="h-4 w-4" />
              Profile
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input name="blood_group" value={formData.blood_group} onChange={handleChange} className="input" placeholder="Blood group" />
              <div className="md:col-span-2 space-y-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handlePhotoFile}
                    className="hidden"
                    id="driver-photo-input"
                  />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {isEdit ? 'Replace Photo' : 'Upload Photo'}
                  </button>
                  <button type="button" onClick={startCamera} className="btn btn-primary flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Use Camera
                  </button>
                  {photoPreview && (
                    <button type="button" onClick={clearPhoto} className="btn btn-secondary flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Clear Photo
                    </button>
                  )}
                </div>
                {validationErrors.photo && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.photo}
                  </p>
                )}

                {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}
                {isEdit && (
                  <p className="text-sm text-gray-600">
                    Upload a new photo to replace the current driver photo.
                  </p>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {isEdit ? 'Current Photo' : 'Preview'}
                    </label>
                    <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                      {isEdit && (
                        <span className="absolute left-3 top-3 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                          Edit Photo
                        </span>
                      )}
                      {previewSrc ? (
                        <>
                          <img src={previewSrc} alt="Driver preview" className="h-full w-full object-cover" />
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="text-center">
                                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                                <p className="text-sm font-semibold text-white">Uploading... {uploadProgress}%</p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-6 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">No photo selected</p>
                          <p className="mt-1 text-xs text-gray-400">JPEG, PNG, or WebP (max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Camera</label>
                    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-black ${cameraOpen ? '' : 'hidden'}`}>
                      <video ref={videoRef} className="h-64 w-full object-cover" playsInline muted />
                    </div>
                    {cameraOpen && (
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={capturePhoto} className="btn btn-primary">
                          Capture Photo
                        </button>
                        <button type="button" onClick={stopCamera} className="btn btn-secondary">
                          Stop Camera
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {isEdit && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="input" required>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}

              {isEdit && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Driver QR Code</label>
                  <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4 sm:flex-row sm:items-center">
                    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                      <QRCodeSVG
                        value={`${window.location.origin}/verify/driver/${id}`}
                        size={140}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <QrCode className="h-4 w-4 text-primary-600" />
                        Scan to verify identity
                      </p>
                      <p className="text-xs text-gray-500">
                        This QR code links to driver #{id} with National ID {formData.national_id || 'N/A'}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <button 
              type="button" 
              onClick={() => {
                if (!isEdit && (formData.first_name || formData.last_name || formData.national_id)) {
                  if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                    clearDraft()
                    navigate('/dashboard/drivers')
                  }
                } else {
                  navigate('/dashboard/drivers')
                }
              }} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || checkingDuplicates} 
              className="btn btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : checkingDuplicates ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? 'Update' : 'Create'} Driver</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DriverForm

