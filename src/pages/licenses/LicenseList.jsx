import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import ListTable, { ListRow } from '../../components/ListTable'
import { Plus, Search, Edit, RotateCcw, Filter, CreditCard, User, Printer, CheckSquare, DollarSign, Package, Download, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react'

const LicenseList = () => {
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [workflowFilter, setWorkflowFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, expired: 0 })
  const [selectedLicenses, setSelectedLicenses] = useState([])

  useEffect(() => {
    fetchLicenses()
    fetchStats()
  }, [searchTerm, statusFilter, workflowFilter, categoryFilter, page])

  const fetchStats = async () => {
    try {
      const response = await api.get('/licenses/stats/overview')
      setStats(response.data.statistics || { total: 0, active: 0, pending: 0, expired: 0 })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchLicenses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (workflowFilter) params.append('workflow', workflowFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      params.append('page', page)
      params.append('limit', 10)

      const response = await api.get(`/licenses?${params}`)
      setLicenses(response.data.licenses)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Error fetching licenses')
    } finally {
      setLoading(false)
    }
  }

  const handleRenew = async (id) => {
    const expiryDate = prompt('Enter new expiry date (YYYY-MM-DD):')
    if (!expiryDate) return

    try {
      await api.post(`/licenses/${id}/renew`, { expiry_date: expiryDate })
      toast.success('License successfully renewed')
      fetchLicenses()
      fetchStats()
    } catch (error) {
      toast.error('Error renewing license')
    }
  }

  const handleSelectLicense = (licenseId) => {
    setSelectedLicenses(prev => 
      prev.includes(licenseId) 
        ? prev.filter(id => id !== licenseId)
        : [...prev, licenseId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLicenses.length === licenses.length) {
      setSelectedLicenses([])
    } else {
      setSelectedLicenses(licenses.map(l => l.license_id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedLicenses.length === 0) {
      toast.error('Please select at least one license')
      return
    }

    const confirmMessage = action === 'renew'
      ? `Are you sure you want to renew ${selectedLicenses.length} license(s)?`
      : action === 'suspend'
      ? `Are you sure you want to suspend ${selectedLicenses.length} license(s)?`
      : `Are you sure you want to revoke ${selectedLicenses.length} license(s)?`

    if (!window.confirm(confirmMessage)) return

    try {
      if (action === 'renew') {
        const expiryDate = prompt('Enter new expiry date (YYYY-MM-DD):')
        if (!expiryDate) return
        await Promise.all(selectedLicenses.map(id => 
          api.post(`/licenses/${id}/renew`, { expiry_date: expiryDate })
        ))
        toast.success(`${selectedLicenses.length} license(s) renewed successfully`)
      } else {
        await Promise.all(selectedLicenses.map(id => 
          api.patch(`/licenses/${id}`, { license_status: action === 'suspend' ? 'Suspended' : 'Revoked' })
        ))
        toast.success(`${selectedLicenses.length} license(s) ${action === 'suspend' ? 'suspended' : 'revoked'} successfully`)
      }
      setSelectedLicenses([])
      fetchLicenses()
      fetchStats()
    } catch (error) {
      toast.error(`Error performing ${action} action`)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (workflowFilter) params.append('workflow', workflowFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      
      const response = await api.get(`/licenses/export?${params}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `licenses-export-${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Export successful')
    } catch (error) {
      toast.error('Error exporting licenses')
    }
  }

  const handleWorkflow = async (id, action) => {
    try {
      await api.patch(`/licenses/${id}/${action}`)
      toast.success('License updated successfully')
      fetchLicenses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating license')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      Pending: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      Expired: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
      Suspended: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      Revoked: 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getWorkflowColor = (status) => {
    const colors = {
      'Pending Payment': 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      'Approved': 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
      'Printed': 'bg-purple-100 text-purple-800 ring-1 ring-purple-200',
      'Ready for Collection': 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200',
      'Collected': 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
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

  const driverName = (license) => `${license.first_name || ''} ${license.last_name || ''}`.trim() || 'Unknown Driver'
  const initials = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const columns = [
    {
      key: 'driver',
      label: 'Driver',
      render: (license) => {
        const name = driverName(license)
        return <ListRow avatar={initials(name)} title={name} subtitle={license.license_number} />
      }
    },
    {
      key: 'category',
      label: 'Category',
      render: (license) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CreditCard className="h-4 w-4 text-slate-400" />
          {getCategoryLabel(license.category_id)}
        </div>
      )
    },
    {
      key: 'city',
      label: 'City',
      render: (license) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <User className="h-4 w-4 text-slate-400" />
          {license.city || 'N/A'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (license) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(license.license_status)}`}>
          {license.license_status}
        </span>
      )
    },
    {
      key: 'workflow',
      label: 'Workflow',
      render: (license) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getWorkflowColor(license.workflow_status)}`}>
          {license.workflow_status}
        </span>
      )
    },
    {
      key: 'select',
      label: '',
      render: (license) => (
        <input
          type="checkbox"
          checked={selectedLicenses.includes(license.license_id)}
          onChange={() => handleSelectLicense(license.license_id)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (license) => (
        <div className="flex items-center gap-1">
          {license.workflow_status === 'Pending Payment' && (
            <button
              title="Verify Payment"
              onClick={() => handleWorkflow(license.license_id, 'verify-payment')}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-600"
            >
              <DollarSign className="h-4 w-4" />
            </button>
          )}
          {license.workflow_status === 'Approved' && (
            <button
              title="Print License"
              onClick={() => handleWorkflow(license.license_id, 'print')}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600"
            >
              <Printer className="h-4 w-4" />
            </button>
          )}
          {license.workflow_status === 'Printed' && (
            <button
              title="Mark Ready for Collection"
              onClick={() => handleWorkflow(license.license_id, 'ready-for-collection')}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
            >
              <Package className="h-4 w-4" />
            </button>
          )}
          {license.workflow_status === 'Ready for Collection' && (
            <button
              title="Collect License"
              onClick={() => handleWorkflow(license.license_id, 'collect')}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-600"
            >
              <CheckSquare className="h-4 w-4" />
            </button>
          )}
          <Link to={`/dashboard/licenses/${license.license_id}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-600">
            <Edit className="h-4 w-4" />
          </Link>
          <button onClick={() => handleRenew(license.license_id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Licenses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="rounded-full bg-amber-100 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
            </div>
            <div className="rounded-full bg-rose-100 p-3">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Link to="/dashboard/licenses/new" className="btn btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto">
          <Plus className="w-5 h-5" />
          <span>Issue License</span>
        </Link>
        {selectedLicenses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('renew')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Renew ({selectedLicenses.length})</span>
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Suspend ({selectedLicenses.length})</span>
            </button>
            <button
              onClick={() => handleBulkAction('revoke')}
              className="btn btn-secondary flex items-center space-x-2 text-rose-600 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
              <span>Revoke ({selectedLicenses.length})</span>
            </button>
          </div>
        )}
        <button
          onClick={handleExport}
          className="btn btn-secondary flex items-center justify-center space-x-2 w-full lg:w-auto"
        >
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1.2fr_0.8fr_0.8fr_auto_auto]">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedLicenses.length === licenses.length && licenses.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by license number or driver name"
              value={searchTerm}
              onChange={(e) => {
                setPage(1)
                setSearchTerm(e.target.value)
              }}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1)
              setStatusFilter(e.target.value)
            }}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
            <option value="Suspended">Suspended</option>
            <option value="Revoked">Revoked</option>
          </select>
          <select
            value={workflowFilter}
            onChange={(e) => {
              setPage(1)
              setWorkflowFilter(e.target.value)
            }}
            className="input"
          >
            <option value="">All Workflow</option>
            <option value="Pending Payment">Pending Payment</option>
            <option value="Approved">Approved</option>
            <option value="Printed">Printed</option>
            <option value="Ready for Collection">Ready for Collection</option>
            <option value="Collected">Collected</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setPage(1)
              setCategoryFilter(e.target.value)
            }}
            className="input"
          >
            <option value="">All Categories</option>
            <option value="1">Category 1</option>
            <option value="2">Category 2</option>
            <option value="3">Category 3</option>
          </select>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); setWorkflowFilter(''); setCategoryFilter(''); setPage(1); setSelectedLicenses([]) }}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <ListTable
        columns={columns}
        data={licenses}
        keyExtractor={(license) => license.license_id}
        loading={loading}
        emptyTitle="No licenses found"
        emptySubtitle="Try a different filter or issue a new license."
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  )
}

export default LicenseList

