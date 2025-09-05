import React, { useCallback, useState } from 'react';
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
import { WidgetGridControls, DraggableWidget, useWidgetActions } from '@/features/widgets';
import { WidgetContainer } from './WidgetContainer';
import { WidgetRenderer } from './WidgetRegistry';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { BaseWidget, WidgetType } from '@/types/widgets';
import { useWidgets } from '@/contexts/WidgetContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface SimpleWidgetGridProps {
  tab: string;
  className?: string;
}

export const SimpleWidgetGrid: React.FC<SimpleWidgetGridProps> = ({ tab, className = '' }) => {
  const { getWidgetsByTab } = useWidgets();
  const { 
    handleAddWidget,
    handleDelete,
    handleArchive,
    handleUpdate,
    handleToggleWidth
  } = useWidgetActions(tab);
  
  // Performance monitoring
  const { markRenderStart, markRenderEnd, trackMemoryUsage } = usePerformanceMonitor('SimpleWidgetGrid');
  
  // Track render performance
  React.useLayoutEffect(() => {
    markRenderStart();
    return markRenderEnd;
  });

  const [showAddWidget, setShowAddWidget] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  const widgets = getWidgetsByTab(tab as any);

  // Track memory usage on widget count changes
  React.useEffect(() => {
    if (widgets.length > 10) {
      trackMemoryUsage();
    }
  }, [widgets.length, trackMemoryUsage]);

  const handleWidgetAddAction = useCallback((widgetType: WidgetType) => {
    handleAddWidget(widgetType);
    setShowAddWidget(false);
  }, [handleAddWidget]);

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
                <div
                  key={widget.id}
                  className={cn(
                    'bg-pip-bg-secondary/30 border border-pip-border/20 rounded-lg flex items-center justify-center',
                    widget.widgetWidth === 'full' && !isMobile ? 'col-span-2' : 'col-span-1'
                  )}
                  style={{ minHeight: '200px' }}
                >
                  <span className="text-xs text-pip-text-muted font-pip-mono">
                    Widget #{index + 1} (Optimized Loading)
                  </span>
                </div>
              );
            }
            
            return (
              <DraggableWidget
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
          
          <WidgetGridControls
            onShowAddWidget={() => setShowAddWidget(true)}
            widgetCount={widgets.length}
          />
        </div>
        
        {showAddWidget && (
          <AdvancedWidgetCatalog
            onClose={() => setShowAddWidget(false)}
            onAddWidget={handleWidgetAddAction}
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
        handleUpdate(widget.id, { order: index });
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
          <div className={cn(
            'grid gap-4 auto-rows-max',
            isMobile ? 'grid-cols-1' : 'grid-cols-2'
          )}>
            <WidgetGridControls
              onShowAddWidget={() => setShowAddWidget(true)}
              widgetCount={widgets.length}
            />
            
            {widgets.length > 0 && (
              <>
                {widgets.map((widget) => (
                  <DraggableWidget
                    key={widget.id}
                    widget={widget}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onToggleWidth={handleToggleWidth}
                    isMobile={isMobile}
                  />
                ))}
                
                <WidgetGridControls
                  onShowAddWidget={() => setShowAddWidget(true)}
                  widgetCount={widgets.length}
                />
              </>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeWidget ? (
            <div className={cn(
              "bg-background border border-border rounded-lg shadow-lg opacity-80",
              activeWidget.widgetWidth === 'full' ? 'w-full' : 'w-1/2'
            )}>
              <WidgetContainer
                widgetId={activeWidget.id}
                widgetType={activeWidget.type}
                title={activeWidget.title}
                customIcon={activeWidget.customIcon}
                widgetWidth={activeWidget.widgetWidth}
                collapsed={activeWidget.collapsed}
                onToggleCollapse={() => handleUpdate(activeWidget.id, { collapsed: !activeWidget.collapsed })}
                onSettingsChange={(settings) => handleUpdate(activeWidget.id, { settings })}
                onTitleChange={(newTitle) => handleUpdate(activeWidget.id, { title: newTitle })}
                onIconChange={(newIcon) => handleUpdate(activeWidget.id, { customIcon: newIcon })}
                onToggleWidth={() => handleToggleWidth(activeWidget)}
                onDelete={() => handleDelete(activeWidget.id)}
                onArchive={() => handleArchive(activeWidget.id)}
                onMove={undefined}
              >
                <WidgetRenderer widget={activeWidget} />
              </WidgetContainer>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showAddWidget && (
        <AdvancedWidgetCatalog
          onClose={() => setShowAddWidget(false)}
          onAddWidget={handleWidgetAddAction}
          currentTab={tab}
        />
      )}
    </div>
  );
};