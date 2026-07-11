// Shared helpers for the notification UI

export const relativeTime = (value) => {
  if (!value) return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 45) return 'just now'
  if (seconds < 90) return 'a minute ago'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

export const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString([], {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Tailwind style tokens per notification category (type)
export const categoryStyles = {
  Information: { text: 'text-sky-700', bg: 'bg-sky-50', ring: 'ring-sky-200', dot: 'bg-sky-500' },
  Success: { text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  Warning: { text: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  Error: { text: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-200', dot: 'bg-rose-500' }
}

export const priorityStyles = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-sky-100 text-sky-700',
  High: 'bg-amber-100 text-amber-700',
  Critical: 'bg-rose-100 text-rose-700'
}

export const CATEGORIES = ['Information', 'Success', 'Warning', 'Error']
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
export const STATUSES = ['Pending', 'Sent', 'Failed', 'Read']
