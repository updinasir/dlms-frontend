import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, X, Save, AlertTriangle, BadgeCheck } from 'lucide-react'

const LicenseCategoryManagement = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    category_code: '',
    category_name: '',
    description: ''
  })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await api.get('/licenses/license-categories')
      setCategories(response.data.categories || [])
    } catch (error) {
      toast.error('Error fetching license categories')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({ category_code: '', category_name: '', description: '' })
    setShowModal(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      category_code: category.category_code,
      category_name: category.category_name,
      description: category.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = (category) => {
    setDeleteConfirm(category)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    
    try {
      await api.delete(`/licenses/license-categories/${deleteConfirm.category_id}`)
      toast.success('License category deleted successfully')
      setDeleteConfirm(null)
      fetchCategories()
    } catch (error) {
      const message = error.response?.data?.message || 'Error deleting category'
      toast.error(message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.category_code || !formData.category_name) {
      toast.error('Category code and name are required')
      return
    }

    try {
      if (editingCategory) {
        await api.put(`/licenses/license-categories/${editingCategory.category_id}`, formData)
        toast.success('License category updated successfully')
      } else {
        await api.post('/licenses/license-categories', formData)
        toast.success('License category created successfully')
      }
      setShowModal(false)
      fetchCategories()
    } catch (error) {
      const message = error.response?.data?.message || 'Error saving category'
      toast.error(message)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Categories</h1>
          <p className="text-gray-600 mt-1">Manage driving license categories and types</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <BadgeCheck className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">No license categories found</p>
            <button onClick={handleAdd} className="mt-4 btn btn-secondary">
              Add First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.category_id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        {category.category_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{category.category_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{category.description || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category Code</label>
                <input
                  name="category_code"
                  value={formData.category_code}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., A, B, C"
                  required
                  maxLength={10}
                />
                <p className="mt-1 text-xs text-gray-500">Single letter or short code (e.g., A, B, C, G)</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Motorcycle, Private Car"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  rows={3}
                  placeholder="Brief description of this license category"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Vehicle Types</label>
                <input
                  name="vehicle_types"
                  value={formData.vehicle_types}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Motorcycles up to 125cc"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="mb-2 text-center text-xl font-bold text-gray-900">Delete Category</h2>
            <p className="mb-6 text-center text-gray-600">
              Are you sure you want to delete the category <strong>{deleteConfirm.category_name}</strong> ({deleteConfirm.category_code})?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-danger flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LicenseCategoryManagement
