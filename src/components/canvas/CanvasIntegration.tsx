import React from 'react';

interface CanvasIntegrationProps {
  tab: string;
  className?: string;
  onDoubleClick?: () => void;
}

export const CanvasIntegration: React.FC<CanvasIntegrationProps> = ({ tab, className, onDoubleClick }) => {
  return (
    <div 
      className={`canvas-integration ${className || ''}`}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex items-center justify-center h-96 border-2 border-dashed border-pip-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {tab} Content Area
          </h3>
          <p className="text-muted-foreground">
            Double-click to add widgets or use the gear menu
          </p>
        </div>
      </div>
    </div>
  );
};