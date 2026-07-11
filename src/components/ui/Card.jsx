const Card = ({ children, className = '', header, footer, padding = 'md' }) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div className={`rounded-xl border border-app-border bg-app-surface shadow-app-shadow ${className}`}>
      {header && <div className="border-b border-app-border px-5 py-4">{header}</div>}
      <div className={paddings[padding]}>{children}</div>
      {footer && <div className="border-t border-app-border px-5 py-4">{footer}</div>}
    </div>
  )
}

export default Card
