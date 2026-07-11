const Input = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className = '',
  inputClassName = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-app-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full rounded-xl border border-app-border bg-app-surface px-4 py-3 text-sm text-app-text-primary shadow-sm outline-none transition placeholder:text-app-text-secondary/60 focus:border-app-primary focus:ring-2 focus:ring-app-primary/20 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-app-danger focus:border-app-danger focus:ring-app-danger/20' : ''} ${inputClassName}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-secondary">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-app-danger">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-xs text-app-text-secondary">{helper}</p>}
    </div>
  )
}

export default Input
