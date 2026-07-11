import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, CreditCard, Hash, User, CalendarDays, Search, X, AlertCircle, CheckCircle2, DollarSign, FileText } from 'lucide-react'

const PaymentForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    service_id: '',
    service_name: '',
    amount: '',
    payment_type: '',
    payment_method: '',
    payment_status: 'Completed',
    transaction_reference: ''
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [driverSearch, setDriverSearch] = useState('')
  const [showDriverDropdown, setShowDriverDropdown] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [driverPaymentHistory, setDriverPaymentHistory] = useState(null)
  const [services, setServices] = useState([])
  const [amountReadOnly, setAmountReadOnly] = useState(false)

  useEffect(() => {
    fetchDrivers()
    fetchServices()
    if (isEdit) {
      fetchPayment()
    }
  }, [id])

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers')
      setDrivers(response.data.drivers || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/active')
      setServices(response.data.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchPayment = async () => {
    setFetchLoading(true)
    try {
      const response = await api.get(`/payments/${id}`)
      const payment = response.data.payment || {}
      setFormData({
        driver_id: payment.driver_id || '',
        driver_name: payment.driver_name || '',
        service_id: payment.service_id || '',
        service_name: payment.service_name || '',
        amount: payment.amount || '',
        payment_type: payment.payment_type || '',
        payment_method: payment.payment_method || '',
        payment_status: payment.payment_status || 'Completed',
        transaction_reference: payment.transaction_reference || ''
      })
      if (payment.driver_id) {
        fetchDriverPaymentHistory(payment.driver_id)
      }
      if (payment.service_id) {
        setAmountReadOnly(true)
      }
    } catch (error) {
      toast.error('Error fetching payment data')
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchDriverPaymentHistory = async (driverId) => {
    try {
      const response = await api.get(`/payments?driver_id=${driverId}`)
      setDriverPaymentHistory(response.data.payments || [])
    } catch (error) {
      setDriverPaymentHistory(null)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Handle service selection
    if (name === 'service_id' && value) {
      const selectedService = services.find(s => s.service_id === parseInt(value))
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          service_name: selectedService.service_name,
          amount: selectedService.official_price,
          payment_type: selectedService.service_name
        }))
        setAmountReadOnly(true)
        delete validationErrors.amount
        setValidationErrors(validationErrors)
      }
    } else if (name === 'service_id' && !value) {
      setAmountReadOnly(false)
    }

    // Real-time validation
    const errors = { ...validationErrors }
    if (name === 'amount' && value && !amountReadOnly) {
      const amount = parseFloat(value)
      if (amount <= 0) {
        errors.amount = 'Amount must be greater than 0'
      } else if (amount > 1000000) {
        errors.amount = 'Amount cannot exceed 1,000,000'
      } else {
        delete errors.amount
      }
    } else if (name === 'amount' && !value) {
      delete errors.amount
    }
    setValidationErrors(errors)

    // Auto-generate transaction reference if empty
    if (name === 'payment_type' && value && !formData.transaction_reference) {
      const ref = `PAY-${Date.now().toString().slice(-8)}`
      setFormData(prev => ({ ...prev, transaction_reference: ref }))
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
    fetchDriverPaymentHistory(driver.driver_id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validate all fields
    const errors = {}
    if (!formData.driver_id) {
      errors.driver_id = 'Driver is required'
    }
    if (!formData.amount) {
      errors.amount = 'Amount is required'
    } else {
      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        errors.amount = 'Amount must be greater than 0'
      } else if (amount > 1000000) {
        errors.amount = 'Amount cannot exceed 1,000,000'
      }
    }
    if (!formData.payment_type) {
      errors.payment_type = 'Payment type is required'
    }
    if (!formData.payment_method) {
      errors.payment_method = 'Payment method is required'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix the validation errors')
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        transaction_reference: formData.transaction_reference.trim() || `PAY-${Date.now().toString().slice(-8)}`
      }

      if (isEdit) {
        await api.put(`/payments/${id}`, payload)
        toast.success('Payment successfully updated')
      } else {
        await api.post('/payments', payload)
        toast.success('Payment successfully created')
      }
      setTimeout(() => navigate('/dashboard/payments'), 500)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error saving payment'
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
            onClick={() => navigate('/dashboard/payments')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Payment' : 'Add New Payment'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Update payment information' : 'Record a new payment'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <User className="h-4 w-4" />
              Driver
            </div>
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
                      setDriverPaymentHistory(null)
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
              {driverPaymentHistory && driverPaymentHistory.length > 0 && (
                <div className="mt-2 rounded-lg p-3 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <div className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Payment History
                  </div>
                  <div className="mt-1">
                    {driverPaymentHistory.length} previous payment{driverPaymentHistory.length > 1 ? 's' : ''} found
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <DollarSign className="h-4 w-4" />
              Payment Details
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <select
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select a service (optional)</option>
                  {services.map(service => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.service_name} - ${service.official_price}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Select a service to auto-fill the official price</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    readOnly={amountReadOnly}
                    className={`input pl-10 ${amountReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''} ${validationErrors.amount ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                    required
                  />
                  {amountReadOnly && (
                    <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" title="Official price - cannot be modified" />
                  )}
                </div>
                {validationErrors.amount && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.amount}
                  </p>
                )}
                {amountReadOnly && (
                  <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Official service price - cannot be modified
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleChange}
                    className={`input pl-10 ${validationErrors.payment_type ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Registration">Registration</option>
                    <option value="Test">Test</option>
                    <option value="License">License</option>
                    <option value="Renewal">Renewal</option>
                    <option value="Fine">Fine</option>
                  </select>
                </div>
                {validationErrors.payment_type && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.payment_type}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className={`input ${validationErrors.payment_method ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
                {validationErrors.payment_method && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.payment_method}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <FileText className="h-4 w-4" />
              Transaction Reference
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Reference</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="transaction_reference"
                  value={formData.transaction_reference}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Auto-generated if empty"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Auto-generated if left empty (format: PAY-XXXXXXXX)</p>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard/payments')}
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
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? 'Update' : 'Create'} Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentForm

