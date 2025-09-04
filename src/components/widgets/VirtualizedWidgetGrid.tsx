import React, { useMemo, useCallback, useState, useRef, useLayoutEffect } from 'react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetRenderer } from './WidgetRegistry';
import { BaseWidget } from '@/types/widgets';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { cn } from '@/lib/utils';

interface VirtualizedWidgetGridProps {
  widgets: BaseWidget[];
  onUpdate: (widgetId: string, updates: Partial<BaseWidget>) => void;
  onDelete: (widgetId: string) => void;
  onArchive: (widgetId: string) => void;
  onToggleWidth: (widget: BaseWidget) => void;
  isMobile: boolean;
  height?: number;
  itemHeight?: number;
}

// Simple virtualization without external dependencies
export const VirtualizedWidgetGrid: React.FC<VirtualizedWidgetGridProps> = ({
  widgets,
  onUpdate,
  onDelete,
  onArchive,
  onToggleWidth,
  isMobile,
  height = 600,
  itemHeight = 280,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Performance monitoring
  const { markRenderStart, markRenderEnd, trackMemoryUsage } = usePerformanceMonitor('VirtualizedWidgetGrid');
  
  // Track render performance
  useLayoutEffect(() => {
    markRenderStart();
    return markRenderEnd;
  });

  // Track memory usage for large collections
  useLayoutEffect(() => {
    if (widgets.length > 50) {
      trackMemoryUsage();
    }
  }, [widgets.length, trackMemoryUsage]);

  // Calculate visible items
  const itemsPerRow = isMobile ? 1 : 2;
  const rowCount = Math.ceil(widgets.length / itemsPerRow);
  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(height / itemHeight) + 2, // 2 for buffer
    rowCount
  );

  // Get visible widgets
  const visibleWidgets = useMemo(() => {
    const start = visibleStartIndex * itemsPerRow;
    const end = Math.min(visibleEndIndex * itemsPerRow, widgets.length);
    return widgets.slice(start, end);
  }, [widgets, visibleStartIndex, visibleEndIndex, itemsPerRow]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    
    // Log scroll performance for very large collections
    if (widgets.length > 100) {
      console.debug(`Virtualized scroll position: ${scrollTop}`);
    }
  }, [widgets.length]);

  // Don't virtualize small collections (overhead not worth it)
  if (widgets.length <= 15) {
    return (
      <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              widget.widgetWidth === 'full' && !isMobile ? 'col-span-2' : 'col-span-1'
            )}
          >
            <WidgetContainer
              widgetId={widget.id}
              widgetType={widget.type}
              title={widget.title}
              collapsed={widget.collapsed}
              onToggleCollapse={() => onUpdate(widget.id, { collapsed: !widget.collapsed })}
              onSettingsChange={(settings) => onUpdate(widget.id, { settings })}
              onDelete={() => onDelete(widget.id)}
              onArchive={() => onArchive(widget.id)}
            >
              <WidgetRenderer widget={widget} />
            </WidgetContainer>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="virtualized-widget-grid">
      <div className="mb-4 text-xs text-pip-text-muted font-pip-mono">
        Displaying {widgets.length} widgets (virtualized for performance)
      </div>
      
      <div
        ref={containerRef}
        className="pip-scrollbar overflow-y-auto"
        style={{ height }}
        onScroll={handleScroll}
      >
        {/* Virtual spacer for scrolled content above */}
        <div style={{ height: visibleStartIndex * itemHeight }} />
        
        {/* Visible widgets */}
        <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
          {visibleWidgets.map((widget) => (
            <div
              key={widget.id}
              className={cn(
                widget.widgetWidth === 'full' && !isMobile ? 'col-span-2' : 'col-span-1'
              )}
              style={{ minHeight: itemHeight }}
            >
              <WidgetContainer
                widgetId={widget.id}
                widgetType={widget.type}
                title={widget.title}
                collapsed={widget.collapsed}
                onToggleCollapse={() => onUpdate(widget.id, { collapsed: !widget.collapsed })}
                onSettingsChange={(settings) => onUpdate(widget.id, { settings })}
                onDelete={() => onDelete(widget.id)}
                onArchive={() => onArchive(widget.id)}
              >
                <WidgetRenderer widget={widget} />
              </WidgetContainer>
            </div>
          ))}
        </div>
        
        {/* Virtual spacer for content below */}
        <div style={{ height: (rowCount - visibleEndIndex) * itemHeight }} />
      </div>
    </div>
  );
};

// Hook to determine when to use virtualization
export const useVirtualization = (itemCount: number, threshold: number = 15) => {
  return useMemo(() => ({
    shouldVirtualize: itemCount > threshold,
    itemCount,
    threshold
  }), [itemCount, threshold]);
};