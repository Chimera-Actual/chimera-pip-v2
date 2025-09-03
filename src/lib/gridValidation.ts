import { GridPosition } from '@/types/widgets';

/**
 * Standard widget size presets (width x height in grid cells)
 */
export const WIDGET_SIZES = {
  small: { width: 1, height: 1 },      // 1×1 - Toggles, simple indicators
  medium: { width: 2, height: 1 },     // 2×1 - Weather, quick stats
  large: { width: 2, height: 2 },      // 2×2 - Standard widget size
  wide: { width: 4, height: 1 },       // 4×1 - Music player, search bars
  tall: { width: 1, height: 3 },       // 1×3 - Vertical lists
  extraLarge: { width: 3, height: 2 }, // 3×2 - Complex data widgets
  massive: { width: 4, height: 2 },    // 4×2 - Dashboard widgets
} as const;

/**
 * Gets available sizes for a widget type
 */
export const getAvailableSizes = (widgetType: string) => {
  // All widgets can use standard sizes, but some have recommended defaults
  return Object.entries(WIDGET_SIZES);
};

/**
 * Converts pixel size to grid cells (for 20px cell size)
 */
export const pixelsToGridCells = (pixels: number): number => {
  return Math.max(1, Math.round(pixels / 20));
};

/**
 * Converts grid cells to pixel size (for 20px cell size)
 */
export const gridCellsToPixels = (cells: number): number => {
  return cells * 20;
};

/**
 * Ensures grid position fits within column bounds
 */
export const validateAndConstrainPosition = (
  position: GridPosition, 
  maxColumns: number
): GridPosition => {
  let constrainedPosition = { ...position };
  
  // Ensure position fits within grid bounds
  if (constrainedPosition.col + constrainedPosition.width > maxColumns) {
    constrainedPosition.col = Math.max(0, maxColumns - constrainedPosition.width);
  }
  
  constrainedPosition.col = Math.max(0, constrainedPosition.col);
  constrainedPosition.row = Math.max(0, constrainedPosition.row);
  
  return constrainedPosition;
};

/**
 * Checks if two widgets would overlap
 */
export const checkWidgetCollision = (
  pos1: GridPosition, 
  pos2: GridPosition
): boolean => {
  return !(
    pos1.col >= pos2.col + pos2.width ||
    pos1.col + pos1.width <= pos2.col ||
    pos1.row >= pos2.row + pos2.height ||
    pos1.row + pos1.height <= pos2.row
  );
};

/**
 * Finds the next available position for a widget
 */
export const findNextAvailablePosition = (
  widgetSize: { width: number; height: number },
  existingPositions: GridPosition[],
  maxColumns: number
): GridPosition => {
  for (let row = 0; row < 100; row++) { // Reasonable limit
    for (let col = 0; col <= maxColumns - widgetSize.width; col++) {
      const testPosition: GridPosition = {
        row,
        col,
        width: widgetSize.width,
        height: widgetSize.height
      };
      
      const hasCollision = existingPositions.some(pos => 
        checkWidgetCollision(testPosition, pos)
      );
      
      if (!hasCollision) {
        return testPosition;
      }
    }
  }
  
  // Fallback to bottom of grid if no space found
  return {
    row: Math.max(...existingPositions.map(p => p.row + p.height), 0),
    col: 0,
    width: widgetSize.width,
    height: widgetSize.height
  };
};