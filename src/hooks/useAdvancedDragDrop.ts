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

interface DragState {
  activeId: string | null;
  overId: string | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

interface GridConfig {
  columns: number;
  gap: number;
  cellSize: { width: number; height: number };
  containerWidth: number;
}

export const useAdvancedDragDrop = (
  widgets: BaseWidget[],
  onWidgetsReorder: (widgets: BaseWidget[]) => void,
  onWidgetMove: (widgetId: string, position: { x: number; y: number }) => void,
  gridConfig: GridConfig
) => {
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

  // Auto-arrange algorithm for optimal grid layout
  const autoArrangeWidgets = useCallback((widgetsToArrange: BaseWidget[]) => {
    const arranged = [...widgetsToArrange];
    const { columns, gap, cellSize } = gridConfig;
    
    // Sort by priority (collapsed widgets go to end, then by creation date)
    arranged.sort((a, b) => {
      if (a.collapsed !== b.collapsed) {
        return a.collapsed ? 1 : -1;
      }
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });

    // Calculate positions using a simple grid algorithm
    const positions: Array<{ x: number; y: number }> = [];
    let currentRow = 0;
    let currentCol = 0;

    arranged.forEach((widget, index) => {
      const widgetWidth = widget.size?.width || cellSize.width;
      const widgetHeight = widget.size?.height || cellSize.height;
      
      // Calculate how many columns this widget spans
      const widgetCols = Math.ceil(widgetWidth / (cellSize.width + gap));
      
      // Check if widget fits in current row
      if (currentCol + widgetCols > columns) {
        currentRow++;
        currentCol = 0;
      }

      positions.push({
        x: currentCol * (cellSize.width + gap),
        y: currentRow * (cellSize.height + gap)
      });

      currentCol += widgetCols;
    });

    // Update widgets with new positions
    const arrangedWidgets = arranged.map((widget, index) => ({
      ...widget,
      position: positions[index] || { x: 0, y: 0 }
    }));

    return arrangedWidgets;
  }, [gridConfig]);

  // Snap to grid helper
  const snapToGrid = useCallback((x: number, y: number) => {
    const { gap, cellSize } = gridConfig;
    const gridX = Math.round(x / (cellSize.width + gap)) * (cellSize.width + gap);
    const gridY = Math.round(y / (cellSize.height + gap)) * (cellSize.height + gap);
    return { x: Math.max(0, gridX), y: Math.max(0, gridY) };
  }, [gridConfig]);

  // Check for collisions when placing widgets
  const checkCollision = useCallback((
    widget: BaseWidget, 
    newPosition: { x: number; y: number },
    excludeWidget?: string
  ) => {
    const widgetWidth = widget.size?.width || gridConfig.cellSize.width;
    const widgetHeight = widget.size?.height || gridConfig.cellSize.height;

    return widgets.some(otherWidget => {
      if (otherWidget.id === widget.id || otherWidget.id === excludeWidget) {
        return false;
      }

      const otherWidth = otherWidget.size?.width || gridConfig.cellSize.width;
      const otherHeight = otherWidget.size?.height || gridConfig.cellSize.height;
      const otherPos = otherWidget.position || { x: 0, y: 0 };

      // Check if rectangles overlap
      return !(
        newPosition.x + widgetWidth <= otherPos.x ||
        otherPos.x + otherWidth <= newPosition.x ||
        newPosition.y + widgetHeight <= otherPos.y ||
        otherPos.y + otherHeight <= newPosition.y
      );
    });
  }, [widgets, gridConfig]);

  // Find the next available position for a widget
  const findAvailablePosition = useCallback((widget: BaseWidget) => {
    const { columns, gap, cellSize } = gridConfig;
    const widgetCols = Math.ceil((widget.size?.width || cellSize.width) / (cellSize.width + gap));
    
    for (let row = 0; row < 100; row++) { // Reasonable limit
      for (let col = 0; col <= columns - widgetCols; col++) {
        const position = {
          x: col * (cellSize.width + gap),
          y: row * (cellSize.height + gap)
        };
        
        if (!checkCollision(widget, position)) {
          return position;
        }
      }
    }
    
    // Fallback to bottom of grid
    return { x: 0, y: widgets.length * (cellSize.height + gap) };
  }, [gridConfig, checkCollision, widgets]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setDragState(prev => ({
      ...prev,
      activeId: active.id as string,
      isDragging: true
    }));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setDragState(prev => ({
      ...prev,
      overId: over?.id as string || null
    }));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    if (active && over && active.id !== over.id) {
      // Reorder widgets
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
        onWidgetsReorder(reorderedWidgets);
      }
    } else if (active && delta.x !== 0 || delta.y !== 0) {
      // Move widget to new position
      const widget = widgets.find(w => w.id === active.id);
      if (widget) {
        const currentPos = widget.position || { x: 0, y: 0 };
        const newPosition = {
          x: currentPos.x + delta.x,
          y: currentPos.y + delta.y
        };
        
        // Snap to grid
        const snappedPosition = snapToGrid(newPosition.x, newPosition.y);
        
        // Check for collisions
        if (!checkCollision(widget, snappedPosition, widget.id)) {
          onWidgetMove(widget.id, snappedPosition);
        } else {
          // Find available position nearby
          const availablePosition = findAvailablePosition(widget);
          onWidgetMove(widget.id, availablePosition);
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