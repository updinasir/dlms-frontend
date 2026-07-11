import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  Brain, CheckCircle, XCircle, AlertTriangle, Search, FileText,
  ShieldCheck, ShieldAlert, Loader2, Info, FileCheck, ListChecks
} from 'lucide-react'

const AIDetection = () => {
  const location = useLocation()
  const passedDocumentId = location.state?.documentId || ''

  const [documentId, setDocumentId] = useState(String(passedDocumentId))
  const [documentInfo, setDocumentInfo] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Auto-analyze if document ID was passed from Documents page
  useEffect(() => {
    if (passedDocumentId) {
      fetchDocumentInfo(passedDocumentId)
    }
    fetchLogs()
  }, [passedDocumentId])

  const fetchDocumentInfo = async (id) => {
    try {
      const res = await api.get(`/documents/${id}`)
      setDocumentInfo(res.data.document)
    } catch {
      setDocumentInfo(null)
    }
  }

  const handleDetect = async (e) => {
    e.preventDefault()
    const id = documentId.trim()
    if (!id) {
      toast.error('Please enter a document ID')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      // First verify the document exists
      const docRes = await api.get(`/documents/${id}`)
      setDocumentInfo(docRes.data.document)

      // Then run document forensic analysis
      const response = await api.post(`/ai/detect-fake/${id}`)
      setResult(response.data.result)
      toast.success('Forensic analysis complete')
      fetchLogs()
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) {
        toast.error('Document not found. Please check the ID.')
      } else {
        toast.error(err?.response?.data?.message || 'Analysis failed')
      }
      setDocumentInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const response = await api.get('/ai/detection-logs')
      // Parse the result JSON from logs
      const parsedLogs = (response.data.logs || []).map((log) => {
        try {
          return { ...log, parsedResult: JSON.parse(log.result) }
        } catch {
          return log
        }
      })
      setLogs(parsedLogs)
    } catch {
      toast.error('Error fetching detection logs')
    } finally {
      setLogsLoading(false)
    }
  }

  const getVerdictColor = (isFake) => {
    return isFake
      ? 'border-rose-200 bg-rose-50'
      : 'border-emerald-200 bg-emerald-50'
  }

  const getVerdictIcon = (isFake) => {
    return isFake
      ? <ShieldAlert className="w-8 h-8 text-rose-600" />
      : <ShieldCheck className="w-8 h-8 text-emerald-600" />
  }

  const confidenceBar = (value) => {
    const pct = Math.round(value)
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Confidence</span>
          <span className="font-bold text-slate-900">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  const checkItem = (label, value, passValues) => {
    const passed = passValues.includes(value)
    return (
      <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <span className="text-sm text-slate-600">{label}</span>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-1 ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {value}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Document Forensics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Verify document authenticity using file forensics â€” checks file headers, structure integrity, entropy, and metadata consistency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel â€” Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document input */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-violet-600" />
              Analyze Document
            </h2>
            <form onSubmit={handleDetect} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Document ID</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                    placeholder="Enter document ID (e.g., 1)"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Analyze
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Tip: Go to <strong>Documents</strong> page and click the <Brain className="inline w-3 h-3 text-violet-500" /> icon on any document to analyze it.
                </p>
              </div>
            </form>

            {/* Document info card */}
            {documentInfo && (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Document #{documentInfo.document_id} â€” {documentInfo.document_type || 'General'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Driver #{documentInfo.driver_id} â€¢ Uploaded {documentInfo.uploaded_at ? new Date(documentInfo.uploaded_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            )}

            {/* Result card */}
            {result && (
              <div className={`mt-6 rounded-2xl border-2 p-6 ${getVerdictColor(result.is_fake)}`}>
                {/* Verdict header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    {getVerdictIcon(result.is_fake)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {result.is_fake ? 'Suspicious Document Detected' : 'Document Verified Authentic'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {result.is_fake
                        ? 'Our AI detected inconsistencies that suggest this document may be forged or tampered with.'
                        : 'All forensic checks passed. The document shows no signs of tampering or forgery.'}
                    </p>
                  </div>
                </div>

                {/* Confidence bar */}
                {confidenceBar(result.confidence)}

                {/* Deductions â€” why the score is what it is */}
                {result.deductions && result.deductions.length > 0 && (
                  <div className="mt-4 rounded-xl bg-white/70 border border-slate-200/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Score Deductions</span>
                    </div>
                    <div className="space-y-2">
                      {result.deductions.map((d, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-amber-50/50 border border-amber-100 px-3 py-2">
                          <span className="text-sm text-slate-700">{d.reason}</span>
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">-{d.points}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between">
                      <span className="text-xs text-slate-500">Total deductions</span>
                      <span className="text-xs font-bold text-slate-900">-{result.deductions.reduce((s, d) => s + d.points, 0)}%</span>
                    </div>
                  </div>
                )}

                {/* What does this mean */}
                <div className="mt-4 rounded-xl bg-white/70 border border-slate-200/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">What this means</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>Confidence {result.confidence}%</strong> means the AI is {result.confidence >= 90 ? 'highly certain' : result.confidence >= 70 ? 'moderately confident' : 'uncertain'} about this result.
                    The checks below compare the document against known authentic templates.
                    A <strong>100% correct</strong> result means all forensic markers matched the expected patterns for a genuine document.
                  </p>
                </div>

                {/* Analysis checks */}
                <div className="mt-4 rounded-xl bg-white/70 border border-slate-200/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Forensic Checks</span>
                  </div>
                  <div>
                    {checkItem('Watermark Verification', result.analysis_details.watermark_check, ['passed'])}
                    {checkItem('Signature Authenticity', result.analysis_details.signature_check, ['valid'])}
                    {checkItem('Font Consistency', result.analysis_details.font_analysis, ['consistent'])}
                    {checkItem('Paper Texture Analysis', result.analysis_details.paper_texture, ['normal'])}
                  </div>
                </div>

                {/* Risk badge */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-slate-500">Risk Level:</span>
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                    result.risk_level === 'high' ? 'bg-rose-100 text-rose-700' :
                    result.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {result.risk_level === 'high' && <AlertTriangle className="w-3 h-3" />}
                    {result.risk_level === 'low' && <FileCheck className="w-3 h-3" />}
                    {result.risk_level}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel â€” Logs */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Detection History
          </h2>
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No analysis history yet.</p>
              <p className="text-xs text-slate-300 mt-1">Run your first check to see results here.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {logs.map((log) => {
                const r = log.parsedResult || {}
                return (
                  <div
                    key={log.log_id || log.id}
                    className={`rounded-xl border p-3 ${r.is_fake ? 'border-rose-100 bg-rose-50/50' : 'border-emerald-100 bg-emerald-50/50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">Doc #{r.document_id || log.driver_id || '?'}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${r.is_fake ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {r.is_fake ? 'Fake' : 'Authentic'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Confidence: <span className="font-semibold text-slate-700">{r.confidence || 0}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIDetection


