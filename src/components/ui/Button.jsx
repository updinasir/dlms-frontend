import { Loader2 } from 'lucide-react'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-app-bg focus:ring-app-primary/50 disabled:opacity-60 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-app-primary text-white shadow-md hover:bg-app-primary-hover',
    secondary:
      'bg-app-surface text-app-text-secondary border border-app-border hover:border-app-primary hover:text-app-primary',
    danger: 'bg-app-danger text-white shadow-md hover:opacity-90',
    ghost: 'text-app-text-secondary hover:bg-app-surface-secondary hover:text-app-text-primary',
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}

export default Button
