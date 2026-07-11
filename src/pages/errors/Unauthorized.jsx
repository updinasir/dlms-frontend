import { Link } from 'react-router-dom'
import { Shield, LogIn } from 'lucide-react'

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mt-2">
              You don't have permission to access this resource.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Shield className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </Link>
            <Link
              to="/login"
              className="btn btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Login with Different Account</span>
            </Link>
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

export default Unauthorized

