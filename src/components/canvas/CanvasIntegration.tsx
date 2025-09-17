import React from 'react';

interface CanvasIntegrationProps {
  tab: string;
  className?: string;
}

export const CanvasIntegration: React.FC<CanvasIntegrationProps> = ({ tab, className }) => {
  return (
    <div className={`canvas-integration ${className || ''}`}>
      <div className="flex items-center justify-center h-96 border-2 border-dashed border-pip-border rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {tab} Content Area
          </h3>
          <p className="text-muted-foreground">
            Ready for new content and features
          </p>
        </div>
      </div>
    </div>
  );
};