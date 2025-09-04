import React, { memo, Suspense } from 'react';
import { BaseWidget } from '@/types/widgets';
import { useLazyLoading } from '@/hooks/useLazyLoading';
import { WidgetContainer } from './WidgetContainer';
import { WidgetRenderer } from './WidgetRegistry';
import { WidgetTransitions, WidgetLoadingStates } from '@/components/enhanced/WidgetTransitions';
import { cn } from '@/lib/utils';

interface LazyWidgetProps {
  widget: BaseWidget;
  onUpdate: (id: string, updates: Partial<BaseWidget>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onToggleWidth: (widget: BaseWidget) => void;
  dragHandleProps?: any;
}

const WidgetSkeleton: React.FC<{ widget: BaseWidget }> = memo(({ widget }) => (
  <div
    className={cn(
      widget.widgetWidth === 'full' ? 'col-span-2' : 'col-span-1'
    )}
    style={{ minHeight: '200px' }}
  >
    <WidgetLoadingStates.Skeleton />
  </div>
));

export const LazyWidget: React.FC<LazyWidgetProps> = memo(({
  widget,
  onUpdate,
  onDelete,
  onArchive,
  onToggleWidth,
  dragHandleProps
}) => {
  const { elementRef, shouldRender } = useLazyLoading<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '100px'
  });

  const handleTitleChange = React.useCallback((newTitle: string) => {
    onUpdate(widget.id, { title: newTitle });
  }, [widget.id, onUpdate]);

  const handleIconChange = React.useCallback((newIcon: string) => {
    onUpdate(widget.id, { customIcon: newIcon });
  }, [widget.id, onUpdate]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "relative",
        widget.widgetWidth === 'full' ? 'col-span-2' : 'col-span-1'
      )}
    >
      {shouldRender ? (
        <WidgetTransitions 
          widget={widget}
          isLoading={!shouldRender}
          status="active"
        >
          <Suspense fallback={<WidgetLoadingStates.Boot message={`Loading ${widget.type}...`} />}>
            <WidgetContainer
              widgetId={widget.id}
              widgetType={widget.type}
              title={widget.title}
              customIcon={widget.customIcon}
              widgetWidth={widget.widgetWidth}
              collapsed={widget.collapsed}
              onToggleCollapse={() => onUpdate(widget.id, { collapsed: !widget.collapsed })}
              onSettingsChange={(settings) => onUpdate(widget.id, { settings })}
              onTitleChange={handleTitleChange}
              onIconChange={handleIconChange}
              onToggleWidth={() => onToggleWidth(widget)}
              onDelete={() => onDelete(widget.id)}
              onArchive={() => onArchive(widget.id)}
              onMove={undefined}
              dragHandleProps={dragHandleProps}
            >
              <WidgetRenderer widget={widget} />
            </WidgetContainer>
          </Suspense>
        </WidgetTransitions>
      ) : (
        <WidgetSkeleton widget={widget} />
      )}
    </div>
  );
});

LazyWidget.displayName = 'LazyWidget';