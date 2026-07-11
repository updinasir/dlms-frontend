import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { FileText, Upload, Search, Trash2, Download, Eye, X, FilePlus, Filter, ChevronRight, Loader2, Brain } from 'lucide-react'

const DocumentList = () => {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [previewDoc, setPreviewDoc] = useState(null)
  const fileInputRef = useRef(null)

  const [uploadForm, setUploadForm] = useState({
    driver_id: '',
    document_type: 'National ID',
    file: null
  })

  const documentTypes = ['National ID', 'Passport', 'Medical Certificate', 'Photo']

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (typeFilter) params.append('type', typeFilter)
      params.append('page', page)
      params.append('limit', 10)

      const res = await api.get(`/documents?${params}`)
      setDocuments(res.data.documents || [])
      setPagination(res.data.pagination || {})
    } catch {
      toast.error('Error fetching documents')
    } finally {
      setLoading(false)
    }
  }

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers?limit=100')
      setDrivers(res.data.drivers || [])
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [searchTerm, typeFilter, page])

  useEffect(() => {
    if (showUpload) fetchDrivers()
  }, [showUpload])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be under 5MB')
        return
      }
      setUploadForm({ ...uploadForm, file })
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.driver_id) {
      toast.error('Please select a file and a driver')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('driver_id', uploadForm.driver_id)
      formData.append('document_type', uploadForm.document_type)

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Document uploaded successfully')
      setShowUpload(false)
      setUploadForm({ driver_id: '', document_type: 'National ID', file: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchDocuments()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Upload failed'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document deleted')
      fetchDocuments()
    } catch {
      toast.error('Error deleting document')
    }
  }

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await api.get(`/documents/${docId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName || `document-${docId}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  const getFileName = (filePath) => {
    if (!filePath) return 'Unknown file'
    return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
  }

  const getFileIcon = (type) => {
    const colorMap = {
      'National ID': 'bg-blue-100 text-blue-700',
      'Passport': 'bg-emerald-100 text-emerald-700',
      'Medical Certificate': 'bg-rose-100 text-rose-700',
      'Photo': 'bg-pink-100 text-pink-700'
    }
    return colorMap[type] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <button
          onClick={() => setShowUpload(true)}
          className="btn btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto"
        >
          <FilePlus className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by type or driver..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none transition"
          />
        </div>
        <div className="relative sm:w-48">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-slate-400 focus:outline-none transition"
          >
            <option value="">All Types</option>
            {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Documents Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-4">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No documents found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-xs">Upload documents using the button above to get started.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Document</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Type</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Driver</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-600">Uploaded</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc.document_id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${getFileIcon(doc.document_type)}`}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{getFileName(doc.file_path)}</p>
                            <p className="text-xs text-slate-400">ID: {doc.document_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${getFileIcon(doc.document_type)}`}>
                          {doc.document_type || 'National ID'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {doc.first_name || doc.last_name
                          ? `${doc.first_name || ''} ${doc.last_name || ''}`.trim()
                          : <span className="text-slate-400">Driver #{doc.driver_id}</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate('/dashboard/ai/detection', { state: { documentId: doc.document_id } })}
                            className="rounded-lg p-1.5 text-violet-400 hover:bg-violet-50 hover:text-violet-600 transition"
                            title="Analyze with AI"
                          >
                            <Brain className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.document_id, getFileName(doc.file_path))}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.document_id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
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

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page >= pagination.pages}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Upload Document</h3>
              <button onClick={() => setShowUpload(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Driver</label>
                <select
                  value={uploadForm.driver_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, driver_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                >
                  <option value="">Select driver</option>
                  {drivers.map((d) => (
                    <option key={d.driver_id} value={d.driver_id}>
                      {d.first_name} {d.last_name} â€” {d.national_id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Document Type</label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                >
                  {documentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">File</label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                    onChange={handleFileSelect}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">Max 5MB. Images, PDFs, and Word documents.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setShowUpload(false); setUploadForm({ driver_id: '', document_type: 'National ID', file: null }) }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Document Details</h3>
              <button onClick={() => setPreviewDoc(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${getFileIcon(previewDoc.document_type)}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{getFileName(previewDoc.file_path)}</p>
                  <p className="text-xs text-slate-500">{previewDoc.document_type || 'National ID'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Document ID</p>
                  <p className="font-medium text-slate-900">{previewDoc.document_id}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Driver ID</p>
                  <p className="font-medium text-slate-900">{previewDoc.driver_id}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Uploaded</p>
                  <p className="font-medium text-slate-900">{previewDoc.uploaded_at ? new Date(previewDoc.uploaded_at).toLocaleString() : '-'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">File Path</p>
                  <p className="font-medium text-slate-900 truncate">{previewDoc.file_path}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleDownload(previewDoc.document_id, getFileName(previewDoc.file_path))}
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition text-center"
                >
                  Download File
                </button>
                <button
                  onClick={() => { setPreviewDoc(null) }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentList

