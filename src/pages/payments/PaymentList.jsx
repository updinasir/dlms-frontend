import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import ListTable, { ListRow } from '../../components/ListTable'
import { Plus, Search, Eye, Filter, CreditCard, User, Calendar, BadgeCheck, Download, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'

const PaymentList = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, failed: 0, total_amount: 0 })
  const [selectedPayments, setSelectedPayments] = useState([])

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [searchTerm, statusFilter, typeFilter, dateFrom, dateTo, page])

  const fetchStats = async () => {
    try {
      const response = await api.get('/payments/stats/overview')
      setStats(response.data.statistics || { total: 0, completed: 0, pending: 0, failed: 0, total_amount: 0 })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      params.append('page', page)
      params.append('limit', 10)

      const response = await api.get(`/payments?${params}`)
      setPayments(response.data.payments)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Error fetching payments')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([])
    } else {
      setSelectedPayments(payments.map(p => p.payment_id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedPayments.length === 0) {
      toast.error('Please select at least one payment')
      return
    }

    const confirmMessage = action === 'delete'
      ? `Are you sure you want to delete ${selectedPayments.length} payment(s)?`
      : `Are you sure you want to mark ${selectedPayments.length} payment(s) as ${action}?`

    if (!window.confirm(confirmMessage)) return

    try {
      if (action === 'delete') {
        await Promise.all(selectedPayments.map(id => api.delete(`/payments/${id}`)))
        toast.success(`${selectedPayments.length} payment(s) deleted successfully`)
      } else {
        await Promise.all(selectedPayments.map(id => 
          api.patch(`/payments/${id}`, { payment_status: action === 'complete' ? 'Completed' : action === 'fail' ? 'Failed' : action })
        ))
        toast.success(`${selectedPayments.length} payment(s) updated successfully`)
      }
      setSelectedPayments([])
      fetchPayments()
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
      if (typeFilter) params.append('type', typeFilter)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      
      const response = await api.get(`/payments/export?${params}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payments-export-${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Export successful')
    } catch (error) {
      toast.error('Error exporting payments')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Completed: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      Pending: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      Failed: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type) => {
    const labels = {
      Registration: 'Registration Fee',
      Test: 'Test Fee',
      License: 'License Fee',
      Renewal: 'Renewal Fee',
      Fine: 'Fine'
    }
    return labels[type] || type || 'N/A'
  }

  const driverName = (payment) => `${payment.first_name || ''} ${payment.last_name || ''}`.trim() || 'Unknown Driver'
  const initials = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const columns = [
    {
      key: 'payer',
      label: 'Payer',
      render: (payment) => {
        const name = driverName(payment)
        return <ListRow avatar={initials(name)} title={name} subtitle={payment.transaction_reference} />
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (payment) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CreditCard className="h-4 w-4 text-slate-400" />
          {getTypeLabel(payment.payment_type)}
        </div>
      )
    },
    {
      key: 'city',
      label: 'City',
      render: (payment) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <User className="h-4 w-4 text-slate-400" />
          {payment.city || 'N/A'}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (payment) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Calendar className="h-4 w-4 text-slate-400" />
          {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (payment) => <span className="text-sm font-semibold text-slate-900">${Number(payment.amount).toFixed(2)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (payment) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(payment.payment_status)}`}>{payment.payment_status}</span>
    },
    {
      key: 'select',
      label: '',
      render: (payment) => (
        <input
          type="checkbox"
          checked={selectedPayments.includes(payment.payment_id)}
          onChange={() => handleSelectPayment(payment.payment_id)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (payment) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/dashboard/payments/${payment.payment_id}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            title="View payment"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
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
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
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
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
            <div className="rounded-full bg-rose-100 p-3">
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${Number(stats.total_amount || 0).toFixed(2)}</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3">
              <BadgeCheck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Link to="/dashboard/payments/new" className="btn btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto">
          <Plus className="w-5 h-5" />
          <span>Add Payment</span>
        </Link>
        {selectedPayments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('complete')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete ({selectedPayments.length})</span>
            </button>
            <button
              onClick={() => handleBulkAction('fail')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Fail ({selectedPayments.length})</span>
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn btn-secondary flex items-center space-x-2 text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedPayments.length})</span>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1.3fr_0.8fr_0.8fr_0.7fr_0.7fr]">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedPayments.length === payments.length && payments.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reference or driver name"
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
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setPage(1)
              setTypeFilter(e.target.value)
            }}
            className="input"
          >
            <option value="">All Types</option>
            <option value="Registration">Registration</option>
            <option value="Test">Test</option>
            <option value="License">License</option>
            <option value="Renewal">Renewal</option>
            <option value="Fine">Fine</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input"
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input"
            placeholder="To"
          />
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2 md:col-span-6">
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(''); setTypeFilter(''); setDateFrom(''); setDateTo(''); setPage(1); setSelectedPayments([]) }}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      <ListTable
        columns={columns}
        data={payments}
        keyExtractor={(payment) => payment.payment_id}
        loading={loading}
        emptyTitle="No payments found"
        emptySubtitle="Try a different filter or add a new payment record."
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  )
}

export default PaymentList

