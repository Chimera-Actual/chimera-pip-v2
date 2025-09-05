import { BaseWidget } from '@/types/widgets';

// Configuration for gap-based positioning
export const POSITION_GAP = 1000;
export const MIN_POSITION = 0;

/**
 * Calculate a safe position for inserting a widget between two positions
 */
export function calculateSafePosition(beforePosition?: number, afterPosition?: number): number {
  // If no constraints, use gap-based positioning
  if (beforePosition === undefined && afterPosition === undefined) {
    return MIN_POSITION;
  }
  
  // If only before position exists (inserting at end)
  if (beforePosition !== undefined && afterPosition === undefined) {
    return beforePosition + POSITION_GAP;
  }
  
  // If only after position exists (inserting at start)
  if (beforePosition === undefined && afterPosition !== undefined) {
    return Math.max(MIN_POSITION, afterPosition - POSITION_GAP);
  }
  
  // If both positions exist, calculate midpoint
  if (beforePosition !== undefined && afterPosition !== undefined) {
    const midpoint = Math.floor((beforePosition + afterPosition) / 2);
    
    // If there's enough space for a midpoint, use it
    if (afterPosition - beforePosition > 1) {
      return midpoint;
    }
    
    // If positions are adjacent, we need to reorganize
    // Return a position that will trigger reorganization
    return beforePosition + 0.5; // This will be handled by reorganization logic
  }
  
  return MIN_POSITION;
}

/**
 * Calculate the new position for a dragged widget
 */
export function calculateNewPosition(
  widgets: BaseWidget[],
  draggedWidget: BaseWidget,
  targetIndex: number
): number {
  // Sort widgets by current order position
  const sortedWidgets = widgets
    .filter(w => w.id !== draggedWidget.id) // Exclude dragged widget
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Get the widgets that will be before and after the target position
  const beforeWidget = sortedWidgets[targetIndex - 1];
  const afterWidget = sortedWidgets[targetIndex];
  
  const beforePosition = beforeWidget?.order;
  const afterPosition = afterWidget?.order;
  
  return calculateSafePosition(beforePosition, afterPosition);
}

/**
 * Check if widgets need position reorganization
 */
export function needsReorganization(widgets: BaseWidget[]): boolean {
  const sortedWidgets = widgets.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  for (let i = 0; i < sortedWidgets.length - 1; i++) {
    const current = sortedWidgets[i].order || 0;
    const next = sortedWidgets[i + 1].order || 0;
    
    // If positions are too close (less than 2 units apart), reorganization is needed
    if (next - current < 2) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate new gap-based positions for all widgets
 */
export function generateGapBasedPositions(widgets: BaseWidget[]): Array<{id: string; position: number}> {
  const sortedWidgets = widgets.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return sortedWidgets.map((widget, index) => ({
    id: widget.id,
    position: index * POSITION_GAP
  }));
}

/**
 * Migrate existing consecutive positions to gap-based positions
 */
export function migrateToGapBasedPositions(widgets: BaseWidget[]): Array<{id: string; updates: {order: number}}> {
  const positions = generateGapBasedPositions(widgets);
  
  return positions.map(({id, position}) => ({
    id,
    updates: { order: position }
  }));
}