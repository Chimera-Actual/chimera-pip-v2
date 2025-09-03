import { GridPosition } from '@/types/widgets';

/**
 * Ensures a grid position maintains square dimensions
 */
export const enforceSquareConstraint = (position: GridPosition): GridPosition => {
  // For square widgets, width must equal height
  const size = Math.max(position.width, position.height);
  
  return {
    ...position,
    width: size,
    height: size
  };
};

/**
 * Validates that a grid position represents a square
 */
export const isSquareWidget = (position: GridPosition): boolean => {
  return position.width === position.height;
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
 * Ensures grid position fits within column bounds and maintains square constraint
 */
export const validateAndConstrainPosition = (
  position: GridPosition, 
  maxColumns: number
): GridPosition => {
  let constrainedPosition = enforceSquareConstraint(position);
  
  // Ensure position fits within grid bounds
  if (constrainedPosition.col + constrainedPosition.width > maxColumns) {
    constrainedPosition.col = Math.max(0, maxColumns - constrainedPosition.width);
  }
  
  constrainedPosition.col = Math.max(0, constrainedPosition.col);
  constrainedPosition.row = Math.max(0, constrainedPosition.row);
  
  return constrainedPosition;
};