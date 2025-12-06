import React from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  subtitle,
  icon,
  className,
}) => {
  return (
    <div className={cn('mb-4 md:mb-6', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-pink-500 text-2xl md:text-3xl">{icon}</div>
        )}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
          {children}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-2 text-sm md:text-base text-gray-600">{subtitle}</p>
      )}
    </div>
  );
};
