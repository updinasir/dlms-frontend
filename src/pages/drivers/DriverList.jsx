import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import ListTable, { ListRow } from '../../components/ListTable'
import { Plus, Search, Edit, Eye, Trash2, Filter, Users, CheckCircle, Clock, XCircle, Download } from 'lucide-react'
import { resolveUploadSrc } from '../../utils/media'

const DriverList = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const [selectedDrivers, setSelectedDrivers] = useState([])

  useEffect(() => {
    fetchDrivers()
    fetchStats()
  }, [searchTerm, statusFilter, page])

  const fetchStats = async () => {
    try {
      const response = await api.get('/drivers/stats/overview')
      setStats(response.data.statistics || { total: 0, approved: 0, pending: 0, rejected: 0 })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchDrivers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      params.append('page', page)
      params.append('limit', 10)

      const response = await api.get(`/drivers?${params}`)
      setDrivers(response.data.drivers || [])
      setPagination(response.data.pagination || {})
    } catch (error) {
      toast.error('Error fetching drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return

    try {
      await api.delete(`/drivers/${id}`)
      toast.success('Driver deleted successfully')
      fetchDrivers()
      fetchStats()
    } catch (error) {
      toast.error('Error deleting driver')
    }
  }

  const handleSelectDriver = (driverId) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId) 
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDrivers.length === drivers.length) {
      setSelectedDrivers([])
    } else {
      setSelectedDrivers(drivers.map(d => d.driver_id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedDrivers.length === 0) {
      toast.error('Please select at least one driver')
      return
    }

    const confirmMessage = action === 'approve' 
      ? `Are you sure you want to approve ${selectedDrivers.length} driver(s)?`
      : action === 'reject'
      ? `Are you sure you want to reject ${selectedDrivers.length} driver(s)?`
      : `Are you sure you want to delete ${selectedDrivers.length} driver(s)?`

    if (!window.confirm(confirmMessage)) return

    try {
      if (action === 'delete') {
        await Promise.all(selectedDrivers.map(id => api.delete(`/drivers/${id}`)))
        toast.success(`${selectedDrivers.length} driver(s) deleted successfully`)
      } else {
        await Promise.all(selectedDrivers.map(id => 
          api.patch(`/drivers/${id}/status`, { status: action === 'approve' ? 'Approved' : 'Rejected' })
        ))
        toast.success(`${selectedDrivers.length} driver(s) ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      }
      setSelectedDrivers([])
      fetchDrivers()
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
      
      const response = await api.get(`/drivers/export?${params}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `drivers-export-${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Export successful')
    } catch (error) {
      toast.error('Error exporting drivers')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Approved: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      Pending: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      Rejected: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const driverName = (driver) => `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unknown Driver'
  const initials = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const resolvePhotoSrc = resolveUploadSrc

  const columns = [
    {
      key: 'driver',
      label: 'Driver',
      render: (driver) => {
        const name = driverName(driver)
        return <ListRow image={resolvePhotoSrc(driver.photo)} avatar={initials(name)} title={name} subtitle={driver.email} />
      }
    },
    { key: 'national_id', label: 'National ID', accessor: 'national_id' },
    { key: 'phone', label: 'Phone', accessor: 'phone' },
    { key: 'city', label: 'City', accessor: 'city' },
    {
      key: 'registered',
      label: 'Registered',
      render: (driver) => driver.registration_date ? new Date(driver.registration_date).toLocaleDateString() : 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      render: (driver) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(driver.status)}`}>{driver.status}</span>
    },
    {
      key: 'select',
      label: '',
      render: (driver) => (
        <input
          type="checkbox"
          checked={selectedDrivers.includes(driver.driver_id)}
          onChange={() => handleSelectDriver(driver.driver_id)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (driver) => (
        <div className="flex items-center gap-1">
          <Link to={`/dashboard/drivers/${driver.driver_id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600">
            <Eye className="h-4 w-4" />
          </Link>
          <Link to={`/dashboard/drivers/${driver.driver_id}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-600">
            <Edit className="h-4 w-4" />
          </Link>
          <button onClick={() => handleDelete(driver.driver_id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
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
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
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
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <div className="rounded-full bg-rose-100 p-3">
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Link to="/dashboard/drivers/new" className="btn btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto">
          <Plus className="w-5 h-5" />
          <span>Add Driver</span>
        </Link>
        {selectedDrivers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('approve')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve ({selectedDrivers.length})</span>
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject ({selectedDrivers.length})</span>
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn btn-secondary flex items-center space-x-2 text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedDrivers.length})</span>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1.2fr_0.8fr_auto_auto]">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedDrivers.length === drivers.length && drivers.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, national ID, email, phone, or city"
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
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); setPage(1); setSelectedDrivers([]) }}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <ListTable
        columns={columns}
        data={drivers}
        keyExtractor={(driver) => `${driver.driver_id}-${driver.national_id}`}
        loading={loading}
        emptyTitle="No drivers found"
        emptySubtitle="Try a different search or add a new driver record."
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  )
}

export default DriverList

