import React from 'react';
import { GridCanvas } from '@/components/canvas/GridCanvas';

interface CanvasIntegrationProps {
  tab: string;
  className?: string;
  onDoubleClick?: () => void;
}

export const CanvasIntegration: React.FC<CanvasIntegrationProps> = ({ tab, className, onDoubleClick }) => {
  // Use the new GridCanvas with drag & drop functionality
  return (
    <GridCanvas 
      tab={tab} 
      className={className} 
      onDoubleClick={onDoubleClick} 
    />
  );
};