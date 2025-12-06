import React from 'react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  children?: React.ReactNode;
  title?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  fixed?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  children,
  title,
  leftContent,
  rightContent,
  className,
  fixed = false,
}) => {
  return (
    <header
      className={cn(
        `w-full bg-white/40 backdrop-blur-xl border-b border-white/30
        shadow-md z-50`,
        fixed && 'fixed top-0 left-0 right-0',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-4">
        {children || (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {leftContent}
              {title && (
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                  {title}
                </h1>
              )}
            </div>
            {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
          </div>
        )}
      </div>
    </header>
  );
};
