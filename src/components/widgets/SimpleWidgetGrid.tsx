import React, { useCallback, useMemo, useState, memo } from 'react';
import { BaseWidget, WidgetType, WidgetWidth } from '@/types/widgets';
import { useWidgets } from '@/contexts/WidgetContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Refactored components
import { DragOverlayWidget } from './grid/DragOverlayWidget';
import { EmptyGridState } from './grid/EmptyGridState';
import { AddWidgetButton } from './grid/AddWidgetButton';
import { OptimizedWidgetPlaceholder } from './grid/OptimizedWidgetPlaceholder';
import { AnimatedWidgetGrid } from '@/components/enhanced/WidgetTransitions';
import { WidgetContainer } from './WidgetContainer';
import { WidgetRenderer } from './WidgetRegistry';

export interface SimpleWidgetGridProps {
  tab: string;
  className?: string;
}

// Sortable Widget Component
const SortableWidget: React.FC<{ widget: BaseWidget; onUpdate: (id: string, updates: Partial<BaseWidget>) => void; onDelete: (id: string) => void; onArchive: (id: string) => void; onToggleWidth: (widget: BaseWidget) => void; isMobile: boolean }> = memo(({ widget, onUpdate, onDelete, onArchive, onToggleWidth, isMobile }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleChange = useCallback((newTitle: string) => {
    onUpdate(widget.id, { title: newTitle });
  }, [widget.id, onUpdate]);

  const handleIconChange = useCallback((newIcon: string) => {
    onUpdate(widget.id, { customIcon: newIcon });
  }, [widget.id, onUpdate]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        widget.widgetWidth === 'full' ? 'col-span-2' : 'col-span-1'
      )}
    >
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
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        <WidgetRenderer widget={widget} />
      </WidgetContainer>
    </div>
  );
});

export const SimpleWidgetGrid: React.FC<SimpleWidgetGridProps> = ({ tab, className = '' }) => {
  const { 
    getWidgetsByTab, 
    addWidget, 
    removeWidget, 
    archiveWidget,
    updateWidget
  } = useWidgets();
  
  // Performance monitoring
  const { markRenderStart, markRenderEnd, trackMemoryUsage } = usePerformanceMonitor('SimpleWidgetGrid');
  
  // Track render performance
  React.useLayoutEffect(() => {
    markRenderStart();
    return markRenderEnd;
  });

  // Track memory usage on widget count changes
  const allWidgets = getWidgetsByTab(tab as any);
  
  React.useEffect(() => {
    if (allWidgets.length > 10) {
      trackMemoryUsage();
    }
  }, [allWidgets.length, trackMemoryUsage]);

  const [showAddWidget, setShowAddWidget] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  const widgets = allWidgets;

  const handleAddWidget = useCallback((widgetType: WidgetType) => {
    addWidget(widgetType, tab as any);
    setShowAddWidget(false);
  }, [addWidget, tab]);

  const handleDelete = useCallback((widgetId: string) => {
    removeWidget(widgetId);
  }, [removeWidget]);

  const handleArchive = useCallback((widgetId: string) => {
    archiveWidget(widgetId);
  }, [archiveWidget]);

  const handleUpdate = useCallback((widgetId: string, updates: Partial<BaseWidget>) => {
    updateWidget(widgetId, updates);
  }, [updateWidget]);

  const handleToggleWidth = useCallback((widget: BaseWidget) => {
    const newWidth: WidgetWidth = widget.widgetWidth === 'full' ? 'half' : 'full';
    console.log(`Toggling widget ${widget.id} from ${widget.widgetWidth} to ${newWidth}`);
    updateWidget(widget.id, { widgetWidth: newWidth });
    
    // Force re-render by updating the widget through handleUpdate as well
    handleUpdate(widget.id, { widgetWidth: newWidth });
  }, [updateWidget, handleUpdate]);

  // Use simple lazy loading for large collections (>15 widgets)
  if (widgets.length > 15) {
    return (
      <div className={cn('flex flex-col space-y-4', className)}>
        <div className="mb-2 text-xs text-pip-text-muted font-pip-mono">
          Rendering {widgets.length} widgets with performance optimization
        </div>
        
        <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {widgets.map((widget, index) => {
            // Lazy render widgets not in viewport
            const isVisible = index < 20 || (index >= 20 && index % 5 === 0); // Show first 20, then every 5th
            
            if (!isVisible) {
              return (
                <OptimizedWidgetPlaceholder
                  key={widget.id}
                  index={index}
                  widgetWidth={widget.widgetWidth}
                  isMobile={isMobile}
                />
              );
            }
            
            return (
              <SortableWidget
                key={widget.id}
                widget={widget}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onToggleWidth={handleToggleWidth}
                isMobile={isMobile}
              />
            );
          })}
          
          <AddWidgetButton onAddWidget={() => setShowAddWidget(true)} />
        </div>
        
        {showAddWidget && (
          <AdvancedWidgetCatalog
            onClose={() => setShowAddWidget(false)}
            onAddWidget={handleAddWidget}
            currentTab={tab}
          />
        )}
      </div>
    );
  }

  // Standard grid for small collections with drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over?.id);
      
      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
      
      // Update positions
      reorderedWidgets.forEach((widget, index) => {
        updateWidget(widget.id, { order: index });
      });
    }
    
    setActiveId(null);
  };

  const activeWidget = widgets.find(w => w.id === activeId);

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <AnimatedWidgetGrid className={cn(
            'auto-rows-max',
            isMobile ? 'grid-cols-1' : 'grid-cols-2'
          )}>
            {widgets.length === 0 ? (
              <EmptyGridState onAddWidget={() => setShowAddWidget(true)} />
            ) : (
              <>
                {widgets.map((widget) => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onToggleWidth={handleToggleWidth}
                    isMobile={isMobile}
                  />
                ))}
                
                <AddWidgetButton onAddWidget={() => setShowAddWidget(true)} />
              </>
            )}
          </AnimatedWidgetGrid>
        </SortableContext>

        <DragOverlay>
          {activeWidget ? (
            <DragOverlayWidget
              widget={activeWidget}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onToggleWidth={handleToggleWidth}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {showAddWidget && (
        <AdvancedWidgetCatalog
          onClose={() => setShowAddWidget(false)}
          onAddWidget={handleAddWidget}
          currentTab={tab}
        />
      )}
    </div>
  );
};