import React from 'react';
import { cn } from '@/lib/utils';
import { GridPosition } from '@/types/widgets';
import { useGridLayout } from '@/hooks/useGridLayout';
import { BaseWidget } from '@/types/widgets';

interface GridDropOverlayProps {
  isVisible: boolean;
  containerWidth: number;
  widgets: BaseWidget[];
  draggedWidget?: BaseWidget;
  hoverPosition?: GridPosition;
}

export const GridDropOverlay: React.FC<GridDropOverlayProps> = ({
  isVisible,
  containerWidth,
  widgets,
  draggedWidget,
  hoverPosition,
}) => {
  const { columns, getGridStyle, isValidPosition } = useGridLayout(containerWidth);

  if (!isVisible) return null;

  const gridCells = [];
  const maxRows = Math.max(8, Math.max(...widgets.map(w => w.gridPosition.row + w.gridPosition.height)) + 4);

  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < columns; col++) {
      const cellPosition: GridPosition = {
        row,
        col,
        width: draggedWidget?.gridPosition.width || 10,
        height: draggedWidget?.gridPosition.height || 10,
      };

      const isHovered = hoverPosition && 
        hoverPosition.row === row && 
        hoverPosition.col === col;

      const isValid = isValidPosition(cellPosition, widgets, draggedWidget?.id);
      const isOccupied = widgets.some(w => 
        w.id !== draggedWidget?.id &&
        row >= w.gridPosition.row && 
        row < w.gridPosition.row + w.gridPosition.height &&
        col >= w.gridPosition.col && 
        col < w.gridPosition.col + w.gridPosition.width
      );

      gridCells.push(
        <div
          key={`${row}-${col}`}
          className={cn(
            "border transition-all duration-150 min-h-[20px]",
            isHovered && isValid && "bg-accent/30 border-accent border-2",
            isHovered && !isValid && "bg-destructive/20 border-destructive border-2",
            !isHovered && isOccupied && "bg-muted/30 border-muted-foreground/40",
            !isHovered && !isOccupied && "border-border/20 border-dashed"
          )}
          style={{
            gridColumn: `${col + 1}`,
            gridRow: `${row + 1}`,
          }}
        />
      );
    }
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      style={getGridStyle()}
    >
      {gridCells}
    </div>
  );
};