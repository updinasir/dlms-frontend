const Select = ({ label, error, helper, options = [], className = '', ...props }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-app-text-primary">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl border border-app-border bg-app-surface px-4 py-3 text-sm text-app-text-primary shadow-sm outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20 ${
          error ? 'border-app-danger focus:border-app-danger focus:ring-app-danger/20' : ''
        }`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-app-danger">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-xs text-app-text-secondary">{helper}</p>}
    </div>
  )
}

export default Select
