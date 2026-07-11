import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Search, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

const LicenseVerification = () => {
  const navigate = useNavigate()
  const [licenseId, setLicenseId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!licenseId.trim()) {
      toast.error('Please enter a license ID')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/licenses/verify/${licenseId}`)
      setResult(response.data)
      toast.success('License successfully verified')
    } catch (error) {
      toast.error(error.response?.data?.message || 'License verification failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard/licenses')}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Verification</h1>
          <p className="text-gray-600 mt-1">Verify driving license authenticity</p>
        </div>
      </div>

      <div className="card border border-gray-100 shadow-sm">
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={licenseId}
                onChange={(e) => setLicenseId(e.target.value)}
                className="input pl-10"
                placeholder="Enter license ID (e.g., DL-2024-001)"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Verify License</span>
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className={`card border ${result.valid ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex items-center space-x-4 mb-6">
            {result.valid ? (
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {result.valid ? 'Valid License' : 'Invalid License'}
              </h3>
              <p className="text-gray-600">
                {result.valid ? 'This license is authentic and active' : 'This license is invalid or expired'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">License Number</label>
                <p className="text-lg font-medium text-gray-900">{result.license.license_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Driver Name</label>
                <p className="text-lg font-medium text-gray-900">{result.license.driver_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                <p className="text-gray-900">Category {result.license.category_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <p className="text-gray-900">{result.license.license_status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Issue Date</label>
                <p className="text-gray-900">{new Date(result.license.issue_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Expiry Date</label>
                <p className="text-gray-900">{new Date(result.license.expiry_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LicenseVerification

