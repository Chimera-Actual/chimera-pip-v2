import React from 'react';
import { CanvasIntegration } from '../canvas/CanvasIntegration';
import { useTabWidgets } from '@/hooks/useTabWidgets';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface Tab {
  id: string;
  name: string;
  [key: string]: any;
}

interface TabContentProps {
  tab: Tab;
  active: boolean;
}

export const TabContent = React.memo(function TabContent({ tab, active }: TabContentProps) {
  const tabWidgetsData = useTabWidgets(tab.id); // Safe at top level
  
  // Only render heavy content when active to minimize work
  if (!active) {
    return null;
  }
  
  return (
    <ErrorBoundary fallback={<div className="text-destructive p-4">Tab content failed to load</div>}>
      <CanvasIntegration 
        tab={tab.id} 
        widgets={tabWidgetsData.widgets}
        isLoading={tabWidgetsData.isLoading}
        isActive={active}
        onDeleteWidget={tabWidgetsData.deleteWidget}
        onUpdateWidget={tabWidgetsData.updateWidget}
        onToggleCollapsed={tabWidgetsData.toggleCollapsed}
      />
    </ErrorBoundary>
  );
});