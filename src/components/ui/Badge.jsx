const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-app-surface-secondary text-app-text-secondary',
    success: 'bg-app-success/10 text-app-success',
    warning: 'bg-app-warning/10 text-app-warning',
    danger: 'bg-app-danger/10 text-app-danger',
    info: 'bg-app-primary/10 text-app-primary',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
