import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  position?: 'left' | 'right';
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  isOpen,
  onClose,
  position = 'left',
  className,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          `fixed top-0 ${position}-0 h-full w-64 md:w-72
          bg-white/40 backdrop-blur-xl border-${position === 'left' ? 'r' : 'l'} border-white/30
          shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto custom-scrollbar`,
          isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto',
          className
        )}
      >
        {children}
      </aside>
    </>
  );
};
