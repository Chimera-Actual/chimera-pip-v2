import React from 'react';
import { GridCanvas } from '@/components/canvas/GridCanvas';

interface CanvasIntegrationProps {
  tab: string;
  className?: string;
  editMode?: boolean;
  onDoubleClick?: () => void;
}

export const CanvasIntegration: React.FC<CanvasIntegrationProps> = ({ 
  tab, 
  className, 
  editMode = false,
  onDoubleClick 
}) => {
  // Pass editMode down to GridCanvas
  return (
    <GridCanvas 
      tab={tab} 
      className={className} 
      editMode={editMode}
      onDoubleClick={onDoubleClick} 
    />
  );
};