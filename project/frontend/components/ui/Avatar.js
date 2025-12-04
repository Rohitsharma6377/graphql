'use client'

import { cn } from '@/lib/utils'

export function Avatar({ src, alt, size = 'default', status, className, fallback }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    default: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }

  const statusColors = {
    online: 'bg-success ring-success/30',
    offline: 'bg-muted-foreground/50 ring-muted-foreground/20',
    busy: 'bg-destructive ring-destructive/30',
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden ring-4 ring-background transition-all duration-300',
          sizes[size]
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full glass-strong flex items-center justify-center font-semibold gradient-text">
            {fallback || alt?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-background',
            statusColors[status]
          )}
        />
      )}
    </div>
  )
}
