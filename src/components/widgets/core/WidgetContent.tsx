// Widget Content Component - Decomposed from WidgetContainer
import React from 'react';
import { cn } from '@/lib/utils';

interface WidgetContentProps {
  collapsed: boolean;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
}

export const WidgetContent: React.FC<WidgetContentProps> = ({
  collapsed,
  error,
  className = '',
  children,
}) => {
  return (
    <div className={cn(
      'widget-content transition-all duration-200 overflow-hidden pip-scrollbar',
      collapsed ? 'h-0 p-0' : 'p-2 h-auto max-h-96 overflow-y-auto',
      className
    )}>
      {!collapsed && (
        <>
          {error && (
            <div className="mb-3 p-2 rounded border border-destructive/30 bg-destructive/10 text-destructive text-xs font-pip-mono">
              {error}
            </div>
          )}
          {children}
        </>
      )}
    </div>
  );
};