import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Edit, QrCode, Download, Calendar, CreditCard, User, BadgeCheck, MapPin } from 'lucide-react'
import QRCode from 'qrcode.react'

const LicenseDetail = () => {
  const { id } = useParams()
  const [license, setLicense] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLicense()
  }, [id])

  const fetchLicense = async () => {
    try {
      const response = await api.get(`/licenses/${id}`)
      setLicense(response.data.license)
    } catch (error) {
      toast.error('Error fetching license data')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!license) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">License not found</p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      Expired: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
      Suspended: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      Revoked: 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryLabel = (categoryId) => {
    const categories = {
      1: 'Category 1',
      2: 'Category 2',
      3: 'Category 3'
    }
    return categories[Number(categoryId)] || `Category ${categoryId || 'N/A'}`
  }

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
            <h1 className="text-3xl font-bold text-gray-900">License Details</h1>
            <p className="text-gray-600 mt-1">View license information and verification data</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Print</span>
          </button>
          <Link to={`/dashboard/licenses/${id}/edit`} className="btn btn-primary flex items-center space-x-2">
            <Edit className="w-5 h-5" />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card border border-gray-100 bg-gradient-to-br from-slate-50 to-sky-50 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Driving License</h2>
                <p className="text-gray-600">Official Government Document</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(license.license_status)}`}>
                {license.license_status}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">License Number</label>
                <p className="text-lg font-bold text-gray-900">{license.license_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                <p className="text-lg font-bold text-gray-900">{getCategoryLabel(license.category_id)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Issue Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{new Date(license.issue_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Expiry Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{new Date(license.expiry_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border border-gray-100 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Driver Information</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                <p className="text-lg font-medium text-gray-900">{license.first_name} {license.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">National ID</label>
                <p className="text-gray-900">{license.national_id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{license.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <p className="text-gray-900">{license.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Sidebar */}
        <div className="space-y-6">
          <div className="card border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>QR Code</span>
            </h3>
            <div className="flex justify-center bg-white p-4 rounded-lg">
              <QRCode
                value={JSON.stringify({
                  license_number: license.license_number,
                  driver_name: `${license.first_name} ${license.last_name}`,
                  category_id: license.category_id,
                  expiry_date: license.expiry_date
                })}
                size={200}
                level="H"
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              Scan to verify license authenticity
            </p>
          </div>

          <div className="card border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">License Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(license.license_status)}`}>
                  {license.license_status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Days Until Expiry</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.ceil((new Date(license.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm text-gray-900">
                  {new Date(license.issue_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LicenseDetail

