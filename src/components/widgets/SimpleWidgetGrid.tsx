import React, { useCallback, useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
import { toast } from '@/hooks/use-toast';

export interface SimpleWidgetGridProps {
  tab: string;
  className?: string;
}

// Debounce utility for batch operations
const useDebouncedCallback = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

export const SimpleWidgetGrid = React.memo<SimpleWidgetGridProps>(({ tab, className = '' }) => {
  const { getWidgetsByTab, updateMultipleWidgets } = useWidgets();
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
  const [isDragging, setIsDragging] = useState(false);
  
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

  // Enhanced sensors for better mobile and desktop experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms press delay for mobile
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debounced batch update for reordering
  const debouncedBatchUpdate = useDebouncedCallback(
    async (widgetUpdates: Array<{id: string; updates: Partial<BaseWidget>}>) => {
      try {
        await updateMultipleWidgets(widgetUpdates);
        toast({
          title: 'Widgets Reordered',
          description: 'Widget order updated successfully.',
        });
      } catch (error) {
        // Error handling is already done in updateMultipleWidgets with rollback
        console.error('Failed to update widget order:', error);
      }
    },
    300 // 300ms delay to batch rapid changes
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setIsDragging(false);

    if (active.id !== over?.id && over?.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
        
        // Create batch updates for all affected widgets
        const widgetUpdates = reorderedWidgets.map((widget, index) => ({
          id: widget.id,
          updates: { order: index }
        }));

        // Use debounced batch update
        debouncedBatchUpdate(widgetUpdates);
      }
    }
  }, [widgets, debouncedBatchUpdate]);

  const activeWidget = useMemo(() => 
    widgets.find(w => w.id === activeId),
    [widgets, activeId]
  );

  // Improved DragOverlay with better styling and visual feedback
  const dragOverlay = useMemo(() => {
    if (!activeWidget) return null;
    
    return (
      <div className={cn(
        "transform rotate-3 scale-105 transition-transform",
        "bg-pip-bg/95 border-2 border-pip-green-primary/80 rounded-lg shadow-2xl shadow-pip-green-primary/30",
        "backdrop-blur-sm pip-glow",
        activeWidget.widgetWidth === 'full' ? 'w-[400px]' : 'w-[300px]'
      )}>
        <WidgetContainer
          widgetId={activeWidget.id}
          widgetType={activeWidget.type}
          title={activeWidget.title}
          customIcon={activeWidget.customIcon}
          widgetWidth={activeWidget.widgetWidth}
          collapsed={activeWidget.collapsed}
          onToggleCollapse={() => {}}
          onSettingsChange={() => {}}
          onTitleChange={() => {}}
          onIconChange={() => {}}
          onToggleWidth={() => {}}
          onDelete={() => {}}
          onArchive={() => {}}
          onMove={undefined}
          className="pointer-events-none"
        >
          <div className="opacity-60">
            <WidgetRenderer widget={activeWidget} />
          </div>
        </WidgetContainer>
      </div>
    );
  }, [activeWidget]);

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
            'grid gap-4 auto-rows-max transition-all duration-200',
            isMobile ? 'grid-cols-1' : 'grid-cols-2',
            isDragging && 'pointer-events-none select-none'
          )}>
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

        <DragOverlay dropAnimation={{
          duration: 300,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {dragOverlay}
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