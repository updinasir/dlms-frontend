import { Link } from 'react-router-dom'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Server Error</h1>
            <p className="text-gray-600 mt-2">
              Something went wrong on our end. Please try again later.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            <Link
              to="/dashboard"
              className="btn btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-500">
              Error Code: 500 | If the problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServerError

