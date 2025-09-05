import React from 'react';
import { CanvasProvider } from '@/contexts/CanvasContext';
import { ModernWidgetCanvas } from './ModernWidgetCanvas';

interface CanvasIntegrationProps {
  tab: string;
  className?: string;
}

export const CanvasIntegration: React.FC<CanvasIntegrationProps> = ({ tab, className }) => {
  return (
    <CanvasProvider>
      <ModernWidgetCanvas tab={tab} className={className} />
    </CanvasProvider>
  );
};