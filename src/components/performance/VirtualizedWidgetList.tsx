import { useRef, useCallback, useMemo, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { BaseWidget } from '@/types/widgets';
import { LazyWidget } from '@/components/widgets/LazyWidget';

interface VirtualizedWidgetListProps {
  widgets: BaseWidget[];
  containerHeight?: number;
  itemHeight?: number;
  gap?: number;
}

export const VirtualizedWidgetList = memo<VirtualizedWidgetListProps>(({
  widgets,
  containerHeight = 600,
  itemHeight = 200,
  gap = 16
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Memoize the virtualizer configuration
  const virtualizer = useVirtualizer({
    count: widgets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight + gap, [itemHeight, gap]),
    overscan: 2, // Render 2 items outside of viewport
  });

  // Memoize virtual items array
  const virtualItems = virtualizer.getVirtualItems();

  // Memoize total size calculation
  const totalSize = useMemo(() => virtualizer.getTotalSize(), [virtualizer]);

  return (
    <div
      ref={parentRef}
      className="overflow-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-pip-bg-secondary"
      style={{ height: containerHeight }}
    >
      <div
        style={{
          height: totalSize,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const widget = widgets[virtualItem.index];
          
          return (
            <div
              key={widget.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div style={{ padding: `0 0 ${gap}px 0` }}>
                <LazyWidget widget={widget} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.widgets.length === nextProps.widgets.length &&
    prevProps.containerHeight === nextProps.containerHeight &&
    prevProps.itemHeight === nextProps.itemHeight &&
    prevProps.gap === nextProps.gap &&
    prevProps.widgets.every((widget, index) => 
      widget.id === nextProps.widgets[index]?.id
    )
  );
});