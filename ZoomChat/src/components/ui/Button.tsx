import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95 touch-manipulation
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-pink-400 to-sky-400 
      hover:from-pink-500 hover:to-sky-500
      text-white shadow-lg hover:shadow-xl
      focus:ring-pink-300
    `,
    secondary: `
      bg-white/70 hover:bg-white/90
      text-gray-800 shadow-md hover:shadow-lg
      border border-white/50
      focus:ring-sky-300
    `,
    outline: `
      border-2 border-pink-300 hover:border-pink-400
      text-pink-600 hover:bg-pink-50
      focus:ring-pink-300
    `,
    ghost: `
      text-gray-700 hover:bg-white/30
      focus:ring-gray-300
    `,
    danger: `
      bg-red-500 hover:bg-red-600
      text-white shadow-md hover:shadow-lg
      focus:ring-red-300
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg min-h-[36px]',
    md: 'px-4 py-2.5 text-base rounded-xl min-h-[44px]',
    lg: 'px-6 py-3 text-lg rounded-xl min-h-[48px]',
    xl: 'px-8 py-4 text-xl rounded-2xl min-h-[56px]',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
