import { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Shield, Search, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

const RiskAssessment = () => {
  const [driverId, setDriverId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAssess = async (e) => {
    e.preventDefault()
    if (!driverId.trim()) {
      toast.error('Please enter a driver ID')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/ai/risk-score/${driverId}`)
      setResult(response.data)
      toast.success('Risk assessment completed successfully')
    } catch (error) {
      toast.error('Error assessing driver risk')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-500',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-500',
      high: 'bg-red-100 text-red-800 border-red-500'
    }
    return colors[level] || colors.low
  }

  const getRiskIcon = (level) => {
    if (level === 'high') return <AlertTriangle className="w-8 h-8 text-red-600" />
    if (level === 'medium') return <AlertTriangle className="w-8 h-8 text-yellow-600" />
    return <CheckCircle className="w-8 h-8 text-green-600" />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Driver Risk Score</h1>
        <p className="text-gray-600 mt-1">Rule-based driver risk evaluation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span>Assess Driver Risk</span>
          </h2>
          <form onSubmit={handleAssess} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver ID
              </label>
              <input
                type="text"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="input"
                placeholder="Enter driver ID"
                required
              />
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
                  <span>Assess Risk</span>
                </>
              )}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-6 rounded-lg border-2 ${getRiskColor(result.risk_level)}`}>
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-white rounded-full">
                  {getRiskIcon(result.risk_level)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Risk Score: {result.risk_score}/100
                  </h3>
                  <p className="text-gray-600">Risk Level: {result.risk_level.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Risk Factors</label>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Failed Exams</span>
                      <span className="font-semibold text-gray-900">{result.factors.failed_exams}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Risk Breakdown</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(result.factors.failed_exams * 10, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-16">Exams</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-300">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Assessed on {new Date(result.calculated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Risk Guidelines */}
        <div className="space-y-8">
          <div className="card bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Low Risk (0-30)</span>
            </h3>
            <p className="text-sm text-gray-600">
              Driver has a clean record and good exam performance.
              Standard monitoring recommended.
            </p>
          </div>

          <div className="card bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span>Medium Risk (31-60)</span>
            </h3>
            <p className="text-sm text-gray-600">
              Driver has some failed exams. Increased monitoring and
              additional verification recommended.
            </p>
          </div>

          <div className="card bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>High Risk (61-100)</span>
            </h3>
            <p className="text-sm text-gray-600">
              Driver has multiple failed exams.
              Strict monitoring and additional security measures required.
            </p>
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Recommendations</span>
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>â€¢ Regular risk assessments for all drivers</li>
              <li>â€¢ Additional verification for high-risk drivers</li>
              <li>â€¢ Monitor exam performance over time</li>
              <li>â€¢ Implement graduated response system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskAssessment


