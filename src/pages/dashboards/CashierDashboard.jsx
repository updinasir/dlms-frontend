import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'
import { Wallet, Clock, CreditCard, TrendingUp, DollarSign, FileText, BarChart3, ChevronRight, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts'

const CashierDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    todayRevenue: 0,
    pendingPayments: 0,
    totalTransactions: 0,
    totalRevenue: 0
  })
  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [paymentsRes, statsRes, revenueRes] = await Promise.all([
        api.get('/payments?limit=6'),
        api.get('/payments/stats/overview').catch(() => ({ data: { statistics: {} } })),
        api.get('/payments/stats/revenue').catch(() => ({ data: { total_revenue: 0 } }))
      ])
      const pData = paymentsRes.data.payments || []
      setRecentPayments(pData)
      const s = statsRes.data.statistics || {}
      setStats({
        todayRevenue: s.today_revenue || 0,
        pendingPayments: s.pending || 0,
        completedPayments: s.completed || 0,
        totalTransactions: s.total_transactions || 0,
        totalRevenue: s.revenue || revenueRes.data.revenue || 0
      })
    } catch (error) {
      console.error('Error fetching cashier data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusPie = [
    { name: 'Completed', value: stats.completedPayments || 0, color: '#10b981' },
    { name: 'Pending', value: stats.pendingPayments || 0, color: '#f59e0b' }
  ].filter((i) => i.value > 0)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'Cashier'

  const colorStyles = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  }

  const statCards = [
    { title: "Today's Revenue", value: `$${(stats.todayRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'emerald', href: '/dashboard/payments' },
    { title: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toLocaleString()}`, icon: Wallet, color: 'violet', href: '/dashboard/payments' },
    { title: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'amber', href: '/dashboard/payments' },
  ]

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{greeting}, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">Track payments, revenue, and pending transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            Cashier
          </span>
          <span className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const style = colorStyles[stat.color]
          return (
            <Link key={stat.title} to={stat.href} className="card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-black tracking-tight text-slate-900">{loading ? '...' : stat.value}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{stat.title}</p>
                </div>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${style.bg} ${style.text}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Status</h3>
              <p className="mt-1 text-sm text-slate-500">Completed vs pending transactions.</p>
            </div>
          </div>
          <div className="flex h-[260px] items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                  {statusPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid rgba(226,232,240,.9)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute text-center">
              <p className="text-sm font-semibold text-slate-500">Transactions</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalTransactions}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            {statusPie.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-sm text-slate-600">{r.name}: <strong>{r.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Payments</h3>
              <p className="mt-1 text-sm text-slate-500">Latest transactions processed.</p>
            </div>
            <Link to="/dashboard/payments" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentPayments.length === 0 && !loading && (
              <p className="text-sm text-slate-400">No payments recorded.</p>
            )}
            {recentPayments.map((p) => (
              <div key={p.payment_id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.payment_status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.payment_type}</p>
                    <p className="text-xs text-slate-500">{p.payment_method} &middot; {formatDate(p.payment_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${Number(p.amount || 0).toLocaleString()}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.payment_status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {p.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-slate-500">Common cashier tasks.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: 'Record Payment', icon: DollarSign, href: '/dashboard/payments/new', desc: 'Process a transaction' },
            { title: 'View Payments', icon: FileText, href: '/dashboard/payments', desc: 'All transactions' },
            { title: 'View Reports', icon: BarChart3, href: '/dashboard/reports', desc: 'Revenue summaries' },
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} to={action.href} className="card p-5 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-600/10">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition group-hover:bg-primary-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-900">{action.title}</p>
                <p className="mt-1 text-xs text-slate-500">{action.desc}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CashierDashboard

