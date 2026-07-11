/**
 * Resolve an upload path into a full URL using the configured API server.
 * Falls back to the current origin for relative API bases.
 */
export const resolveUploadSrc = (value) => {
  if (!value || typeof value !== 'string' || value === '[object Object]') return ''
  if (value.startsWith('blob:') || value.startsWith('http')) return value

  const apiBase = import.meta.env.VITE_API_URL || '/api'
  const serverBase = apiBase.endsWith('/api')
    ? (apiBase.startsWith('http') ? apiBase.slice(0, -4) : window.location.origin)
    : apiBase

  return value.startsWith('/') ? `${serverBase}${value}` : `${serverBase}/${value}`
}
