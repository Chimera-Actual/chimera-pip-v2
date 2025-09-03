import { useState, useCallback, useMemo } from 'react';
import { BaseWidget } from '@/types/widgets';

export interface GridCell {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridConfig {
  cellSize: number;
  gap: number;
  columns: number;
  rows: number;
}

export interface GridPosition {
  row: number;
  col: number;
  width: number;
  height: number;
}

export const useGridSystem = (config: GridConfig) => {
  const [occupiedCells, setOccupiedCells] = useState<Set<string>>(new Set());
  const [showGrid, setShowGrid] = useState(false);

  // Convert pixel position to grid coordinates
  const pixelToGrid = useCallback((x: number, y: number): { row: number; col: number } => {
    const col = Math.round(x / (config.cellSize + config.gap));
    const row = Math.round(y / (config.cellSize + config.gap));
    return { row: Math.max(0, row), col: Math.max(0, col) };
  }, [config]);

  // Convert grid coordinates to pixel position
  const gridToPixel = useCallback((row: number, col: number): { x: number; y: number } => {
    return {
      x: col * (config.cellSize + config.gap),
      y: row * (config.cellSize + config.gap)
    };
  }, [config]);

  // Convert pixel size to grid units
  const sizeToGrid = useCallback((width: number, height: number): { width: number; height: number } => {
    return {
      width: Math.max(1, Math.round(width / config.cellSize)),
      height: Math.max(1, Math.round(height / config.cellSize))
    };
  }, [config]);

  // Convert grid size to pixels
  const gridToSize = useCallback((gridWidth: number, gridHeight: number): { width: number; height: number } => {
    return {
      width: gridWidth * config.cellSize + (gridWidth - 1) * config.gap,
      height: gridHeight * config.cellSize + (gridHeight - 1) * config.gap
    };
  }, [config]);

  // Snap position to grid
  const snapToGrid = useCallback((x: number, y: number): { x: number; y: number } => {
    const { row, col } = pixelToGrid(x, y);
    return gridToPixel(row, col);
  }, [pixelToGrid, gridToPixel]);

  // Snap size to grid
  const snapSizeToGrid = useCallback((width: number, height: number): { width: number; height: number } => {
    const gridSize = sizeToGrid(width, height);
    return gridToSize(gridSize.width, gridSize.height);
  }, [sizeToGrid, gridToSize]);

  // Get cell key for tracking occupation
  const getCellKey = useCallback((row: number, col: number): string => {
    return `${row}-${col}`;
  }, []);

  // Check if a position is available
  const isPositionAvailable = useCallback((
    row: number, 
    col: number, 
    width: number = 1, 
    height: number = 1,
    excludeWidgetId?: string
  ): boolean => {
    if (col < 0 || row < 0 || col + width > config.columns) {
      return false;
    }

    for (let r = row; r < row + height; r++) {
      for (let c = col; c < col + width; c++) {
        const key = getCellKey(r, c);
        if (occupiedCells.has(key)) {
          // Check if this cell belongs to the widget we're excluding
          if (excludeWidgetId) {
            const cellWidget = occupiedCells.has(`${excludeWidgetId}-${key}`);
            if (!cellWidget) return false;
          } else {
            return false;
          }
        }
      }
    }
    return true;
  }, [occupiedCells, config.columns, getCellKey]);

  // Find the next available position
  const findAvailablePosition = useCallback((
    width: number = 1, 
    height: number = 1,
    preferredRow: number = 0
  ): GridPosition | null => {
    for (let row = preferredRow; row < config.rows; row++) {
      for (let col = 0; col <= config.columns - width; col++) {
        if (isPositionAvailable(row, col, width, height)) {
          return { row, col, width, height };
        }
      }
    }
    return null;
  }, [config.columns, config.rows, isPositionAvailable]);

  // Update occupied cells when widgets change
  const updateOccupiedCells = useCallback((widgets: BaseWidget[]) => {
    const newOccupiedCells = new Set<string>();
    
    widgets.forEach(widget => {
      if (!widget.position || !widget.size) return;
      
      const { row, col } = pixelToGrid(widget.position.x, widget.position.y);
      const { width, height } = sizeToGrid(widget.size.width, widget.size.height);
      
      for (let r = row; r < row + height; r++) {
        for (let c = col; c < col + width; c++) {
          newOccupiedCells.add(getCellKey(r, c));
          newOccupiedCells.add(`${widget.id}-${getCellKey(r, c)}`);
        }
      }
    });
    
    setOccupiedCells(newOccupiedCells);
  }, [pixelToGrid, sizeToGrid, getCellKey]);

  // Auto-arrange widgets using grid packing
  const autoArrangeWidgets = useCallback((widgets: BaseWidget[]): BaseWidget[] => {
    const arranged = [...widgets].sort((a, b) => {
      // Prioritize by: non-collapsed first, then by size (larger first), then by creation date
      if (a.collapsed !== b.collapsed) return a.collapsed ? 1 : -1;
      
      const aSize = (a.size?.width || config.cellSize) * (a.size?.height || config.cellSize);
      const bSize = (b.size?.width || config.cellSize) * (b.size?.height || config.cellSize);
      if (aSize !== bSize) return bSize - aSize;
      
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });

    const arrangedWidgets: BaseWidget[] = [];
    const tempOccupied = new Set<string>();

    arranged.forEach(widget => {
      const { width, height } = sizeToGrid(
        widget.size?.width || config.cellSize,
        widget.size?.height || config.cellSize
      );

      // Find the best position for this widget
      let bestPosition: GridPosition | null = null;
      
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col <= config.columns - width; col++) {
          let available = true;
          
          // Check if position is available
          for (let r = row; r < row + height; r++) {
            for (let c = col; c < col + width; c++) {
              if (tempOccupied.has(getCellKey(r, c))) {
                available = false;
                break;
              }
            }
            if (!available) break;
          }
          
          if (available) {
            bestPosition = { row, col, width, height };
            break;
          }
        }
        if (bestPosition) break;
      }

      if (bestPosition) {
        const pixelPos = gridToPixel(bestPosition.row, bestPosition.col);
        const pixelSize = gridToSize(bestPosition.width, bestPosition.height);
        
        arrangedWidgets.push({
          ...widget,
          position: pixelPos,
          size: pixelSize
        });

        // Mark cells as occupied
        for (let r = bestPosition.row; r < bestPosition.row + bestPosition.height; r++) {
          for (let c = bestPosition.col; c < bestPosition.col + bestPosition.width; c++) {
            tempOccupied.add(getCellKey(r, c));
          }
        }
      } else {
        // If no position found, place at the end
        const fallbackRow = Math.floor(arrangedWidgets.length / config.columns);
        const pixelPos = gridToPixel(fallbackRow, 0);
        arrangedWidgets.push({
          ...widget,
          position: pixelPos
        });
      }
    });

    return arrangedWidgets;
  }, [config, sizeToGrid, gridToPixel, gridToSize, getCellKey]);

  // Get visual grid lines for rendering
  const getGridLines = useMemo(() => {
    if (!showGrid) return { horizontal: [], vertical: [] };

    const horizontal = [];
    const vertical = [];

    // Horizontal lines
    for (let row = 0; row <= config.rows; row++) {
      const y = row * (config.cellSize + config.gap) - config.gap / 2;
      horizontal.push(y);
    }

    // Vertical lines
    for (let col = 0; col <= config.columns; col++) {
      const x = col * (config.cellSize + config.gap) - config.gap / 2;
      vertical.push(x);
    }

    return { horizontal, vertical };
  }, [showGrid, config]);

  return {
    // Grid operations
    pixelToGrid,
    gridToPixel,
    sizeToGrid,
    gridToSize,
    snapToGrid,
    snapSizeToGrid,
    
    // Position management
    isPositionAvailable,
    findAvailablePosition,
    updateOccupiedCells,
    autoArrangeWidgets,
    
    // Visual
    showGrid,
    setShowGrid,
    getGridLines,
    
    // State
    occupiedCells
  };
};