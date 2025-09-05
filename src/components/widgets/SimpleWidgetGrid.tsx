import React, { useCallback, useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  CollisionDetection,
  rectIntersection
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
  const [dragOverBlankArea, setDragOverBlankArea] = useState(false);
  
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
    setDragOverBlankArea(false);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    // Set blank area state when not hovering over a widget
    setDragOverBlankArea(!over?.id);
  }, []);

  // Custom collision detection that handles blank areas
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    // First try the standard collision detection
    const closestCornersCollisions = closestCorners(args);
    
    if (closestCornersCollisions.length > 0) {
      return closestCornersCollisions;
    }

    // If no collisions found, try rect intersection for broader detection
    const rectCollisions = rectIntersection(args);
    
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }

    // If still no collisions and we're dragging, create a virtual drop zone
    // This allows dropping at the end of the list
    return [];
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    setActiveId(null);
    setIsDragging(false);
    setDragOverBlankArea(false); // Clear blank area state

    const draggedWidgetId = active.id as string;
    const oldIndex = widgets.findIndex(w => w.id === draggedWidgetId);
    
    if (oldIndex === -1) return;

    let newIndex = oldIndex;
    let reorderedWidgets: BaseWidget[] = [];

    if (over?.id && over.id !== active.id) {
      // Standard widget-to-widget reordering
      const targetIndex = widgets.findIndex(w => w.id === over.id);
      if (targetIndex !== -1) {
        newIndex = targetIndex;
        reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
      }
    } else if (!over?.id) {
      // Handle blank area drops - calculate position based on drag distance/direction
      const moveThreshold = 50; // Minimum movement to trigger reorder
      
      if (Math.abs(delta.y) > moveThreshold || Math.abs(delta.x) > moveThreshold) {
        // Determine if moving forward or backward in the grid
        const isMovingDown = delta.y > moveThreshold;
        const isMovingRight = delta.x > moveThreshold;
        const isMovingUp = delta.y < -moveThreshold;
        const isMovingLeft = delta.x < -moveThreshold;
        
        if (isMovingDown || (isMovingRight && !isMobile)) {
          // Move towards end of list
          newIndex = Math.min(widgets.length - 1, oldIndex + 1);
        } else if (isMovingUp || (isMovingLeft && !isMobile)) {
          // Move towards beginning of list
          newIndex = Math.max(0, oldIndex - 1);
        }
        
        // Special case: if dragged far enough, move to end/beginning
        if (Math.abs(delta.y) > 200 || Math.abs(delta.x) > 200) {
          newIndex = isMovingDown || isMovingRight ? widgets.length - 1 : 0;
        }
        
        if (newIndex !== oldIndex) {
          reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
        }
      }
    }

    // Apply reordering if position changed
    if (newIndex !== oldIndex && reorderedWidgets.length > 0) {
      const widgetUpdates = reorderedWidgets.map((widget, index) => ({
        id: widget.id,
        updates: { order: index }
      }));

      debouncedBatchUpdate(widgetUpdates);
      
      // Show success feedback
      toast({
        title: 'Widget Moved',
        description: `Moved "${widgets[oldIndex].title}" to position ${newIndex + 1}`,
      });
    } else if (!over?.id) {
      // Provide feedback when dropping in blank area doesn't result in movement
      toast({
        title: 'Drop Area',
        description: 'Drag further to reorder widgets, or drop on another widget to swap positions',
        variant: 'default',
      });
    }
  }, [widgets, debouncedBatchUpdate, isMobile]);

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
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className={cn(
            'grid gap-4 auto-rows-max transition-all duration-200 relative',
            isMobile ? 'grid-cols-1' : 'grid-cols-2',
            isDragging && 'pointer-events-none select-none',
            dragOverBlankArea && isDragging && 'bg-pip-green-primary/5 border-2 border-dashed border-pip-green-primary/30 rounded-lg'
          )}>
            {/* Blank area drop indicator */}
            {dragOverBlankArea && isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-pip-bg/90 border border-pip-green-primary/50 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <span className="text-pip-green-primary font-pip-mono text-sm pip-text-glow">
                    Drop here to reorder widget
                  </span>
                </div>
              </div>
            )}
            
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