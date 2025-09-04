import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedWidgetPlaceholderProps {
  index: number;
  widgetWidth: 'half' | 'full';
  isMobile: boolean;
}

export const OptimizedWidgetPlaceholder: React.FC<OptimizedWidgetPlaceholderProps> = memo(({
  index,
  widgetWidth,
  isMobile
}) => {
  return (
    <div
      className={cn(
        'bg-pip-bg-secondary/30 border border-pip-border/20 rounded-lg flex items-center justify-center',
        widgetWidth === 'full' && !isMobile ? 'col-span-2' : 'col-span-1'
      )}
      style={{ minHeight: '200px' }}
    >
      <span className="text-xs text-pip-text-muted font-pip-mono">
        Widget #{index + 1} (Optimized Loading)
      </span>
    </div>
  );
});

OptimizedWidgetPlaceholder.displayName = 'OptimizedWidgetPlaceholder';