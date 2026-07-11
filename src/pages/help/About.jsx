import { Building2, Info, Code, Users, Shield, Zap, Globe, Heart, ExternalLink, CheckCircle2 } from 'lucide-react'

const About = () => {
  const features = [
    { icon: Shield, title: 'Secure', description: 'Enterprise-grade security with encryption and access controls' },
    { icon: Zap, title: 'Fast', description: 'Optimized performance for quick data processing' },
    { icon: Globe, title: 'Scalable', description: 'Built to handle thousands of users and records' },
    { icon: Users, title: 'User-Friendly', description: 'Intuitive interface designed for all user types' },
  ]

  const team = [
    { name: 'Development Team', role: 'Full-stack development' },
    { name: 'Design Team', role: 'UI/UX design' },
    { name: 'QA Team', role: 'Quality assurance' },
    { name: 'Support Team', role: 'Customer support' },
  ]

  const techStack = [
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'Vite', category: 'Build Tool' },
    { name: 'Lucide', category: 'Icons' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About DLMS</h1>
          <p className="text-sm text-gray-500">Driving License Management System</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <Building2 className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Driving License Management System</h2>
        <p className="mt-2 text-lg text-gray-600">
          A comprehensive solution for managing driver licenses, examinations, and appointments
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Version 1.0.0
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
            <Code className="h-3.5 w-3.5" />
            Production Ready
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Key Features</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mission */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Our Mission</h3>
        <p className="text-gray-600 leading-relaxed">
          DLMS is designed to streamline the management of driving licenses, making it easier for government agencies, 
          driving schools, and examination centers to handle the entire lifecycle of driver licensing. From registration 
          to examination scheduling, license issuance, and renewal, our system provides a comprehensive solution that 
          improves efficiency, reduces paperwork, and ensures compliance with regulatory requirements.
        </p>
      </div>

      {/* Tech Stack */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Technology Stack</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((tech) => (
            <div key={tech.name} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Code className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Our Team</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-6 text-center">
          <p className="text-3xl font-bold text-primary-600">1000+</p>
          <p className="mt-1 text-sm text-gray-600">Active Users</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-3xl font-bold text-primary-600">5000+</p>
          <p className="mt-1 text-sm text-gray-600">Licenses Issued</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-3xl font-bold text-primary-600">99.9%</p>
          <p className="mt-1 text-sm text-gray-600">Uptime</p>
        </div>
      </div>

      {/* Links */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Resources</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <a href="#" className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
              <Code className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Source Code</p>
              <p className="text-xs text-gray-500">View on GitHub</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Info className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Documentation</p>
              <p className="text-xs text-gray-500">Read the docs</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          <p className="text-sm text-gray-600">
            Built with care by the DLMS Team © 2024
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
