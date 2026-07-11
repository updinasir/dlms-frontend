import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'

const Alert = ({ children, variant = 'info', title, className = '' }) => {
  const styles = {
    info: 'bg-app-primary/10 border-app-primary/20 text-app-primary',
    success: 'bg-app-success/10 border-app-success/20 text-app-success',
    warning: 'bg-app-warning/10 border-app-warning/20 text-app-warning',
    danger: 'bg-app-danger/10 border-app-danger/20 text-app-danger',
  }

  const icons = {
    info: <Info className="h-5 w-5" />,
    success: <CheckCircle2 className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    danger: <XCircle className="h-5 w-5" />,
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${styles[variant]} ${className}`}>
      <div className="mt-0.5 shrink-0">{icons[variant]}</div>
      <div className="flex-1">
        {title && <h4 className="text-sm font-semibold">{title}</h4>}
        <div className={`text-sm ${title ? 'mt-1' : ''}`}>{children}</div>
      </div>
    </div>
  )
}

export default Alert
