import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Search, X, AlertCircle, CheckCircle2, User, Calendar, Clock, MapPin } from 'lucide-react'

const ExamForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    exam_type: 'theory',
    exam_date: '',
    exam_time: '09:00',
    examiner_id: '',
    examiner_name: '',
    room_number: '',
    vehicle_used: '',
    total_marks: '',
    result: '',
    remarks: ''
  })
  const [drivers, setDrivers] = useState([])
  const [examiners, setExaminers] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [driverSearch, setDriverSearch] = useState('')
  const [showDriverDropdown, setShowDriverDropdown] = useState(false)
  const [showExaminerDropdown, setShowExaminerDropdown] = useState(false)
  const [examinerSearch, setExaminerSearch] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [driverExamHistory, setDriverExamHistory] = useState(null)

  useEffect(() => {
    fetchDrivers()
    fetchExaminers()
    if (isEdit) {
      fetchExam()
    }
  }, [id])

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers')
      setDrivers(res.data.drivers || res.data || [])
    } catch (err) {
      console.error('Error fetching drivers:', err)
    }
  }

  const fetchExaminers = async () => {
    try {
      const res = await api.get('/users/examiners/list')
      setExaminers(res.data.examiners || [])
    } catch (err) {
      console.error('Error fetching examiners:', err)
    }
  }

  const fetchExam = async () => {
    setFetchLoading(true)
    try {
      const response = await api.get(`/exams/${id}`)
      const exam = response.data.exam || {}
      setFormData({
        driver_id: exam.driver_id || '',
        driver_name: exam.driver_name || '',
        exam_type: exam.exam_type || 'theory',
        exam_date: exam.exam_date ? exam.exam_date.slice(0,10) : '',
        exam_time: exam.exam_time || '09:00',
        examiner_id: exam.examiner_id || '',
        examiner_name: exam.examiner_name || '',
        room_number: exam.room_number || '',
        vehicle_used: exam.vehicle_used || '',
        total_marks: exam.total_marks || '',
        result: exam.result || '',
        remarks: exam.remarks || ''
      })
    } catch (error) {
      toast.error('Error fetching exam data')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Real-time validation
    const errors = { ...validationErrors }
    if (name === 'exam_date' && value) {
      const selectedDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.exam_date = 'Cannot schedule exam in the past'
      } else {
        delete errors.exam_date
      }
    }
    setValidationErrors(errors)

    // Check driver exam history when driver is selected
    if (name === 'driver_id' && value) {
      checkDriverExamHistory(value)
    }
  }

  const checkDriverExamHistory = async (driverId) => {
    if (!driverId) {
      setDriverExamHistory(null)
      return
    }
    try {
      const response = await api.get(`/drivers/${driverId}/exam-status`)
      setDriverExamHistory(response.data)
    } catch (error) {
      setDriverExamHistory(null)
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
    checkDriverExamHistory(driver.driver_id)
  }

  const handleExaminerSelect = (examiner) => {
    setFormData(prev => ({
      ...prev,
      examiner_id: examiner.user_id,
      examiner_name: `${examiner.first_name} ${examiner.last_name}`
    }))
    setExaminerSearch('')
    setShowExaminerDropdown(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validate all fields
    const errors = {}
    if (!formData.driver_id) {
      errors.driver_id = 'Driver is required'
    }
    if (!formData.exam_date) {
      errors.exam_date = 'Exam date is required'
    } else {
      const selectedDate = new Date(formData.exam_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.exam_date = 'Cannot schedule exam in the past'
      }
    }
    if (!formData.exam_time) {
      errors.exam_time = 'Exam time is required'
    }
    if (formData.exam_type === 'practical' && !formData.examiner_id) {
      errors.examiner_id = 'Examiner is required for practical exams'
    }

    // Business rule: Theory must be passed before practical
    if (formData.exam_type === 'practical' && driverExamHistory) {
      if (!driverExamHistory.theory_passed) {
        errors.exam_type = 'Driver must pass theory exam before practical exam'
      }
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
        exam_type: formData.exam_type,
        exam_date: formData.exam_date,
        exam_time: formData.exam_time,
        examiner_id: formData.examiner_id || null,
        room_number: formData.room_number || null,
        vehicle_used: formData.vehicle_used || null,
        total_marks: formData.total_marks || null,
        result: formData.result || null,
        remarks: formData.remarks || null
      }

      if (isEdit) {
        await api.put(`/exams/${id}`, payload)
        toast.success('Exam successfully updated')
      } else {
        await api.post('/exams', payload)
        toast.success('Exam successfully scheduled')
      }
      setTimeout(() => navigate('/dashboard/exams'), 500)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error saving exam'
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/exams')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Exam' : 'Schedule New Exam'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Update exam information' : 'Schedule a new driving exam'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <User className="h-4 w-4" />
              Driver & Exam Type
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
                        setDriverExamHistory(null)
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
                {driverExamHistory && (
                  <div className={`mt-2 rounded-lg p-3 text-sm ${
                    driverExamHistory.theory_passed && driverExamHistory.practical_passed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <div className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Exam History
                    </div>
                    <div className="mt-1">
                      Theory: {driverExamHistory.theory_passed ? '✓ Passed' : '✗ Not Passed'} | 
                      Practical: {driverExamHistory.practical_passed ? '✓ Passed' : '✗ Not Passed'}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                <select
                  name="exam_type"
                  value={formData.exam_type}
                  onChange={handleChange}
                  className={`input ${validationErrors.exam_type ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                >
                  <option value="theory">Theory Exam</option>
                  <option value="practical">Practical Exam</option>
                </select>
                {validationErrors.exam_type && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.exam_type}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <Calendar className="h-4 w-4" />
              Date & Time
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
                <input
                  type="date"
                  name="exam_date"
                  value={formData.exam_date}
                  onChange={handleChange}
                  className={`input ${validationErrors.exam_date ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
                {validationErrors.exam_date && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.exam_date}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Time</label>
                <input
                  type="time"
                  name="exam_time"
                  value={formData.exam_time}
                  onChange={handleChange}
                  className={`input ${validationErrors.exam_time ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
                {validationErrors.exam_time && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.exam_time}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <User className="h-4 w-4" />
              Examiner & Details
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Examiner</label>
                <select
                  name="examiner_id"
                  value={formData.examiner_id}
                  onChange={(e) => {
                    const examiner = examiners.find(ex => ex.user_id === parseInt(e.target.value))
                    setFormData(prev => ({
                      ...prev,
                      examiner_id: e.target.value,
                      examiner_name: examiner ? `${examiner.full_name || examiner.first_name} ${examiner.last_name || ''}` : ''
                    }))
                  }}
                  className={`input ${validationErrors.examiner_id ? 'border-red-500 focus:border-red-500' : ''}`}
                >
                  <option value="">Select examiner</option>
                  {examiners.map(examiner => (
                    <option key={examiner.user_id} value={examiner.user_id}>
                      {examiner.full_name || `${examiner.first_name} ${examiner.last_name}`}
                    </option>
                  ))}
                </select>
                {validationErrors.examiner_id && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.examiner_id}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Used</label>
                <input
                  type="text"
                  name="vehicle_used"
                  value={formData.vehicle_used}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Toyota Corolla"
                />
              </div>
            </div>
          </section>

          {isEdit && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
                <CheckCircle2 className="h-4 w-4" />
                Grading
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
                  <select
                    name="result"
                    value={formData.result}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select result</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                  <input
                    type="number"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., 85"
                  />
                </div>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <MapPin className="h-4 w-4" />
              Remarks
            </div>
            <div>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="input"
                rows={3}
                placeholder="Additional notes or comments"
              />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard/exams')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{isEdit ? 'Updating...' : 'Scheduling...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? 'Update' : 'Schedule'} Exam</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExamForm

