import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import ChangePassword from './pages/auth/ChangePassword'
import SearchDriver from './pages/auth/SearchDriver'
import DriverPortal from './pages/driver/DriverPortal'
import Profile from './pages/auth/Profile'
import RoleDashboard from './pages/dashboards/RoleDashboard'
import DriverList from './pages/drivers/DriverList'
import DriverForm from './pages/drivers/DriverForm'
import DriverProfile from './pages/drivers/DriverProfile'
import DriverVerify from './pages/verify/DriverVerify'
import LicenseList from './pages/licenses/LicenseList'
import LicenseForm from './pages/licenses/LicenseForm'
import LicenseDetail from './pages/licenses/LicenseDetail'
import ExamList from './pages/exams/ExamList'
import ExamForm from './pages/exams/ExamForm'
import ExamDetail from './pages/exams/ExamDetail'
import PaymentList from './pages/payments/PaymentList'
import PaymentForm from './pages/payments/PaymentForm'
import PaymentDetail from './pages/payments/PaymentDetail'
import AppointmentList from './pages/appointments/AppointmentList'
import AppointmentForm from './pages/appointments/AppointmentForm'
import Reports from './pages/Reports'
import DocumentList from './pages/documents/DocumentList'
import AIDetection from './pages/ai/AIDetection'
import RiskAssessment from './pages/ai/RiskAssessment'
import UserManagement from './pages/admin/UserManagement'
import RoleManagement from './pages/admin/RoleManagement'
import LicenseCategoryManagement from './pages/admin/LicenseCategoryManagement'
import ServiceManagement from './pages/admin/ServiceManagement'
import NotificationCenter from './pages/admin/NotificationCenter'
import NotificationList from './pages/notifications/NotificationList'
import NotificationDetail from './pages/notifications/NotificationDetail'
import NotificationPreferences from './pages/notifications/NotificationPreferences'
import AuditLogViewer from './pages/admin/AuditLogViewer'
import AuditLogDetail from './pages/admin/AuditLogDetail'
import AuditCategory from './pages/admin/AuditCategory'
import LoginHistory from './pages/admin/LoginHistory'
import UserActivitySelect from './pages/admin/UserActivitySelect'
import AuditSettings from './pages/admin/AuditSettings'
import UserActivityDetails from './pages/admin/UserActivityDetails'
import SystemSettings from './pages/admin/SystemSettings'
import DatabaseManagement from './pages/admin/DatabaseManagement'
import ApiKeys from './pages/admin/ApiKeys'
import ThemeSettings from './pages/admin/ThemeSettings'
import LanguageSettings from './pages/admin/LanguageSettings'
import HelpCenter from './pages/help/HelpCenter'
import About from './pages/help/About'
import NotFound from './pages/errors/NotFound'

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/search-driver" element={<SearchDriver />} />
          <Route path="/driver-portal" element={<DriverPortal />} />
          <Route path="/verify/driver/:id" element={<DriverVerify />} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Profile />} />
          </Route>
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<RoleDashboard />} />
            <Route path="drivers" element={<DriverList />} />
            <Route path="drivers/new" element={<DriverForm />} />
            <Route path="drivers/:id" element={<DriverProfile />} />
            <Route path="drivers/:id/edit" element={<DriverForm />} />
            <Route path="licenses" element={<LicenseList />} />
            <Route path="licenses/new" element={<LicenseForm />} />
            <Route path="licenses/:id" element={<LicenseDetail />} />
            <Route path="licenses/:id/edit" element={<LicenseForm />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="exams/new" element={<ExamForm />} />
            <Route path="exams/:id" element={<ExamDetail />} />
            <Route path="exams/:id/edit" element={<ExamForm />} />
            <Route path="payments" element={<PaymentList />} />
            <Route path="payments/new" element={<PaymentForm />} />
            <Route path="payments/:id" element={<PaymentDetail />} />
            <Route path="payments/:id/edit" element={<PaymentForm />} />
            <Route path="appointments" element={<AppointmentList />} />
            <Route path="appointments/new" element={<AppointmentForm />} />
            <Route path="appointments/:id/edit" element={<AppointmentForm />} />
            <Route path="documents" element={<DocumentList />} />
            <Route path="notifications" element={<NotificationList />} />
            <Route path="notifications/preferences" element={<NotificationPreferences />} />
            <Route path="notifications/:id" element={<NotificationDetail />} />
            <Route path="reports" element={<Reports />} />
            <Route path="ai/detection" element={<AIDetection />} />
            <Route path="ai/risk-assessment" element={<RiskAssessment />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/roles" element={<RoleManagement />} />
            <Route path="admin/license-categories" element={<LicenseCategoryManagement />} />
            <Route path="admin/services" element={<ServiceManagement />} />
            <Route path="admin/settings" element={<SystemSettings />} />
            <Route path="admin/database" element={<DatabaseManagement />} />
            <Route path="admin/api-keys" element={<ApiKeys />} />
            <Route path="admin/appearance" element={<ThemeSettings />} />
            <Route path="admin/language" element={<LanguageSettings />} />
            <Route path="admin/notifications" element={<NotificationCenter />} />
            <Route path="admin/audit-logs" element={<AuditLogViewer />} />
            <Route path="admin/audit-logs/login-history" element={<LoginHistory />} />
            <Route path="admin/audit-logs/user-activity" element={<UserActivitySelect />} />
            <Route path="admin/audit-logs/settings" element={<AuditSettings />} />
            <Route path="admin/audit-logs/category/:category" element={<AuditCategory />} />
            <Route path="admin/audit-logs/:id" element={<AuditLogDetail />} />
            <Route path="admin/users/:id/activity" element={<UserActivityDetails />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="about" element={<About />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
