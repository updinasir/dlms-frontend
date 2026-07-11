import { Component } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-rose-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-6">
              We apologize for the inconvenience. The application encountered an unexpected error.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Application
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-slate-400 cursor-pointer">Error details</summary>
                <pre className="mt-2 p-3 bg-slate-100 rounded-lg text-xs text-slate-700 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
