import { Tag, DollarSign, Plus, Search, Filter } from 'lucide-react'

const ServiceManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
            <p className="text-sm text-gray-500">Manage service pricing and configuration</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      <div className="card p-12 text-center">
        <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Management</h3>
        <p className="text-gray-500">This page is under development. Coming soon.</p>
      </div>
    </div>
  )
}

export default ServiceManagement
