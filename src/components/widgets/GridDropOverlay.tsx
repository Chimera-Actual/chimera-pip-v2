import React from 'react';
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
  const maxRows = Math.max(4, Math.max(...widgets.map(w => w.gridPosition.row + w.gridPosition.height)) + 2);

  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < columns; col++) {
      const cellPosition: GridPosition = {
        row,
        col,
        width: draggedWidget?.gridPosition.width || 2,
        height: draggedWidget?.gridPosition.height || 2,
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

      let className = 'grid-drop-cell';
      if (isHovered && isValid) className += ' valid-drop';
      else if (isHovered && !isValid) className += ' invalid-drop';
      else if (isOccupied) className += ' occupied';

      gridCells.push(
        <div
          key={`${row}-${col}`}
          className={className}
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
      className="grid-drop-overlay"
      style={getGridStyle()}
    >
      {gridCells}
    </div>
  );
};