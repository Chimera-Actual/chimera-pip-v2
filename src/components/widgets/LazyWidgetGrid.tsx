import React, { memo, Suspense, lazy } from 'react';

export interface WidgetGridProps {
  tab: string;
  className?: string;
}

// Lazy load the SimpleWidgetGrid for better initial load performance
const LazySimpleWidgetGrid = lazy(() => 
  import('./SimpleWidgetGrid').then(m => ({ default: m.SimpleWidgetGrid }))
);

export const LazyWidgetGrid: React.FC<WidgetGridProps> = memo((props) => {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-pip-bg-secondary/30 rounded-lg" />
        <div className="h-32 bg-pip-bg-secondary/20 rounded-lg" />
      </div>
    }>
      <LazySimpleWidgetGrid {...props} />
    </Suspense>
  );
});

LazyWidgetGrid.displayName = 'LazyWidgetGrid';