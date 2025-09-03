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
  hoverPosition
}) => {
  const gridLayout = useGridLayout(containerWidth);

  if (!isVisible || !draggedWidget) return null;

  // Check if hover position is valid
  const isValidDrop = hoverPosition && draggedWidget && 
    gridLayout.isValidPosition(
      { 
        col: hoverPosition.col, 
        row: hoverPosition.row,
        width: draggedWidget.gridPosition.width,
        height: draggedWidget.gridPosition.height
      }, 
      widgets, 
      draggedWidget.id
    );

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        ...gridLayout.getGridStyle(),
        backgroundImage: `
          linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
        `,
        backgroundSize: `${gridLayout.cellSize + gridLayout.gap}px ${gridLayout.cellSize + gridLayout.gap}px`,
        backgroundPosition: '16px 16px', // Match container padding
      }}
    >
      {/* Show hover preview */}
      {hoverPosition && draggedWidget && (
        <div
          className={cn(
            "border-2 transition-colors duration-150 rounded-md z-20",
            isValidDrop ? 'bg-primary/20 border-primary' : 'bg-destructive/20 border-destructive'
          )}
          style={{
            gridColumn: `${hoverPosition.col + 1} / span ${draggedWidget.gridPosition.width}`,
            gridRow: `${hoverPosition.row + 1} / span ${draggedWidget.gridPosition.height}`,
          }}
        />
      )}
      
      {/* Show occupied areas */}
      {widgets.filter(w => w.id !== draggedWidget?.id).map(widget => (
        <div
          key={widget.id}
          className="bg-muted/40 border border-border/30 rounded-md z-10"
          style={{
            gridColumn: `${widget.gridPosition.col + 1} / span ${widget.gridPosition.width}`,
            gridRow: `${widget.gridPosition.row + 1} / span ${widget.gridPosition.height}`,
          }}
        />
      ))}
    </div>
  );
};