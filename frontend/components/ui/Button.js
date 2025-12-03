import { cn } from '@/lib/utils'

export function Button({ 
  children, 
  className, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ripple active:scale-95'
  
  const variants = {
    default: 'bg-primary text-primary-foreground shadow-lg hover:shadow-neon hover:bg-primary-600',
    outline: 'border-2 border-white/20 bg-transparent hover:bg-white/5 hover:border-white/40',
    ghost: 'hover:bg-white/10',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success: 'bg-success text-success-foreground hover:bg-success/90',
    glass: 'glass-strong hover:bg-white/15',
  }
  
  const sizes = {
    default: 'h-11 px-6 py-2',
    sm: 'h-9 px-4 text-sm',
    lg: 'h-14 px-8 text-lg',
    icon: 'h-10 w-10',
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
