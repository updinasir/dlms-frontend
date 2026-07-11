import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-900">404</h1>
            <p className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</p>
            <p className="text-gray-600 mt-2">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound

