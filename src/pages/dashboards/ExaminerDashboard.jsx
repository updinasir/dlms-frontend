import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'
import { ClipboardCheck, Calendar, Users, TrendingUp, ChevronRight, FileText, Car, Award, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts'

const ExaminerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalExams: 0,
    scheduledToday: 0,
    passRate: 0,
    pendingResults: 0
  })
  const [recentExams, setRecentExams] = useState([])
  const [examStats, setExamStats] = useState({ total: 0, passed: 0, failed: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, examsRes] = await Promise.all([
        api.get('/exams/stats/overview'),
        api.get('/exams?limit=5')
      ])
      const s = statsRes.data.statistics || {}
      setExamStats(s)
      setStats({
        totalExams: s.total || 0,
        scheduledToday: s.pending || 0,
        passRate: s.total ? Math.round((s.passed / s.total) * 100) : 0,
        pendingResults: s.pending || 0
      })
      setRecentExams(examsRes.data.exams || [])
    } catch (error) {
      console.error('Error fetching examiner data:', error)
    } finally {
      setLoading(false)
    }
  }

  const resultPie = [
    { name: 'Passed', value: examStats.passed || 0, color: '#10b981' },
    { name: 'Failed', value: examStats.failed || 0, color: '#f43f5e' },
    { name: 'Pending', value: examStats.pending || 0, color: '#f59e0b' }
  ].filter((i) => i.value > 0)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'Examiner'

  const colorStyles = {
    violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  }

  const statCards = [
    { title: 'Total Exams', value: stats.totalExams, icon: ClipboardCheck, color: 'violet', href: '/dashboard/exams' },
    { title: 'Pass Rate', value: `${stats.passRate}%`, icon: TrendingUp, color: 'emerald', href: '/dashboard/exams' },
    { title: 'Pending Results', value: stats.pendingResults, icon: FileText, color: 'amber', href: '/dashboard/exams' },
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
          <p className="mt-1 text-sm text-slate-500">Manage driving tests and track candidate performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            Examiner
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
              <h3 className="text-lg font-bold text-slate-900">Exam Results Breakdown</h3>
              <p className="mt-1 text-sm text-slate-500">Practical and theory test outcomes.</p>
            </div>
          </div>
          <div className="flex h-[280px] items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={resultPie} innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                  {resultPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid rgba(226,232,240,.9)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute text-center">
              <p className="text-sm font-semibold text-slate-500">Total</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{examStats.total}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            {resultPie.map((r) => (
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
              <h3 className="text-lg font-bold text-slate-900">Recent Exams</h3>
              <p className="mt-1 text-sm text-slate-500">Latest scheduled and completed tests.</p>
            </div>
            <Link to="/dashboard/exams" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentExams.length === 0 && !loading && (
              <p className="text-sm text-slate-400">No recent exams found.</p>
            )}
            {recentExams.map((exam) => (
              <div key={exam.exam_uid} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${exam.result === 'Pass' ? 'bg-emerald-50 text-emerald-600' : exam.result === 'Fail' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{exam.first_name} {exam.last_name}</p>
                    <p className="text-xs text-slate-500">{exam.exam_type} &middot; {formatDate(exam.exam_date)}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  exam.result === 'Pass' ? 'bg-emerald-50 text-emerald-700' :
                  exam.result === 'Fail' ? 'bg-rose-50 text-rose-700' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {exam.result || 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-slate-500">Common examiner tasks.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: 'Schedule New Exam', icon: Calendar, href: '/dashboard/exams/new', desc: 'Book a test slot' },
            { title: 'View All Exams', icon: ClipboardCheck, href: '/dashboard/exams', desc: 'Manage schedule' },
            { title: 'Search Drivers', icon: Car, href: '/dashboard/drivers', desc: 'Find candidates' },
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} to={action.href} className="group card p-5 transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-600/10">
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

export default ExaminerDashboard


