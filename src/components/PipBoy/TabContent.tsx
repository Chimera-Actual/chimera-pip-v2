import React, { useState } from 'react';
import { CanvasIntegration } from '../canvas/CanvasIntegration';
import { WidgetSelector } from '../canvas/WidgetSelector';
import { WidgetSelectorModal } from '../widgets/WidgetSelectorModal';
import { useWidgetsQuery } from '@/hooks/useWidgetsQuery';
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
  const { 
    widgets, 
    activeWidget, 
    setActiveWidget, 
    isLoading, 
    addWidget 
  } = useWidgetsQuery(tab.id);
  
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [isWidgetSelectorCollapsed, setIsWidgetSelectorCollapsed] = useState(false);
  
  // Only render heavy content when active to minimize work
  if (!active) {
    return null;
  }

  const handleAddWidget = () => {
    setShowWidgetModal(true);
  };

  const handleAddWidgetConfirm = (widgetType: string, settings: any) => {
    addWidget({ widgetType, settings });
    setShowWidgetModal(false);
  };
  
  return (
    <ErrorBoundary fallback={<div className="text-destructive p-4">Tab content failed to load</div>}>
      <div className="flex h-full">
        {/* Widget Selector Sidebar */}
        <WidgetSelector
          activeTab={tab.name}
          widgets={widgets}
          activeWidget={activeWidget}
          isLoading={isLoading}
          onAddWidget={handleAddWidget}
          onSelectWidget={setActiveWidget}
          isCollapsed={isWidgetSelectorCollapsed}
          onToggleCollapsed={() => setIsWidgetSelectorCollapsed(!isWidgetSelectorCollapsed)}
        />
        
        {/* Main Widget Display Area */}
        <div className="flex-1 h-full">
          <CanvasIntegration 
            tab={tab.id} 
            widgets={widgets}
            activeWidget={activeWidget}
            isLoading={isLoading}
            isActive={active}
            onDeleteWidget={async (widgetId) => {
              // Implementation handled in useWidgetsQuery
              return true;
            }}
            onUpdateWidget={async (widgetId, updates) => {
              // Implementation handled in useWidgetsQuery
              return true;
            }}
            onToggleCollapsed={async (widget) => {
              // Implementation handled in useWidgetsQuery
              return true;
            }}
          />
        </div>
      </div>

      {/* Widget Selection Modal */}
      <WidgetSelectorModal
        isOpen={showWidgetModal}
        onClose={() => setShowWidgetModal(false)}
        activeTab={tab.name}
        onAddWidget={handleAddWidgetConfirm}
      />
    </ErrorBoundary>
  );
});