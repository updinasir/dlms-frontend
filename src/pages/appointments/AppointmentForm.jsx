import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Search, X, AlertCircle, CheckCircle2, User, Calendar, Clock, MapPin, Users } from 'lucide-react'

const AppointmentForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const WORK_START_HOUR = 8
  const WORK_END_HOUR = 17 // appointments can start up to 16:00
  const WORKING_DAYS = [1, 2, 3, 4, 5, 6] // Mon-Sat; 0 = Sunday

  const toDateTimeLocal = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - (offset * 60 * 1000))
    return local.toISOString().slice(0, 16)
  }

  const splitDateTime = (isoString) => {
    if (!isoString) return { date: '', time: '' }
    const local = toDateTimeLocal(isoString)
    return { date: local.slice(0, 10), time: local.slice(11, 16) }
  }

  const combineDateTime = (date, time) => {
    if (!date || !time) return ''
    return `${date}T${time}`
  }

  const today = () => {
    const d = new Date()
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - (offset * 60 * 1000))
    return local.toISOString().slice(0, 10)
  }

  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    appointment_type: 'Theory Test',
    appointment_date: '',
    center_name: '',
    examiner_id: '',
    examiner_name: '',
    room: '',
    notes: ''
  })
  const [dateTime, setDateTime] = useState({ date: '', time: '' })
  const [dateError, setDateError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [examiners, setExaminers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [driverSearch, setDriverSearch] = useState('')
  const [showDriverDropdown, setShowDriverDropdown] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [driverExamHistory, setDriverExamHistory] = useState(null)
  const [examinerAvailability, setExaminerAvailability] = useState(null)

  useEffect(() => {
    fetchDrivers()
    fetchExaminers()
    if (isEdit) {
      fetchAppointment()
    }
  }, [id])

  const fetchExaminers = async () => {
    try {
      const response = await api.get('/users/examiners/list')
      setExaminers(response.data.examiners || [])
    } catch (error) {
      console.error('Error fetching examiners:', error)
      setExaminers([])
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

  const fetchAppointment = async () => {
    setFetchLoading(true)
    try {
      const response = await api.get(`/appointments/${id}`)
      const appointment = response.data.appointment || {}
      const apptDate = toDateTimeLocal(appointment.appointment_date)
      setFormData({
        driver_id: appointment.driver_id || '',
        driver_name: appointment.driver_name || '',
        appointment_type: appointment.appointment_type || 'Theory Test',
        appointment_date: apptDate,
        center_name: appointment.center_name || appointment.location || '',
        examiner_id: appointment.examiner_id || '',
        examiner_name: appointment.examiner_name || '',
        room: appointment.room || '',
        notes: appointment.notes || ''
      })
      setDateTime(splitDateTime(appointment.appointment_date))
      if (appointment.driver_id) {
        checkDriverExamHistory(appointment.driver_id)
      }
    } catch (error) {
      toast.error('Error fetching appointment data')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Real-time validation
    const errors = { ...validationErrors }
    if (name === 'driver_id' && value) {
      checkDriverExamHistory(value)
    }
    setValidationErrors(errors)
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
      examiner_name: examiner.full_name
    }))
    // Check examiner availability when selected
    if (dateTime.date && dateTime.time) {
      checkExaminerAvailability(examiner.user_id, dateTime.date, dateTime.time)
    }
  }

  const checkExaminerAvailability = async (examinerId, date, time) => {
    if (!examinerId || !date || !time) {
      setExaminerAvailability(null)
      return
    }
    try {
      const response = await api.get(`/appointments/check-availability?examiner_id=${examinerId}&date=${date}&time=${time}`)
      setExaminerAvailability(response.data)
    } catch (error) {
      setExaminerAvailability(null)
    }
  }

  const validateDateTime = (date, time) => {
    if (!date || !time) return ''
    const selected = new Date(`${date}T${time}`)
    if (Number.isNaN(selected.getTime())) return 'Invalid date or time'
    if (date < today()) return 'Appointment date cannot be in the past'
    if (!WORKING_DAYS.includes(selected.getDay())) {
      return 'Appointments can only be scheduled Monday to Saturday'
    }
    const hour = selected.getHours()
    if (hour < WORK_START_HOUR || hour >= WORK_END_HOUR) {
      return `Appointments must be between ${WORK_START_HOUR}:00 and ${WORK_END_HOUR}:00`
    }
    return ''
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    const next = { ...dateTime, [name]: value }
    setDateTime(next)
    const combined = combineDateTime(next.date, next.time)
    setFormData((prev) => ({ ...prev, appointment_date: combined }))
    const error = validateDateTime(next.date, next.time)
    setDateError(error)
    
    // Check examiner availability when date/time changes
    if (formData.examiner_id && next.date && next.time) {
      checkExaminerAvailability(formData.examiner_id, next.date, next.time)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    const errors = {}
    if (!formData.driver_id) {
      errors.driver_id = 'Driver is required'
    }
    const dateError = validateDateTime(dateTime.date, dateTime.time)
    if (dateError) {
      errors.appointment_date = dateError
    }
    if (!formData.center_name) {
      errors.center_name = 'Center name is required'
    }
    
    // Check examiner availability
    if (formData.examiner_id && examinerAvailability && !examinerAvailability.available) {
      errors.examiner_id = 'Examiner is not available at this time'
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setDateError(dateError)
      toast.error('Please fix the validation errors')
      return
    }
    
    setLoading(true)

    try {
      if (isEdit) {
        await api.put(`/appointments/${id}`, formData)
        toast.success('Appointment successfully updated')
      } else {
        await api.post('/appointments', formData)
        toast.success('Appointment successfully scheduled')
      }
      setTimeout(() => navigate('/dashboard/appointments'), 500)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error saving appointment'
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
            onClick={() => navigate('/dashboard/appointments')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Appointment' : 'Schedule New Appointment'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Update appointment information' : 'Schedule a new appointment'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <User className="h-4 w-4" />
              Driver & Appointment Type
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                <select
                  name="appointment_type"
                  value={formData.appointment_type}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="Theory Test">Theory Test</option>
                  <option value="Practical Test">Practical Test</option>
                  <option value="License Collection">License Collection</option>
                  <option value="Renewal">Renewal</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <Calendar className="h-4 w-4" />
              Date & Time
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
                <input
                  type="date"
                  name="date"
                  value={dateTime.date}
                  min={today()}
                  onChange={handleDateChange}
                  className={`input ${validationErrors.appointment_date ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
                {validationErrors.appointment_date && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.appointment_date}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time</label>
                <select
                  name="time"
                  value={dateTime.time}
                  onChange={handleDateChange}
                  className={`input ${validationErrors.appointment_date ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                >
                  <option value="">Select time</option>
                  {Array.from({ length: WORK_END_HOUR - WORK_START_HOUR }, (_, i) => {
                    const hour = WORK_START_HOUR + i
                    const hh = String(hour).padStart(2, '0')
                    return (
                      <optgroup key={hour} label={`${hh}:00`}>
                        <option value={`${hh}:00`}>{hh}:00</option>
                        <option value={`${hh}:30`}>{hh}:30</option>
                      </optgroup>
                    )
                  })}
                </select>
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              Working hours: Monday to Saturday, {WORK_START_HOUR}:00 - {WORK_END_HOUR}:00
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <MapPin className="h-4 w-4" />
              Location & Staff
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Center Name</label>
                <input
                  type="text"
                  name="center_name"
                  value={formData.center_name}
                  onChange={handleChange}
                  className={`input ${validationErrors.center_name ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter center name"
                  required
                />
                {validationErrors.center_name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.center_name}
                  </p>
                )}
              </div>
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
                      examiner_name: examiner ? examiner.full_name : ''
                    }))
                    if (examiner && dateTime.date && dateTime.time) {
                      checkExaminerAvailability(examiner.user_id, dateTime.date, dateTime.time)
                    }
                  }}
                  className={`input ${validationErrors.examiner_id ? 'border-red-500 focus:border-red-500' : ''}`}
                >
                  <option value="">Unassigned</option>
                  {examiners.map((ex) => (
                    <option key={ex.user_id} value={ex.user_id}>{ex.full_name}</option>
                  ))}
                </select>
                {validationErrors.examiner_id && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.examiner_id}
                  </p>
                )}
                {examinerAvailability && (
                  <div className={`mt-1 text-xs ${
                    examinerAvailability.available ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {examinerAvailability.available ? '✓ Available' : '✗ Not available at this time'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Room 3"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <Clock className="h-4 w-4" />
              Notes
            </div>
            <div>
              <textarea
                name="notes"
                value={formData.notes}
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
              onClick={() => navigate('/dashboard/appointments')}
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
                  <span>{isEdit ? 'Update' : 'Schedule'} Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AppointmentForm

