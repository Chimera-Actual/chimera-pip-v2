import React, { Suspense, memo } from 'react';
import { SimpleWidgetGrid } from './SimpleWidgetGrid';

export interface WidgetGridProps {
  tab: string;
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = memo(({ tab, className }) => {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-pip-bg-secondary/30 rounded-lg" />
        <div className="h-32 bg-pip-bg-secondary/20 rounded-lg" />
      </div>
    }>
      <SimpleWidgetGrid tab={tab} className={className} />
    </Suspense>
  );
});

WidgetGrid.displayName = 'WidgetGrid';

// Note: Moved CSS to index.css for better performance and maintainability
