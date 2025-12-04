import { cn } from '@/lib/utils'

export function Input({ className, type = 'text', error, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-xl glass-strong px-4 py-2 text-sm',
        'border border-white/10 focus:border-primary/50',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        error && 'border-destructive focus:ring-destructive/30',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-xl glass-strong px-4 py-3 text-sm',
        'border border-white/10 focus:border-primary/50',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200 custom-scrollbar',
        error && 'border-destructive focus:ring-destructive/30',
        className
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
}
