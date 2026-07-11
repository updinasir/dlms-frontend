import { useAuth } from '../../contexts/AuthContext'
import AdminDashboard from './AdminDashboard'
import ExaminerDashboard from './ExaminerDashboard'
import CashierDashboard from './CashierDashboard'
import DriverDashboard from './DriverDashboard'

const roleDashboardMap = {
  1: AdminDashboard,   // Super Admin
  2: AdminDashboard,   // Admin
  3: ExaminerDashboard,// Examiner
  4: AdminDashboard,   // Staff
  5: CashierDashboard, // Cashier
  6: DriverDashboard,  // Driver
}

const RoleDashboard = () => {
  const { user } = useAuth()
  const role = user?.role

  if (!role) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Loading dashboard...</p>
          <p className="text-sm text-slate-500">Please wait while we set up your workspace.</p>
        </div>
      </div>
    )
  }

  const DashboardComponent = roleDashboardMap[role] || AdminDashboard

  try {
    return <DashboardComponent />
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Dashboard Error</p>
          <p className="text-sm text-slate-500">There was an error loading the dashboard. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }
}

export default RoleDashboard

