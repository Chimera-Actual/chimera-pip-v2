import React, { memo, Suspense } from 'react';
import { createLazyComponent } from '@/components/performance/LazyComponent';

export interface WidgetGridProps {
  tab: string;
  className?: string;
}

// Lazy load the SimpleWidgetGrid for better initial load performance
const LazySimpleWidgetGrid = createLazyComponent(
  () => import('./SimpleWidgetGrid').then(m => ({ default: m.SimpleWidgetGrid })),
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-pip-bg-secondary/30 rounded-lg" />
    <div className="h-32 bg-pip-bg-secondary/20 rounded-lg" />
  </div>
);

export const LazyWidgetGrid: React.FC<WidgetGridProps> = memo((props) => {
  return <LazySimpleWidgetGrid {...props} />;
});

LazyWidgetGrid.displayName = 'LazyWidgetGrid';