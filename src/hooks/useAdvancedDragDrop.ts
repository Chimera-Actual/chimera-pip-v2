import { useState, useCallback, useMemo } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverEvent,
  CollisionDetection,
  rectIntersection,
  closestCenter,
  closestCorners,
  pointerWithin,
  getFirstCollision
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { restrictToWindowEdges, restrictToParentElement } from '@dnd-kit/modifiers';
import { BaseWidget } from '@/types/widgets';
import { useGridSystem, GridConfig } from './useGridSystem';

interface DragState {
  activeId: string | null;
  overId: string | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

interface ExtendedGridConfig extends GridConfig {
  containerWidth: number;
}

export const useAdvancedDragDrop = (
  widgets: BaseWidget[],
  onWidgetsReorder: (widgets: BaseWidget[]) => void,
  onWidgetMove: (widgetId: string, position: { x: number; y: number }) => void,
  gridConfig: ExtendedGridConfig
) => {
  const gridSystemConfig: GridConfig = {
    cellSize: gridConfig.cellSize,
    gap: gridConfig.gap,
    columns: gridConfig.columns,
    rows: Math.ceil(widgets.length / gridConfig.columns) + 5 // Extra rows for flexibility
  };

  const gridSystem = useGridSystem(gridSystemConfig);
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    overId: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 }
  });

  // Custom collision detection that combines multiple strategies
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    // First, let's see if there are any collisions with the pointer
    const pointerCollisions = pointerWithin(args);
    
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // If there are no pointer collisions, use closest center
    const centerCollisions = closestCenter(args);
    if (centerCollisions.length > 0) {
      return centerCollisions;
    }

    // Fallback to rectangle intersection
    return rectIntersection(args);
  }, []);

  // Auto-arrange using grid system
  const autoArrangeWidgets = useCallback((widgetsToArrange: BaseWidget[]) => {
    return gridSystem.autoArrangeWidgets(widgetsToArrange);
  }, [gridSystem]);

  // Snap to grid helper using grid system
  const snapToGrid = useCallback((x: number, y: number) => {
    return gridSystem.snapToGrid(x, y);
  }, [gridSystem]);

  // Check for collisions using grid system
  const checkCollision = useCallback((
    widget: BaseWidget, 
    newPosition: { x: number; y: number },
    excludeWidget?: string
  ) => {
    const { row, col } = gridSystem.pixelToGrid(newPosition.x, newPosition.y);
    const { width, height } = gridSystem.sizeToGrid(
      widget.size?.width || gridConfig.cellSize,
      widget.size?.height || gridConfig.cellSize
    );
    
    return !gridSystem.isPositionAvailable(row, col, width, height, excludeWidget);
  }, [gridSystem, gridConfig]);

  // Find the next available position using grid system
  const findAvailablePosition = useCallback((widget: BaseWidget) => {
    const { width, height } = gridSystem.sizeToGrid(
      widget.size?.width || gridConfig.cellSize,
      widget.size?.height || gridConfig.cellSize
    );
    
    const gridPos = gridSystem.findAvailablePosition(width, height);
    if (gridPos) {
      return gridSystem.gridToPixel(gridPos.row, gridPos.col);
    }
    
    // Fallback
    return { x: 0, y: widgets.length * (gridConfig.cellSize + gridConfig.gap) };
  }, [gridSystem, gridConfig, widgets]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    console.log('🎯 DRAG START:', active.id);
    setDragState(prev => ({
      ...prev,
      activeId: active.id as string,
      isDragging: true
    }));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    console.log('🎯 DRAG OVER:', over?.id);
    setDragState(prev => ({
      ...prev,
      overId: over?.id as string || null
    }));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    console.log('Drag ended:', { activeId: active?.id, overId: over?.id, delta });
    
    if (active) {
      const draggedWidget = widgets.find(w => w.id === active.id);
      if (draggedWidget && delta) {
        // Calculate new position with grid snapping
        const currentPos = draggedWidget.position || { x: 0, y: 0 };
        const newPos = {
          x: currentPos.x + delta.x,
          y: currentPos.y + delta.y
        };
        
        const snappedPos = snapToGrid(newPos.x, newPos.y);
        
        // Check if the new position is valid
        if (!checkCollision(draggedWidget, snappedPos, draggedWidget.id)) {
          onWidgetMove(draggedWidget.id, snappedPos);
        } else {
          // Find alternative position if collision detected
          const alternativePos = findAvailablePosition(draggedWidget);
          onWidgetMove(draggedWidget.id, alternativePos);
        }
      } else if (active && over && active.id !== over.id) {
        // Fallback to simple reorder
        const oldIndex = widgets.findIndex(w => w.id === active.id);
        const newIndex = widgets.findIndex(w => w.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
          onWidgetsReorder(reorderedWidgets);
        }
      }
    }

    setDragState({
      activeId: null,
      overId: null,
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    });
  }, [widgets, onWidgetsReorder, onWidgetMove, snapToGrid, checkCollision, findAvailablePosition]);

  // Modifiers for constraining drag behavior
  const dragModifiers = useMemo(() => [
    restrictToWindowEdges,
    restrictToParentElement
  ], []);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    customCollisionDetection,
    autoArrangeWidgets,
    snapToGrid,
    checkCollision,
    findAvailablePosition,
    dragModifiers,
    gridSystem,
    // DndContext props
    dndContextProps: {
      collisionDetection: customCollisionDetection,
      modifiers: dragModifiers,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd
    }
  };
};