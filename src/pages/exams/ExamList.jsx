import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import ListTable, { ListRow } from '../../components/ListTable'
import { Plus, Search, Edit, Eye, Filter, GraduationCap, Calendar, User, Download, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'

const ExamList = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({ total: 0, scheduled: 0, completed: 0, passed: 0, failed: 0 })
  const [selectedExams, setSelectedExams] = useState([])

  useEffect(() => {
    fetchExams()
    fetchStats()
  }, [searchTerm, statusFilter, typeFilter, page])

  const fetchStats = async () => {
    try {
      const response = await api.get('/exams/stats/overview')
      setStats(response.data.statistics || { total: 0, scheduled: 0, completed: 0, passed: 0, failed: 0 })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchExams = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      params.append('page', page)
      params.append('limit', 10)

      const response = await api.get(`/exams?${params}`)
      setExams(response.data.exams || [])
      setPagination(response.data.pagination || {})
    } catch (error) {
      toast.error('Error fetching exams')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectExam = (examId) => {
    setSelectedExams(prev => 
      prev.includes(examId) 
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    )
  }

  const handleSelectAll = () => {
    if (selectedExams.length === exams.length) {
      setSelectedExams([])
    } else {
      setSelectedExams(exams.map(e => e.exam_uid))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedExams.length === 0) {
      toast.error('Please select at least one exam')
      return
    }

    const confirmMessage = action === 'delete'
      ? `Are you sure you want to delete ${selectedExams.length} exam(s)?`
      : `Are you sure you want to cancel ${selectedExams.length} exam(s)?`

    if (!window.confirm(confirmMessage)) return

    try {
      if (action === 'delete') {
        await Promise.all(selectedExams.map(id => api.delete(`/exams/${id}`)))
        toast.success(`${selectedExams.length} exam(s) deleted successfully`)
      } else {
        await Promise.all(selectedExams.map(id => api.patch(`/exams/${id}/cancel`)))
        toast.success(`${selectedExams.length} exam(s) cancelled successfully`)
      }
      setSelectedExams([])
      fetchExams()
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
      
      const response = await api.get(`/exams/export?${params}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `exams-export-${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Export successful')
    } catch (error) {
      toast.error('Error exporting exams')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
      completed: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getResultColor = (result) => {
    const colors = {
      Pass: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      Fail: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200'
    }
    return colors[result] || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type) => (type === 'practical' ? 'Practical Exam' : 'Theory Exam')

  const getSummary = (exam) => {
    if (exam.exam_type === 'practical') {
      return exam.vehicle_used || `Examiner ${exam.examiner_id || 'N/A'}`
    }
    return exam.total_marks ? `${exam.total_marks} total marks` : 'Theory exam'
  }

  const initials = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const columns = [
    {
      key: 'candidate',
      label: 'Candidate',
      render: (exam) => {
        const name = `${exam.first_name || ''} ${exam.last_name || ''}`.trim() || 'Unknown Candidate'
        return <ListRow avatar={initials(name)} title={name} subtitle={exam.national_id} />
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (exam) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <GraduationCap className="h-4 w-4 text-slate-400" />
          {getTypeLabel(exam.exam_type)}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (exam) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Calendar className="h-4 w-4 text-slate-400" />
          {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'details',
      label: 'Details',
      render: (exam) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <User className="h-4 w-4 text-slate-400" />
          <span className="truncate">{getSummary(exam)}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (exam) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(exam.status)}`}>{exam.status}</span>
    },
    {
      key: 'result',
      label: 'Result',
      render: (exam) => (
        exam.result ? (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getResultColor(exam.result)}`}>{exam.result}</span>
        ) : (
          <span className="text-xs font-semibold text-slate-500">Pending</span>
        )
      )
    },
    {
      key: 'select',
      label: '',
      render: (exam) => (
        <input
          type="checkbox"
          checked={selectedExams.includes(exam.exam_uid)}
          onChange={() => handleSelectExam(exam.exam_uid)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (exam) => (
        <div className="flex items-center gap-1">
          <Link to={`/dashboard/exams/${exam.exam_uid}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600">
            <Eye className="h-4 w-4" />
          </Link>
          <Link to={`/dashboard/exams/${exam.exam_uid}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-600">
            <Edit className="h-4 w-4" />
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
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
            <div className="rounded-full bg-amber-100 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
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
        <div className="card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Passed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.passed}</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
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
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Link to="/dashboard/exams/new" className="btn btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto">
          <Plus className="w-5 h-5" />
          <span>Schedule Exam</span>
        </Link>
        {selectedExams.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('cancel')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel ({selectedExams.length})</span>
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn btn-secondary flex items-center space-x-2 text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedExams.length})</span>
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
              checked={selectedExams.length === exams.length && exams.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by driver or ID"
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
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
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
            <option value="theory">Theory</option>
            <option value="practical">Practical</option>
          </select>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); setTypeFilter(''); setPage(1); setSelectedExams([]) }}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <ListTable
        columns={columns}
        data={exams}
        keyExtractor={(exam) => exam.exam_uid}
        loading={loading}
        emptyTitle="No exams found"
        emptySubtitle="Try adjusting the filters or schedule a new exam."
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  )
}

export default ExamList
