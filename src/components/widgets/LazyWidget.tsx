import React, { memo, Suspense } from 'react';
import { BaseWidget } from '@/types/widgets';
import { useLazyLoading } from '@/hooks/useLazyLoading';
import { WidgetContainer } from './WidgetContainer';
import { WidgetRenderer } from './WidgetRegistry';
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
      "animate-pulse bg-pip-bg-secondary/20 border border-pip-border/10 rounded-lg",
      widget.widgetWidth === 'full' ? 'col-span-2' : 'col-span-1'
    )}
    style={{ minHeight: '200px' }}
  >
    <div className="p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-pip-primary/20 rounded"></div>
        <div className="h-3 bg-pip-primary/20 rounded w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-pip-bg-secondary/30 rounded w-full"></div>
        <div className="h-2 bg-pip-bg-secondary/30 rounded w-3/4"></div>
        <div className="h-2 bg-pip-bg-secondary/30 rounded w-1/2"></div>
      </div>
    </div>
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
        <Suspense fallback={<WidgetSkeleton widget={widget} />}>
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
      ) : (
        <WidgetSkeleton widget={widget} />
      )}
    </div>
  );
});

LazyWidget.displayName = 'LazyWidget';