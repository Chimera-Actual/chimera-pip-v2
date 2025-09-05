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
import { useOptimizedPerformance } from '@/features/state-management';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface SimpleWidgetGridProps {
  tab: string;
  className?: string;
}

export const SimpleWidgetGrid = React.memo<SimpleWidgetGridProps>(({ tab, className = '' }) => {
  const { getWidgetsByTab } = useWidgets();
  const { 
    handleAddWidget,
    handleDelete,
    handleArchive,
    handleUpdate,
    handleToggleWidth
  } = useWidgetActions(tab);
  
  const { markRenderStart, markRenderEnd, trackMemoryUsage } = useOptimizedPerformance({ 
    componentName: 'SimpleWidgetGrid',
    trackMemory: true 
  });
  
  React.useLayoutEffect(() => {
    markRenderStart();
    return markRenderEnd;
  });

  const [showAddWidget, setShowAddWidget] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  const widgets = getWidgetsByTab(tab as any);

  React.useEffect(() => {
    if (widgets.length > 10) {
      trackMemoryUsage();
    }
  }, [widgets.length, trackMemoryUsage]);

  const handleWidgetAddAction = useCallback((widgetType: WidgetType) => {
    handleAddWidget(widgetType);
    setShowAddWidget(false);
  }, [handleAddWidget]);

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
          <div className={cn('grid gap-4 auto-rows-max', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
            <WidgetGridControls
              onShowAddWidget={() => setShowAddWidget(true)}
              widgetCount={widgets.length}
            />
            
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
          </div>
        </SortableContext>

        <DragOverlay>
          {activeWidget ? (
            <div className={cn("bg-background border border-border rounded-lg shadow-lg opacity-80", activeWidget.widgetWidth === 'full' ? 'w-full' : 'w-1/2')}>
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
});

SimpleWidgetGrid.displayName = 'SimpleWidgetGrid';