import { useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {
  Download, Users, CreditCard, DollarSign, Calendar, AlertTriangle,
  TrendingUp, Hash, MapPin, BarChart3, PieChart, LayoutDashboard, Printer,
  FileSpreadsheet, FileDigit, RotateCcw, FileOutput, Sparkles, FileSearch, ClipboardList
} from 'lucide-react'

const Reports = () => {
  const [reportType, setReportType] = useState('drivers')
  const [format, setFormat] = useState('json')
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    date_from: '',
    date_to: ''
  })
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false)

  const handleGenerateReport = async (overrideType, overrideFilters, overrideFormat) => {
    const type = overrideType || reportType
    const filterVals = overrideFilters || filters
    const fmt = overrideFormat || format
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filterVals).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('format', fmt)

      const endpoint = `/reports/${type}?${params}`

      if (fmt === 'excel' || fmt === 'pdf') {
        const response = await api.get(endpoint, { responseType: 'blob' })
        const blob = new Blob([response.data], {
          type: fmt === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${type}-report.${fmt === 'excel' ? 'xlsx' : 'pdf'}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Report downloaded successfully')
      } else {
        const response = await api.get(endpoint)
        setReportData(response.data)
        toast.success(`Report loaded: ${getRecordCount(response.data)} records`)
      }
    } catch (error) {
      console.error('Report error:', error)
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Error generating report'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getRecordCount = (data) => {
    if (!data) return 0
    if (data.drivers) return data.drivers.length
    if (data.licenses) return data.licenses.length
    if (data.payments) return data.payments.length
    if (data.examiners) return data.examiners.length
    if (data.appointments || data.licenses || data.payments || data.drivers) return 1
    return 0
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(value || 0))
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const statusBadge = (status) => {
    const colors = {
      Approved: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
      Active: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
      Paid: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
      Completed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
      Pending: 'bg-amber-100 text-amber-700 ring-amber-200',
      Unpaid: 'bg-rose-100 text-rose-700 ring-rose-200',
      Rejected: 'bg-rose-100 text-rose-700 ring-rose-200',
      Expired: 'bg-rose-100 text-rose-700 ring-rose-200',
      Revoked: 'bg-rose-100 text-rose-700 ring-rose-200',
      Suspended: 'bg-amber-100 text-amber-700 ring-amber-200',
      default: 'bg-slate-100 text-slate-700 ring-slate-200'
    }
    const className = colors[status] || colors.default
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>{status || 'N/A'}</span>
  }

  const reportTypes = [
    { id: 'drivers', name: 'Driver Report', icon: Users, description: 'Comprehensive driver statistics and records', color: 'blue' },
    { id: 'licenses', name: 'License Report', icon: CreditCard, description: 'License issuance and status overview', color: 'emerald' },
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Payment and revenue analytics', color: 'violet' },
    { id: 'examiners', name: 'Examiner Performance', icon: ClipboardList, description: 'Exams, pass/fail rates, no-shows and late arrivals by examiner', color: 'rose' },
    { id: 'workflow', name: 'Workflow Dashboard', icon: LayoutDashboard, description: 'Real-time system-wide workflow KPIs', color: 'amber' }
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      {/* Hero Header */}
      <div className="no-print relative overflow-hidden rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary-100/50 to-transparent"></div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Analytics</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Reports & Exports</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Generate detailed reports for drivers, licenses, and revenue. Export as JSON, Excel, or PDF.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
            <LayoutDashboard className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="no-print grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Report Type Selection */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <FileOutput className="h-4 w-4" />
              Select Report Type
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reportTypes.map((type) => {
                const Icon = type.icon
                const isActive = reportType === type.id
                const colorMap = {
                  blue: { active: 'border-blue-500 bg-blue-50/70', icon: 'bg-blue-100 text-blue-600', dot: 'bg-blue-500' },
                  emerald: { active: 'border-emerald-500 bg-emerald-50/70', icon: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' },
                  violet: { active: 'border-violet-500 bg-violet-50/70', icon: 'bg-violet-100 text-violet-600', dot: 'bg-violet-500' },
                  rose: { active: 'border-rose-500 bg-rose-50/70', icon: 'bg-rose-100 text-rose-600', dot: 'bg-rose-500' },
                  amber: { active: 'border-amber-500 bg-amber-50/70', icon: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500' }
                }
                const c = colorMap[type.color]
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setReportType(type.id)
                      setHasAppliedFilters(false)
                      setReportData(null)
                    }}
                    className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
                      isActive ? `${c.active} shadow-sm` : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.icon} ${isActive ? '' : 'bg-slate-100 text-slate-600 group-hover:bg-white'}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{type.name}</h3>
                          {isActive && <span className={`h-2 w-2 rounded-full ${c.dot}`}></span>}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{type.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Report Filters */}
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <BarChart3 className="h-4 w-4" />
              Report Filters
            </div>
            <div className="space-y-4">
              {reportType === 'drivers' && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                  >
                    <option value="">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}

              {(reportType === 'examiners' || reportType === 'workflow') && (
                <p className="text-sm text-slate-500">
                  {reportType === 'examiners'
                    ? 'Date range filters apply to appointments and practical exams assigned to each examiner.'
                    : 'Workflow dashboard shows current system-wide totals. Date filters are not used.'}
                </p>
              )}

              {reportType === 'licenses' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Revoked">Revoked</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                    >
                      <option value="">All Categories</option>
                      <option value="A">Class A - Motorcycle</option>
                      <option value="B">Class B - Private Car</option>
                      <option value="C">Class C - Truck</option>
                      <option value="D">Class D - Bus</option>
                      <option value="E">Class E - Heavy Vehicle</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">From Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={filters.date_from}
                      onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">To Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasAppliedFilters(true)
                    handleGenerateReport(reportType, filters, 'json')
                  }}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 disabled:opacity-60"
                >
                  <BarChart3 className="h-4 w-4" />
                  Apply Filters
                </button>

                {(filters.status || filters.category || filters.date_from || filters.date_to) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ status: '', category: '', date_from: '', date_to: '' })
                      setHasAppliedFilters(false)
                      setReportData(null)
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              <Download className="h-4 w-4" />
              Export Format
            </div>
            <div className="space-y-3">
              {[
                { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { id: 'pdf', label: 'PDF (.pdf)', icon: FileDigit, color: 'text-rose-600', bg: 'bg-rose-50' }
              ].map((fmt) => {
                const Icon = fmt.icon
                const isActive = format === fmt.id
                return (
                  <label
                    key={fmt.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all ${
                      isActive ? 'border-primary-400 bg-primary-50/60 ring-1 ring-primary-200' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={fmt.id}
                      checked={isActive}
                      onChange={(e) => setFormat(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${fmt.bg}`}>
                      <Icon className={`h-5 w-5 ${fmt.color}`} />
                    </div>
                    <span className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{fmt.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => {
              setHasAppliedFilters(true)
              handleGenerateReport()
            }}
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 disabled:opacity-70"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Generate Report</span>
              </>
            )}
          </button>

          <div className="rounded-[30px] border border-blue-200/70 bg-gradient-to-br from-blue-50/80 to-sky-50/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              <Sparkles className="h-4 w-4" />
              Quick Reports
            </div>
            <div className="space-y-2">
              {[
                {
                  label: "Today's Revenue",
                  onClick: () => {
                    const today = new Date().toISOString().split('T')[0]
                    setReportType('revenue')
                    setFilters({ status: '', category: '', date_from: today, date_to: today })
                    setHasAppliedFilters(true)
                    handleGenerateReport('revenue', { status: '', category: '', date_from: today, date_to: today }, 'json')
                  }
                },
                {
                  label: 'Last 7 Days Revenue',
                  onClick: () => {
                    const today = new Date().toISOString().split('T')[0]
                    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    setReportType('revenue')
                    setFilters({ status: '', category: '', date_from: sevenDaysAgo, date_to: today })
                    setHasAppliedFilters(true)
                    handleGenerateReport('revenue', { status: '', category: '', date_from: sevenDaysAgo, date_to: today }, 'json')
                  }
                },
                {
                  label: 'Approved Drivers',
                  onClick: () => {
                    setReportType('drivers')
                    setFilters({ status: 'Approved', category: '', date_from: '', date_to: '' })
                    setHasAppliedFilters(true)
                    handleGenerateReport('drivers', { status: 'Approved', category: '', date_from: '', date_to: '' }, 'json')
                  }
                }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-blue-700 transition hover:bg-white/70"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && hasAppliedFilters && (
        <div className="no-print rounded-[30px] border border-slate-200 bg-slate-50/50 p-10 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Loading report...</h3>
        </div>
      )}

      {/* Empty State */}
      {!hasAppliedFilters && !loading && (
        <div className="no-print rounded-[30px] border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <FileSearch className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Apply filters to view the report</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Select a report type, set your filters, and click <strong>Apply Filters</strong> to load the list below.
          </p>
        </div>
      )}

      {/* No Records State */}
      {hasAppliedFilters && !loading && reportData && getRecordCount(reportData) === 0 && (
        <div className="no-print rounded-[30px] border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <FileSearch className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No records found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Try adjusting the filters or selecting a different date range to get results.
          </p>
        </div>
      )}

      {/* Report Results */}
      {hasAppliedFilters && !loading && reportData && getRecordCount(reportData) > 0 && (
        <div className="print-results space-y-6">
          <style>{`
            @media print {
              body { background: white !important; }
              .print-results { box-shadow: none !important; border: none !important; background: white !important; }
              .print-results .print-only { display: block !important; }
              .print-results .print-card { border: 1px solid #e2e8f0 !important; background: white !important; box-shadow: none !important; }
              .print-results .print-card table { border-collapse: collapse; width: 100%; }
              .print-results .print-card th { background: #f1f5f9 !important; color: #0f172a !important; font-weight: 700; }
              .print-results .print-card td, .print-results .print-card th { border: 1px solid #e2e8f0 !important; padding: 8px 12px; }
            }
            .print-only { display: none; }
          `}</style>

          {/* Print-only professional header */}
          <div className="print-only mb-8 border-b border-slate-300 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">DLMS11 Report</p>
                <h1 className="mt-1 text-3xl font-black text-slate-900">
                  {reportTypes.find((t) => t.id === reportType)?.name}
                </h1>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p className="font-semibold text-slate-900">DLMS11</p>
                <p>Generated: {new Date().toLocaleString('en-US')}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                Records: {getRecordCount(reportData)}
              </span>
              {filters.status && (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Status: {filters.status}</span>
              )}
              {filters.category && (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Category: {filters.category}</span>
              )}
              {filters.date_from && (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">From: {filters.date_from}</span>
              )}
              {filters.date_to && (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">To: {filters.date_to}</span>
              )}
            </div>
          </div>

          <div className="no-print flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Results</p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                {reportTypes.find((t) => t.id === reportType)?.name} Results
              </h2>
              <p className="mt-1 text-sm text-slate-500">{getRecordCount(reportData)} records found</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleGenerateReport(reportType, filters, 'excel')}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Export Excel
              </button>
              <button
                type="button"
                onClick={() => handleGenerateReport(reportType, filters, 'pdf')}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FileDigit className="h-4 w-4 text-rose-600" />
                Export PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {reportData.summary && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {reportType === 'drivers' && (
                <>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Drivers</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.total || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.by_status?.Approved || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.by_status?.Pending || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top City</p>
                        <p className="text-lg font-black text-slate-900">
                          {Object.entries(reportData.summary.by_city || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {reportType === 'licenses' && (
                <>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Licenses</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.total || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.by_status?.Active || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expiring Soon</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.expiring_soon || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <PieChart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Categories</p>
                        <p className="text-2xl font-black text-slate-900">{Object.keys(reportData.summary.by_category || {}).length}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {reportType === 'revenue' && (
                <>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</p>
                        <p className="text-2xl font-black text-slate-900">{formatCurrency(reportData.summary.total_amount)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payments</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.total_payments || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Payment</p>
                        <p className="text-2xl font-black text-slate-900">
                          {reportData.summary.total_payments ? formatCurrency(parseFloat(reportData.summary.total_amount) / reportData.summary.total_payments) : formatCurrency(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <PieChart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Types</p>
                        <p className="text-2xl font-black text-slate-900">{Object.keys(reportData.summary.by_payment_type || {}).length}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {reportType === 'examiners' && (
                <>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Examiners</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.total_examiners || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Hash className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Appointments</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.total_appointments || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pass Rate</p>
                        <p className="text-2xl font-black text-slate-900">
                          {reportData.summary.total_passes + reportData.summary.total_fails
                            ? Math.round((reportData.summary.total_passes / (reportData.summary.total_passes + reportData.summary.total_fails)) * 100) + '%'
                            : '0%'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">No Shows</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.summary.total_no_shows || 0}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {reportType === 'workflow' && (
                <>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Appointments</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.appointments.total || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Licenses</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.licenses.active || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</p>
                        <p className="text-2xl font-black text-slate-900">{formatCurrency(reportData.payments.revenue)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Drivers</p>
                        <p className="text-2xl font-black text-slate-900">{reportData.drivers.total || 0}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Data Table */}
          <div className="print-card overflow-hidden rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-black text-slate-900">Report Data</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{getRecordCount(reportData)} records</span>
            </div>
            <div className="overflow-x-auto">
              {reportType === 'drivers' && reportData.drivers && (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">National ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Gender</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">City</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.drivers.map((d) => (
                      <tr key={d.driver_id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono text-slate-500">#{d.driver_id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{d.national_id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {d.first_name} {d.last_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{d.gender || 'N/A'}</td>
                        <td className="px-4 py-3 text-slate-600">{d.phone || 'N/A'}</td>
                        <td className="px-4 py-3 text-slate-600">{d.city || 'N/A'}</td>
                        <td className="px-4 py-3">{statusBadge(d.status)}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(d.registration_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {reportType === 'licenses' && reportData.licenses && (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">License ID</th>
                      <th className="px-4 py-3 text-left">Number</th>
                      <th className="px-4 py-3 text-left">Driver</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Issued</th>
                      <th className="px-4 py-3 text-left">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.licenses.map((l) => {
                      const catName = reportData.categories?.[l.category_id] || l.category_id
                      const isExpiringSoon = l.expiry_date && new Date(l.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && new Date(l.expiry_date) >= new Date()
                      return (
                        <tr key={l.license_id} className="transition-colors hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-mono text-slate-500">#{l.license_id}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{l.license_number}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {l.first_name} {l.last_name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{catName}</td>
                          <td className="px-4 py-3">{statusBadge(l.license_status)}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(l.issue_date)}</td>
                          <td className="px-4 py-3">
                            <span className={isExpiringSoon ? 'font-semibold text-amber-600' : 'text-slate-500'}>
                              {formatDate(l.expiry_date)} {isExpiringSoon && '(Expiring)'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
              {reportType === 'revenue' && reportData.payments && (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Payment ID</th>
                      <th className="px-4 py-3 text-left">Driver</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Method</th>
                      <th className="px-4 py-3 text-left">Reference</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.payments.map((p) => (
                      <tr key={p.payment_id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono text-slate-500">#{p.payment_id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {p.first_name} {p.last_name}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-slate-600">{p.payment_type}</td>
                        <td className="px-4 py-3 text-slate-600">{p.payment_method}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{p.transaction_reference || '-'}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(p.payment_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {reportType === 'examiners' && reportData.examiners && (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Examiner</th>
                      <th className="px-4 py-3 text-left">Appointments</th>
                      <th className="px-4 py-3 text-left">Completed</th>
                      <th className="px-4 py-3 text-left">No Shows</th>
                      <th className="px-4 py-3 text-left">Late</th>
                      <th className="px-4 py-3 text-left">Practical Exams</th>
                      <th className="px-4 py-3 text-left">Pass</th>
                      <th className="px-4 py-3 text-left">Fail</th>
                      <th className="px-4 py-3 text-left">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.examiners.map((e) => (
                      <tr key={e.user_id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-slate-900">{e.full_name}</td>
                        <td className="px-4 py-3 text-slate-600">{e.total_appointments || 0}</td>
                        <td className="px-4 py-3 text-emerald-700 font-semibold">{e.completed_appointments || 0}</td>
                        <td className="px-4 py-3 text-orange-600">{e.no_shows || 0}</td>
                        <td className="px-4 py-3 text-amber-600">{e.late_arrivals || 0}</td>
                        <td className="px-4 py-3 text-slate-600">{e.practical_exams || 0}</td>
                        <td className="px-4 py-3 text-emerald-700 font-semibold">{e.passes || 0}</td>
                        <td className="px-4 py-3 text-rose-600">{e.fails || 0}</td>
                        <td className="px-4 py-3 text-slate-600">{e.average_score || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {reportType === 'workflow' && reportData && (
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: 'Scheduled Appointments', value: reportData.appointments.scheduled || 0 },
                    { label: 'Checked In', value: reportData.appointments.checked_in || 0 },
                    { label: 'Waiting', value: reportData.appointments.waiting || 0 },
                    { label: 'In Progress', value: reportData.appointments.in_progress || 0 },
                    { label: 'Completed', value: reportData.appointments.completed || 0 },
                    { label: 'No Show', value: reportData.appointments.no_show || 0 },
                    { label: 'Expired', value: reportData.appointments.expired || 0 },
                    { label: 'Cancelled', value: reportData.appointments.cancelled || 0 },
                    { label: 'Reschedule Requests', value: reportData.appointments.reschedule_requests || 0 },
                    { label: 'Pending Licenses', value: reportData.licenses.pending || 0 },
                    { label: 'Expired Licenses', value: reportData.licenses.expired || 0 },
                    { label: 'Suspended Licenses', value: reportData.licenses.suspended || 0 },
                    { label: 'Revoked Licenses', value: reportData.licenses.revoked || 0 },
                    { label: 'Completed Payments', value: reportData.payments.completed || 0 },
                    { label: 'Pending Payments', value: reportData.payments.pending || 0 },
                    { label: 'Approved Drivers', value: reportData.drivers.approved || 0 },
                    { label: 'Pending Drivers', value: reportData.drivers.pending || 0 },
                    { label: 'Rejected Drivers', value: reportData.drivers.rejected || 0 }
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                      <p className="mt-1 text-2xl font-black text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports


