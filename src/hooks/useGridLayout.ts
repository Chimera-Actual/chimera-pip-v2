import { useState, useCallback, useMemo } from 'react';
import { BaseWidget, GridPosition } from '@/types/widgets';

export interface GridBreakpoint {
  name: 'mobile' | 'tablet' | 'desktop';
  minWidth: number;
  columns: number;
}

export const GRID_BREAKPOINTS: GridBreakpoint[] = [
  { name: 'mobile', minWidth: 0, columns: 8 },
  { name: 'tablet', minWidth: 768, columns: 12 },
  { name: 'desktop', minWidth: 1200, columns: 16 },
];

export const GRID_CELL_SIZE = 60;
export const GRID_GAP = 8;

export interface GridLayoutHook {
  currentBreakpoint: GridBreakpoint;
  columns: number;
  cellSize: number;
  gap: number;
  isValidPosition: (position: GridPosition, widgets: BaseWidget[], excludeId?: string) => boolean;
  getGridStyle: () => React.CSSProperties;
  snapToGrid: (x: number, y: number) => { col: number; row: number };
  getWidgetStyle: (position: GridPosition) => React.CSSProperties;
}

export const useGridLayout = (containerWidth: number): GridLayoutHook => {
  const currentBreakpoint = useMemo(() => {
    return GRID_BREAKPOINTS
      .slice()
      .reverse()
      .find(bp => containerWidth >= bp.minWidth) || GRID_BREAKPOINTS[0];
  }, [containerWidth]);

  const isValidPosition = useCallback((
    position: GridPosition,
    widgets: BaseWidget[],
    excludeId?: string
  ): boolean => {
    // Check if position is within bounds
    if (position.col < 0 || position.row < 0) return false;
    if (position.col + position.width > currentBreakpoint.columns) return false;

    // Check for overlaps
    const otherWidgets = widgets.filter(w => w.id !== excludeId);
    return !otherWidgets.some(widget => {
      const wp = widget.gridPosition;
      return !(
        position.col >= wp.col + wp.width ||
        position.col + position.width <= wp.col ||
        position.row >= wp.row + wp.height ||
        position.row + position.height <= wp.row
      );
    });
  }, [currentBreakpoint.columns]);

  const snapToGrid = useCallback((x: number, y: number) => {
    const col = Math.max(0, Math.min(
      Math.round(x / (GRID_CELL_SIZE + GRID_GAP)),
      currentBreakpoint.columns - 1
    ));
    const row = Math.max(0, Math.round(y / (GRID_CELL_SIZE + GRID_GAP)));
    return { col, row };
  }, [currentBreakpoint.columns]);

  const getGridStyle = useCallback((): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${currentBreakpoint.columns}, ${GRID_CELL_SIZE}px)`,
    gridAutoRows: `${GRID_CELL_SIZE}px`,
    gap: `${GRID_GAP}px`,
    padding: `16px`,
    justifyContent: 'center',
  }), [currentBreakpoint.columns]);

  const getWidgetStyle = useCallback((position: GridPosition): React.CSSProperties => ({
    gridColumn: `${position.col + 1} / span ${position.width}`,
    gridRow: `${position.row + 1} / span ${position.height}`,
  }), []);

  return {
    currentBreakpoint,
    columns: currentBreakpoint.columns,
    cellSize: GRID_CELL_SIZE,
    gap: GRID_GAP,
    isValidPosition,
    getGridStyle,
    snapToGrid,
    getWidgetStyle,
  };
};