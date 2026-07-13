import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Hash, User, BadgeCheck, Calendar, AlertCircle, Search, CheckCircle2, X } from 'lucide-react'

const LicenseForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    license_number: '',
    category_id: '',
    issue_date: '',
    expiry_date: '',
    license_status: 'Pending'
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [drivers, setDrivers] = useState([])
  const [driverSearch, setDriverSearch] = useState('')
  const [showDriverDropdown, setShowDriverDropdown] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)
  const [duplicateLicense, setDuplicateLicense] = useState(false)
  const [examStatus, setExamStatus] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchDrivers()
    if (isEdit) {
      fetchLicense()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/licenses/license-categories')
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers')
      setDrivers(response.data.drivers || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const fetchLicense = async () => {
    setFetchLoading(true)
    try {
      const response = await api.get(`/licenses/${id}`)
      const license = response.data.license || {}
      setFormData({
        driver_id: license.driver_id || '',
        driver_name: license.driver_name || '',
        license_number: license.license_number || '',
        category_id: license.category_id || '',
        issue_date: license.issue_date || '',
        expiry_date: license.expiry_date || '',
        license_status: license.license_status || 'Active'
      })
    } catch (error) {
      toast.error('Error fetching license data')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Real-time validation
    const errors = { ...validationErrors }
    if (name === 'license_number' && value) {
      errors.license_number = /^SL-\d{6}$/.test(value) ? '' : 'Format must be SL-123456'
    } else if (name === 'license_number' && !value) {
      delete errors.license_number
    }
    if (name === 'issue_date' && value && formData.expiry_date) {
      errors.expiry_date = new Date(value) >= new Date(formData.expiry_date) ? 'Expiry date must be after issue date' : ''
    }
    if (name === 'expiry_date' && value && formData.issue_date) {
      errors.expiry_date = new Date(formData.issue_date) >= new Date(value) ? 'Expiry date must be after issue date' : ''
    }
    setValidationErrors(errors)

    // Check duplicate license number
    if (name === 'license_number' && /^SL-\d{6}$/.test(value)) {
      checkDuplicateLicense(value)
    }
  }

  const checkDuplicateLicense = async (licenseNumber) => {
    if (!licenseNumber || isEdit) return
    setCheckingDuplicate(true)
    try {
      const response = await api.get(`/licenses/check-duplicate?license_number=${encodeURIComponent(licenseNumber)}`)
      setDuplicateLicense(response.data.exists)
    } catch (error) {
      // Ignore duplicate check errors
    } finally {
      setCheckingDuplicate(false)
    }
  }

  const checkDriverExams = async (driverId) => {
    if (!driverId) {
      setExamStatus(null)
      return
    }
    try {
      const response = await api.get(`/drivers/${driverId}/exam-status`)
      setExamStatus(response.data)
    } catch (error) {
      setExamStatus(null)
    }
  }

  const handleDriverSelect = (driver) => {
    setFormData(prev => ({
      ...prev,
      driver_id: driver.driver_id,
      driver_name: `${driver.first_name} ${driver.last_name}`
    }))
    setDriverSearch('')
    setShowDriverDropdown(false)
    checkDriverExams(driver.driver_id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validate all fields
    const errors = {}
    if (!formData.driver_id) {
      errors.driver_id = 'Driver is required'
    }
    if (!formData.category_id) {
      errors.category_id = 'Category is required'
    }
    if (!formData.issue_date) {
      errors.issue_date = 'Issue date is required'
    }
    if (!formData.expiry_date) {
      errors.expiry_date = 'Expiry date is required'
    }
    if (formData.issue_date && formData.expiry_date) {
      if (new Date(formData.issue_date) >= new Date(formData.expiry_date)) {
        errors.expiry_date = 'Expiry date must be after issue date'
      }
    }

    // Check business rule: driver must pass both exams
    if (examStatus && (!examStatus.theory_passed || !examStatus.practical_passed)) {
      errors.driver_id = 'Driver must pass both theory and practical exams before license can be issued'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix the validation errors')
      setLoading(false)
      return
    }

    try {
      const payload = {
        driver_id: formData.driver_id,
        category_id: formData.category_id,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        license_status: isEdit ? formData.license_status : 'Pending'
      }

      if (isEdit) {
        await api.put(`/licenses/${id}`, payload)
        toast.success('License successfully updated')
      } else {
        await api.post('/licenses', payload)
        toast.success('License successfully created')
      }
      setTimeout(() => navigate('/dashboard/licenses'), 500)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error saving license'
      toast.error(errorMessage)
      
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors)
      }
    } finally {
      setLoading(false)
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
          onClick={() => navigate('/dashboard/licenses')}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit License' : 'Issue New License'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update license information' : 'Create a new driving license'}
          </p>
        </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <User className="h-4 w-4" />
              Driver & License
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={driverSearch || formData.driver_name}
                    onChange={(e) => {
                      setDriverSearch(e.target.value)
                      setShowDriverDropdown(true)
                    }}
                    onFocus={() => setShowDriverDropdown(true)}
                    className="input pl-10"
                    placeholder="Search driver by name or ID"
                    required
                  />
                  {formData.driver_name && (
                    <button
                      type="button"
                      onClick={() => {
                      setFormData(prev => ({ ...prev, driver_id: '', driver_name: '' }))
                      setDriverSearch('')
                      setExamStatus(null)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {showDriverDropdown && driverSearch && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    {drivers.filter(d => 
                      d.first_name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                      d.last_name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                      d.driver_id?.toString().includes(driverSearch)
                    ).length > 0 ? (
                      drivers.filter(d => 
                        d.first_name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                        d.last_name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
                        d.driver_id?.toString().includes(driverSearch)
                      ).map(driver => (
                        <button
                          key={driver.driver_id}
                          type="button"
                          onClick={() => handleDriverSelect(driver)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition"
                        >
                          <div className="font-medium text-gray-900">{driver.first_name} {driver.last_name}</div>
                          <div className="text-sm text-gray-500">ID: {driver.driver_id} | {driver.national_id}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No drivers found</div>
                    )}
                  </div>
                )}
                {validationErrors.driver_id && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.driver_id}
                  </p>
                )}
                {examStatus && (
                  <div className={`mt-2 rounded-lg p-3 text-sm ${
                    examStatus.theory_passed && examStatus.practical_passed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <div className="font-semibold flex items-center gap-2">
                      {examStatus.theory_passed && examStatus.practical_passed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      Exam Status
                    </div>
                    <div className="mt-1">
                      Theory: {examStatus.theory_passed ? '✓ Passed' : '✗ Not Passed'} | 
                      Practical: {examStatus.practical_passed ? '✓ Passed' : '✗ Not Passed'}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="license_number"
                  value={isEdit ? formData.license_number : 'Auto-generated (e.g. SL-000001)'}
                  className="input bg-gray-100 text-gray-500 cursor-not-allowed"
                  readOnly
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                  License number is generated automatically and cannot be edited.
                </p>
              </div>
              <div>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className={`input ${validationErrors.category_id ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_code} - {cat.category_name}
                    </option>
                  ))}
                </select>
                {validationErrors.category_id && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.category_id}
                  </p>
                )}
              </div>
              {isEdit && (
                <div>
                  <select
                    name="license_status"
                    value={formData.license_status}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <Calendar className="h-4 w-4" />
              Dates
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleChange}
                  className={`input ${validationErrors.issue_date ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
                {validationErrors.issue_date && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.issue_date}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className={`input ${validationErrors.expiry_date ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
                {validationErrors.expiry_date && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.expiry_date}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard/licenses')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || checkingDuplicate}
              className="btn btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{isEdit ? 'Updating...' : 'Issuing...'}</span>
                </>
              ) : checkingDuplicate ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? 'Update' : 'Issue'} License</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LicenseForm

