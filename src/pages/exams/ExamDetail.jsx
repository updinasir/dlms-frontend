import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Edit, CheckCircle, XCircle, Clock } from 'lucide-react'

const ExamDetail = () => {
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [resultData, setResultData] = useState({ score: '', result: '', remarks: '' })
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    fetchExam()
  }, [id])

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchExam = async () => {
    try {
      const response = await api.get(`/exams/${id}`)
      setExam(response.data.exam)
    } catch (error) {
      toast.error('Error fetching exam data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitResult = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // map to API expected keys: score, result, remarks
      await api.post(`/exams/${id}/result`, resultData)
      toast.success('Exam result successfully submitted')
      fetchExam()
    } catch (error) {
      toast.error('Error submitting exam result')
    } finally {
      setSubmitting(false)
    }
  }

  const examStart = useMemo(() => {
    if (!exam?.exam_date) {
      return null
    }

    const value = new Date(exam.exam_date)
    if (Number.isNaN(value.getTime())) {
      return null
    }

    return value
  }, [exam?.exam_date])

  const submissionOpen = useMemo(() => {
    if (!examStart) {
      return true
    }

    const scheduledDay = new Date(examStart)
    scheduledDay.setHours(0, 0, 0, 0)

    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    return today >= scheduledDay
  }, [examStart, now])

  const countdownLabel = useMemo(() => {
    if (!examStart) {
      return 'No scheduled date'
    }

    const scheduledDay = new Date(examStart)
    scheduledDay.setHours(0, 0, 0, 0)

    const diff = scheduledDay.getTime() - now.getTime()

    if (diff <= 0) {
      return 'Ready for result entry'
    }

    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`
    }

    return `${hours}h ${minutes}m ${seconds}s remaining`
  }, [examStart, now])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Exam not found</p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getResultColor = (result) => {
    const colors = {
      Pass: 'bg-emerald-100 text-emerald-800',
      Fail: 'bg-rose-100 text-rose-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return colors[result] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exam Details</h1>
            <p className="text-gray-600 mt-1">View exam information</p>
          </div>
        </div>
        {exam.status === 'scheduled' && (
          <Link to={`/dashboard/exams/${id}/edit`} className="btn btn-primary flex items-center space-x-2">
            <Edit className="w-5 h-5" />
            <span>Edit Exam</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Exam Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Exam Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Driver</label>
                <p className="text-lg font-medium text-gray-900">
                  {exam.first_name} {exam.last_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Exam Type</label>
                <p className="text-gray-900 capitalize">{exam.exam_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                <p className="text-gray-900">{new Date(exam.exam_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Examiner</label>
                <p className="text-gray-900">{exam.examiner_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Result Submission */}
          {exam.status === 'scheduled' && (
            <div className="card">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Submit Exam Result</h2>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {countdownLabel}
                </div>
              </div>

              {!submissionOpen && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Result entry is locked until the scheduled exam date arrives.
                </div>
              )}

              <form onSubmit={handleSubmitResult} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-100)
                  </label>
                  <input
                    type="number"
                    value={resultData.score}
                    onChange={(e) => setResultData({ ...resultData, score: e.target.value })}
                    className="input"
                    placeholder="Enter score"
                    min="0"
                    max="100"
                    disabled={!submissionOpen}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Result
                  </label>
                  <select
                    value={resultData.result}
                    onChange={(e) => setResultData({ ...resultData, result: e.target.value })}
                    className="input"
                    disabled={!submissionOpen}
                  >
                    <option value="">Select result</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Examiner Notes
                  </label>
                  <textarea
                    value={resultData.remarks}
                    onChange={(e) => setResultData({ ...resultData, remarks: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Enter examiner notes"
                    disabled={!submissionOpen}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !submissionOpen}
                  className="btn btn-primary w-full"
                >
                  {submitting ? 'Submitting...' : submissionOpen ? 'Submit Result' : 'Locked Until Exam Date'}
                </button>
              </form>
            </div>
          )}

          {/* Exam Result */}
          {exam.status === 'completed' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Exam Result</h2>
              <div className="flex items-center space-x-4 mb-4">
                {exam.result === 'Pass' ? (
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                ) : (
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                )}
                <div>
                  <p className="text-2xl font-bold text-gray-900">{exam.result}</p>
                  <p className="text-gray-600">Score: {exam.score || '-'}</p>
                </div>
              </div>
              {exam.examiner_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Examiner Notes</label>
                  <p className="text-gray-900">{exam.remarks || exam.examiner_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                  {exam.status}
                </span>
              </div>
              {exam.result && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Result</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(exam.result)}`}>
                    {exam.result}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Score</span>
                <span className="text-sm font-medium text-gray-900">{exam.score || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm text-gray-900">{exam.created_at ? new Date(exam.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamDetail

