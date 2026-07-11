import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, Receipt, DollarSign, Calendar, BadgeCheck, User, Hash, CheckCircle, Edit } from 'lucide-react'

const PaymentDetail = () => {
  const { id } = useParams()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [markingComplete, setMarkingComplete] = useState(false)

  useEffect(() => {
    fetchPayment()
  }, [id])

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/payments/${id}`)
      setPayment(response.data.payment)
    } catch (error) {
      toast.error('Error fetching payment data')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleMarkComplete = async () => {
    if (!window.confirm('Mark this payment as Completed?')) return
    setMarkingComplete(true)
    try {
      const response = await api.put(`/payments/${id}`, { payment_status: 'Completed' })
      setPayment(response.data.payment)
      toast.success('Payment marked as Completed')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status')
    } finally {
      setMarkingComplete(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Payment not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Payments</p>
            <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
            <p className="text-gray-600 mt-1">View payment information</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {payment?.payment_status === 'Pending' && (
            <button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="btn btn-primary flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{markingComplete ? 'Updating...' : 'Mark as Completed'}</span>
            </button>
          )}
          <Link
            to={`/dashboard/payments/${id}/edit`}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Edit className="w-5 h-5" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handlePrint}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="card border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-6 border-b border-gray-100 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <Receipt className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">{payment.transaction_reference}</h2>
              <p className="mt-1 text-gray-600">Official payment record</p>
            </div>
            <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(payment.payment_status)}`}>
              {payment.payment_status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <DollarSign className="h-5 w-5 text-gray-400" />
                ${Number(payment.amount || 0).toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Payment Date</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-medium text-gray-900">
                <Calendar className="h-5 w-5 text-gray-400" />
                {payment.payment_date ? new Date(payment.payment_date).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Payment Type</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-medium text-gray-900">
                <BadgeCheck className="h-5 w-5 text-gray-400" />
                {payment.payment_type || 'N/A'}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-medium text-gray-900">
                <Hash className="h-5 w-5 text-gray-400" />
                {payment.payment_method || 'N/A'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Driver</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <User className="h-5 w-5 text-gray-400" />
                {payment.first_name} {payment.last_name}
              </p>
              {payment.email && <p className="mt-1 text-gray-600">{payment.email}</p>}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Transaction Reference</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{payment.transaction_reference}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            Generated on {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetail

