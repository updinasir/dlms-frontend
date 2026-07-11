import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, Users, CreditCard, FileText, Calendar, DollarSign, BarChart3, Brain, Menu, Search, Bell, Mail, ChevronRight, Sparkles, UserCircle2, CheckCheck, CircleAlert, Info, TriangleAlert, Shield, Lock, Files, Clock, Settings, HelpCircle, Palette, Database, Globe, KeyRound, LogOut, Building2, Layers } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { auditCategories } from '../config/auditCategories'
import dayLogo from '../assets/Day-Logo.png'

const Layout = () => {
  const { user, logout, hasPermission } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const auditHref = (cat) => {
    if (cat.id === 'all') return '/dashboard/admin/audit-logs'
    if (cat.special === 'login-history') return '/dashboard/admin/audit-logs/login-history'
    if (cat.special === 'user-activity') return '/dashboard/admin/audit-logs/user-activity'
    if (cat.special === 'audit-settings') return '/dashboard/admin/audit-logs/settings'
    return `/dashboard/admin/audit-logs/category/${cat.id}`
  }
  const auditSectionActive = location.pathname.startsWith('/dashboard/admin/audit-logs')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [notificationFilter, setNotificationFilter] = useState('all')
  const notificationMenuRef = useRef(null)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const [settingsAuditOpen, setSettingsAuditOpen] = useState(auditSectionActive)
  const [auditHoverOpen, setAuditHoverOpen] = useState(false)
  const settingsMenuRef = useRef(null)

  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard', action: 'view' },
    { name: 'Drivers', href: '/dashboard/drivers', icon: Users, module: 'drivers', action: 'view' },
    { name: 'Licenses', href: '/dashboard/licenses', icon: CreditCard, module: 'licenses', action: 'view' },
    { name: 'Exams', href: '/dashboard/exams', icon: FileText, module: 'exams', action: 'view' },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar, module: 'appointments', action: 'view' },
    { name: 'Documents', href: '/dashboard/documents', icon: Files, module: 'documents', action: 'view' },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign, module: 'payments', action: 'view' },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, module: 'reports', action: 'view' },
    { name: 'Forensics & Risk', href: '/dashboard/ai/detection', icon: Brain, module: 'ai', action: 'view' },
  ]

  const adminNav = [
    { name: 'Users', href: '/dashboard/admin/users', icon: Users, module: 'users', action: 'view' },
    { name: 'Roles', href: '/dashboard/admin/roles', icon: Shield, module: 'roles', action: 'view' },
    { name: 'License Categories', href: '/dashboard/admin/license-categories', icon: CreditCard, module: 'licenses', action: 'view' },
    { name: 'Services', href: '/dashboard/admin/services', icon: DollarSign, module: 'services', action: 'view' },
    { name: 'Audit Logs', href: '/dashboard/admin/audit-logs', icon: Layers, module: 'audit_logs', action: 'view' },
  ]

  const systemNav = [
    { name: 'System Settings', href: '/dashboard/admin/settings', icon: Settings, module: 'settings', action: 'view' },
    { name: 'Database', href: '/dashboard/admin/database', icon: Database, module: 'database', action: 'view' },
    { name: 'API Keys', href: '/dashboard/admin/api-keys', icon: KeyRound, module: 'api_keys', action: 'view' },
  ]

  const appearanceNav = [
    { name: 'Theme', href: '/dashboard/admin/appearance', icon: Palette, module: 'appearance', action: 'view' },
    { name: 'Language', href: '/dashboard/admin/language', icon: Globe, module: 'language', action: 'view' },
  ]

  const supportNav = [
    { name: 'Help Center', href: '/dashboard/help', icon: HelpCircle, module: 'help', action: 'view' },
    { name: 'About', href: '/dashboard/about', icon: Building2, module: 'about', action: 'view' },
  ]

  const filteredMainNav = mainNav.filter((item) => hasPermission(item.module, item.action))
  const filteredAdminNav = adminNav.filter((item) => hasPermission(item.module, item.action))
  const filteredSystemNav = systemNav.filter((item) => hasPermission(item.module, item.action))
  const filteredAppearanceNav = appearanceNav.filter((item) => hasPermission(item.module, item.action))
  const filteredSupportNav = supportNav.filter((item) => hasPermission(item.module, item.action))
  const canViewAudit = hasPermission('audit_logs', 'view')

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const roleLabels = { 1: 'Super Admin', 2: 'Admin', 3: 'Examiner', 4: 'Staff', 5: 'Cashier', 6: 'Driver' }

  const userRole = Number(user?.role)
  const isDriver = userRole === 6
  const isStaff = userRole >= 1 && userRole <= 5
  const messagesHref = isDriver ? '/dashboard/notifications' : '/dashboard/admin/notifications'

  const auditNavItems = canViewAudit ? auditCategories.map((cat) => ({ name: cat.name, href: auditHref(cat) })) : []
  const messagesNav = [{ name: 'Messages', href: messagesHref }]
  const activePageTitle = [...mainNav, ...adminNav, ...auditNavItems, ...messagesNav].find((item) => isActive(item.href))?.name || 'Dashboard'

  const userInitial = user?.full_name?.[0] || 'A'
  const userProfileImage = user?.profile_image || user?.photo || ''

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
  const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '')

  const resolveUserImageSrc = (value) => {
    if (!value || typeof value !== 'string' || value === '[object Object]') return ''
    if (value.startsWith('http')) return value
    return value.startsWith('/') ? `${API_ORIGIN}${value}` : `${API_ORIGIN}/${value}`
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const loadNotifications = async () => {
    setNotificationLoading(true)
    setNotificationError('')
    try {
      const [notificationsResponse, unreadResponse, overdueResponse] = await Promise.all([
        api.get('/notifications/user/my-notifications'),
        api.get('/notifications/user/unread-count'),
        api.get('/appointments/overdue/list')
      ])
      const regularNotifications = notificationsResponse.data.notifications || []
      const overdueNotifications = overdueResponse.data.notifications || []
      const allNotifications = [...overdueNotifications, ...regularNotifications]
      setNotifications(allNotifications)
      setUnreadCount(Number(unreadResponse.data.count || 0))
    } catch {
      setNotificationError('Unable to load notifications.')
    } finally {
      setNotificationLoading(false)
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotificationMenuOpen(false)
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setSettingsMenuOpen(false)
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false)
        setNotificationMenuOpen(false)
        setSettingsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    if (notificationMenuOpen) {
      loadNotifications()
    }
  }, [notificationMenuOpen])

  useEffect(() => {
    setSettingsAuditOpen(auditSectionActive)
  }, [auditSectionActive])

  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const timeLabel = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const dateLabel = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  const getNotificationCategory = (notification) => {
    const category = String(notification?.category || '').toLowerCase().trim()
    if (category && category !== 'information' && category !== 'system') {
      return category
    }
    const title = String(notification?.title || '').toLowerCase()
    const message = String(notification?.message || '').toLowerCase()
    const type = String(notification?.notification_type || '').toLowerCase()
    const combinedText = `${title} ${message}`
    if (/appointment|schedule|overdue|exam|test|practical|theory/.test(combinedText)) {
      return 'appointment'
    }
    if (/payment|paid|complete|transaction|revenue|invoice/.test(combinedText)) {
      return 'payment'
    }
    if (/license|licence|renew|renewal|issue|verification|verify|qr/.test(combinedText)) {
      return 'license'
    }
    if (/register|registration|driver|sign up|new account/.test(combinedText)) {
      return 'registration'
    }
    if (/document|upload|file/.test(combinedText)) {
      return 'document'
    }
    return 'system'
  }

  const getNotificationCategoryLabel = (notification) => {
    const category = getNotificationCategory(notification)
    const labels = {
      all: 'All',
      appointment: 'Appointment',
      payment: 'Payment',
      license: 'License',
      registration: 'Registration',
      document: 'Document',
      system: 'System'
    }
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1)
  }

  const notificationFilters = [
    { key: 'all', label: 'All' },
    { key: 'appointment', label: 'Appointment' },
    { key: 'payment', label: 'Payment' },
    { key: 'registration', label: 'Registration' },
    { key: 'license', label: 'License' },
    { key: 'system', label: 'System' }
  ]

  const filteredNotifications = notifications.filter((notification) => {
    if (notificationFilter === 'all') {
      return true
    }
    return getNotificationCategory(notification) === notificationFilter
  })

  const getNotificationIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'success':
        return <CheckCheck className="h-4 w-4 text-emerald-500" />
      case 'warning':
        return <TriangleAlert className="h-4 w-4 text-amber-500" />
      case 'error':
        return <CircleAlert className="h-4 w-4 text-rose-500" />
      default:
        return <Info className="h-4 w-4 text-sky-500" />
    }
  }

  const formatNotificationTime = (value) => {
    if (!value) {
      return 'Just now'
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return 'Just now'
    }
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleNotificationClick = async (notification) => {
    try {
      if (notification.is_overdue) {
        navigate(`/dashboard/appointments/${notification.appointment_id}/edit`)
        setNotificationMenuOpen(false)
        return
      }
      const isUnread = notification.is_read === 0 || notification.status === 'unread'
      if (notification?.id && isUnread) {
        await api.patch(`/notifications/${notification.id}/read`)
      }
      setNotificationMenuOpen(false)
      if (notification?.id) {
        navigate(`/dashboard/notifications/${notification.id}`)
      }
      loadNotifications()
    } catch {
      setNotificationMenuOpen(false)
      loadNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      await loadNotifications()
    } catch {
      setNotificationError('Unable to mark notifications as read.')
    }
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text-primary">
      <style>{`
        @media print {
          @page {
            margin: 16mm;
            size: auto;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          aside, header, .no-print, .print-hide {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
            padding-top: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            background: white !important;
            color: #111827 !important;
          }
          .print-only {
            display: block !important;
          }
          .print-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            border-radius: 12px !important;
            background: white !important;
          }
          tr {
            page-break-inside: avoid;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="flex min-h-screen">
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`fixed inset-y-0 left-0 z-30 w-[230px] border-r border-white/10 bg-[#0F172A] shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex h-full flex-col px-1.5 py-1">
            <div className="mb-1 flex items-left justify-left px-5">
              <img
                src={dayLogo}
                alt="DLMS Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <nav className="flex-1 space-y-2 overflow-hidden">
              <div>
                <div className="px-3 pb-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/60"></div>
                <div className="space-y-0">
                  {filteredMainNav.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 hover:translate-x-1 ${
                          active
                            ? 'bg-app-primary text-white shadow-md shadow-app-primary/20'
                            : 'text-white/90 hover:bg-white/10 hover:text-white'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                        <span className="flex-1">{item.name}</span>
                        {active && <ChevronRight className="h-3 w-3 text-white/90" />}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="px-3 pb-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/60">Messages</div>
                <div className="space-y-0">
                  <Link
                    to={messagesHref}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 hover:translate-x-1 ${
                      isActive(messagesHref)
                        ? 'bg-app-primary text-white shadow-md shadow-app-primary/20'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Mail className={`h-4 w-4 ${isActive(messagesHref) ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                    <span className="flex-1">Messages</span>
                    {isActive(messagesHref) && <ChevronRight className="h-3 w-3 text-white/90" />}
                  </Link>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/10 p-2.5 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white">Quick insight</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-white/70">Keep the data flowing and review outstanding licenses before expiry.</p>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          <header className="fixed left-0 right-0 top-0 z-20 border-b border-app-border bg-app-surface/95 shadow-app-shadow-sm backdrop-blur-md lg:left-[230px]">
            <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-app-border bg-app-surface p-2 text-app-text-secondary shadow-sm lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <Link to="/dashboard" className="flex shrink-0 items-center gap-2 text-xl font-bold text-app-text-primary">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <span className="hidden sm:inline">DLMS</span>
                </Link>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-secondary/70" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-64 md:w-72 lg:w-80 xl:w-96 2xl:w-[30rem] rounded-full border border-app-border bg-white py-2.5 pl-10 pr-4 text-sm text-app-text-primary shadow-sm outline-none placeholder:text-app-text-secondary/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="hidden items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 sm:flex">
                  <Clock className="h-4 w-4" />
                  <span>{timeLabel}</span>
                </div>
                <div className="hidden items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm sm:flex">
                  <span>{dateLabel}</span>
                </div>

                <div ref={settingsMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setSettingsMenuOpen((current) => !current)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-app-text-secondary transition hover:bg-slate-100 hover:text-app-text-primary border border-app-border"
                    aria-label="Settings"
                    title="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>

                  {settingsMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-80 max-h-[85vh] overflow-hidden rounded-3xl border border-app-border bg-white shadow-app-shadow-lg">
                      <div className="flex max-h-[85vh] flex-col overflow-y-auto p-2">
                        {filteredAdminNav.length > 0 && (
                          <>
                            <div className="px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-text-secondary">Administration</p>
                            </div>
                            <div className="mt-1 space-y-1">
                              {filteredAdminNav.map((item) => {
                                const Icon = item.icon
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSettingsMenuOpen(false)}
                                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-app-text-primary transition hover:bg-app-surface-secondary"
                                  >
                                    <span>{item.name}</span>
                                    <Icon className="h-4 w-4 text-app-text-secondary" />
                                  </Link>
                                )
                              })}
                            </div>
                          </>
                        )}

                        {filteredSystemNav.length > 0 && (
                          <>
                            <div className="mt-4 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-text-secondary">System</p>
                            </div>
                            <div className="mt-1 space-y-1">
                              {filteredSystemNav.map((item) => {
                                const Icon = item.icon
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSettingsMenuOpen(false)}
                                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-app-text-primary transition hover:bg-app-surface-secondary"
                                  >
                                    <span>{item.name}</span>
                                    <Icon className="h-4 w-4 text-app-text-secondary" />
                                  </Link>
                                )
                              })}
                            </div>
                          </>
                        )}

                        {filteredAppearanceNav.length > 0 && (
                          <>
                            <div className="mt-4 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-text-secondary">Appearance</p>
                            </div>
                            <div className="mt-1 space-y-1">
                              {filteredAppearanceNav.map((item) => {
                                const Icon = item.icon
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSettingsMenuOpen(false)}
                                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-app-text-primary transition hover:bg-app-surface-secondary"
                                  >
                                    <span>{item.name}</span>
                                    <Icon className="h-4 w-4 text-app-text-secondary" />
                                  </Link>
                                )
                              })}
                            </div>
                          </>
                        )}

                        {filteredSupportNav.length > 0 && (
                          <>
                            <div className="mt-4 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-text-secondary">Support</p>
                            </div>
                            <div className="mt-1 space-y-1">
                              {filteredSupportNav.map((item) => {
                                const Icon = item.icon
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSettingsMenuOpen(false)}
                                    className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-app-text-primary transition hover:bg-app-surface-secondary"
                                  >
                                    <span>{item.name}</span>
                                    <Icon className="h-4 w-4 text-app-text-secondary" />
                                  </Link>
                                )
                              })}
                            </div>
                          </>
                        )}

                        <div className="mt-4 border-t border-app-border pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsMenuOpen(false)
                              logout()
                            }}
                            className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                          >
                            <span>Logout</span>
                            <LogOut className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div ref={notificationMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationMenuOpen((current) => !current)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-app-text-secondary transition hover:bg-slate-100 hover:text-app-text-primary border border-app-border"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-app-danger px-1 text-[10px] font-bold text-white shadow">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[22rem] overflow-hidden rounded-3xl border border-app-border bg-white shadow-app-shadow-lg">
                      <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-app-text-primary">Notifications</p>
                          <p className="text-xs text-app-text-secondary">Latest account and system updates</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="rounded-full border border-app-border px-3 py-1.5 text-xs font-semibold text-app-text-secondary transition hover:bg-app-surface-secondary"
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="flex gap-2 overflow-x-auto border-b border-app-border px-3 py-3">
                        {notificationFilters.map((filter) => {
                          const active = notificationFilter === filter.key
                          return (
                            <button
                              key={filter.key}
                              type="button"
                              onClick={() => setNotificationFilter(filter.key)}
                              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? 'bg-app-primary text-white shadow-sm' : 'bg-app-surface-secondary text-app-text-secondary hover:bg-app-border'}`}
                            >
                              {filter.label}
                            </button>
                          )
                        })}
                      </div>

                      <div className="max-h-[22rem] overflow-y-auto">
                        {notificationLoading ? (
                          <div className="px-4 py-6 text-sm text-app-text-secondary">Loading notifications...</div>
                        ) : notificationError ? (
                          <div className="px-4 py-6 text-sm text-app-danger">{notificationError}</div>
                        ) : filteredNotifications.length ? (
                          filteredNotifications.map((notification) => (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => handleNotificationClick(notification)}
                              className={`flex w-full items-start gap-3 border-b border-app-border px-4 py-3 text-left transition hover:bg-app-surface-secondary ${(notification.is_read === 0 || notification.status === 'unread') ? 'bg-app-surface-secondary/50' : ''}`}
                            >
                              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-app-surface shadow-sm ring-1 ring-app-border">
                                {getNotificationIcon(notification.category || notification.notification_type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="truncate text-sm font-semibold text-app-text-primary">{notification.title || 'Notification'}</p>
                                  {(notification.is_read === 0 || notification.status === 'unread') && <span className="mt-1 h-2 w-2 rounded-full bg-app-primary" />}
                                </div>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-text-secondary">
                                  {getNotificationCategoryLabel(notification)}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-app-text-secondary">{notification.message || 'No message available.'}</p>
                                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-app-text-secondary">
                                  {formatNotificationTime(notification.created_at)}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-sm text-app-text-secondary">No notifications in this category.</div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => { setNotificationMenuOpen(false); navigate('/dashboard/notifications') }}
                        className="block w-full border-t border-app-border px-4 py-3 text-center text-sm font-semibold text-app-primary transition hover:bg-app-surface-secondary"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>

                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((current) => !current)}
                    className="group inline-flex items-center gap-3 rounded-full border border-app-border bg-white px-2 py-1 pr-3 shadow-sm transition hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-app-primary/10 text-app-primary">
                      {userProfileImage ? (
                        <img src={resolveUserImageSrc(userProfileImage)} alt={user?.full_name || 'User'} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold">{userInitial}</span>
                      )}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-semibold text-app-text-primary">{user?.full_name || 'Profile'}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-app-text-secondary">{roleLabels[user?.role] || 'Account'}</p>
                    </div>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-56 overflow-hidden rounded-3xl border border-app-border bg-white p-2 shadow-app-shadow-lg">
                      <div className="px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-text-secondary">Account</p>
                        <p className="mt-1 text-sm font-semibold text-app-text-primary">{user?.full_name || 'Profile'}</p>
                        <p className="text-xs text-app-text-secondary">{user?.email || 'No email available'}</p>
                      </div>
                      <div className="mt-1 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false)
                            navigate('/dashboard/profile')
                          }}
                          className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-app-text-primary transition hover:bg-app-surface-secondary"
                        >
                          <span>Profile</span>
                          <UserCircle2 className="h-4 w-4 text-app-text-secondary" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false)
                            logout()
                            navigate('/login')
                          }}
                          className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-app-danger transition hover:bg-app-danger/10"
                        >
                          <span>Logout</span>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Exit</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-screen px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:ml-[230px]">
            {activePageTitle !== 'Dashboard' && (
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print-hide">
                <h1 className="text-2xl font-black tracking-tight text-app-text-primary">{activePageTitle}</h1>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-app-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-app-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    {roleLabels[user?.role] || 'User'}
                  </span>
                  <span className="text-sm font-medium text-app-text-secondary">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            )}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
