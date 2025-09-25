import React, { useState, memo, useCallback, useEffect, useMemo } from 'react';
import { useMemoizedSelector } from '@/features/state-management/hooks/useMemoizedSelector';
import { CanvasIntegration } from '@/components/canvas/CanvasIntegration';
import { DashboardModals } from '@/features/dashboard';
import { WidgetSelectorModal } from '@/components/widgets/WidgetSelectorModal';
import { useTabManagerContext } from '@/contexts/TabManagerContext';
import { useWidgetsQuery } from '@/hooks/useWidgetsQuery';
import { WidgetSelector } from '@/components/canvas/WidgetSelector';
import { TabWidgetManager } from './TabWidgetManager';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/theme';

interface DashboardContentProps {
  activeTab: string;
  className?: string;
}

export const DashboardContent = memo<DashboardContentProps>(({
  activeTab,
  className
}) => {
  const [showTabEditor, setShowTabEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [tabWidgetData, setTabWidgetData] = useState<Record<string, ReturnType<typeof useWidgetsQuery>>>({});
  
  const { tabs, updateTab, deleteTab, archiveTab } = useTabManagerContext();
  const { toast } = useToast();
  const { layoutMode } = useTheme();
  
  // Memoized callback to receive widget data from TabWidgetManager components
  const handleTabDataReady = useCallback((tabName: string, data: ReturnType<typeof useWidgetsQuery>) => {
    setTabWidgetData(prev => ({
      ...prev,
      [tabName]: data
    }));
  }, []);

  // Memoize expensive tab data operations
  const memoizedTabData = useMemoizedSelector(
    { tabWidgetData, activeTab, tabs },
    ({ tabWidgetData, activeTab, tabs }) => ({
      currentTabData: tabWidgetData[activeTab],
      currentTab: tabs.find(tab => tab.name === activeTab),
      tabsWithData: tabs.map(tab => ({
        ...tab,
        data: tabWidgetData[tab.name],
        isActive: activeTab === tab.name
      }))
    }),
    [tabWidgetData, activeTab, tabs]
  );
  
  // Extract memoized data
  const { currentTabData, currentTab, tabsWithData } = memoizedTabData;

  // Note: Real-time subscriptions are handled in useWidgetsQuery hook
  // No need for duplicate subscription here

  const handleArchiveTab = useCallback(async () => {
    if (currentTab && !currentTab.isDefault) {
      await archiveTab(currentTab.id);
    }
  }, [currentTab, archiveTab]);

  const handleDeleteTab = useCallback(async () => {
    if (currentTab && !currentTab.isDefault) {
      await deleteTab(currentTab.id);
      setShowDeleteConfirm(false);
    }
  }, [currentTab, deleteTab]);

  const handleSaveTab = useCallback(async (tabData: any) => {
    if (currentTab) {
      await updateTab(currentTab.id, tabData);
      setShowTabEditor(false);
    }
  }, [currentTab, updateTab]);

  const handleAddWidget = useCallback(async (widgetType: string, settings: any) => {
    if (!currentTabData) {
      toast({
        title: "Error",
        description: "Select a tab before adding widgets",
        variant: "destructive"
      });
      return;
    }
    
    currentTabData.addWidget({ widgetType, settings });
    setShowWidgetSelector(false);
  }, [currentTabData, toast]);

  const handleShowWidgetSelector = useCallback(() => {
    setShowWidgetSelector(true);
  }, []);

  return (
    <div className="h-full flex relative">
      {/* Render TabWidgetManager components for each tab - this properly uses hooks at top level */}
      {tabs.map((tab) => (
        <TabWidgetManager
          key={tab.id}
          tab={tab}
          onDataReady={handleTabDataReady}
        />
      ))}
      
      {/* Only show sidebar in tabbed mode */}
      {layoutMode === 'tabbed' && (
        <div className="relative h-full">
          <WidgetSelector 
            activeTab={activeTab} 
            widgets={currentTabData?.widgets || []}
            activeWidget={currentTabData?.activeWidget || null}
            isLoading={currentTabData?.isLoading || false}
            onAddWidget={handleShowWidgetSelector}
            onSelectWidget={(widgetId) => {
              currentTabData?.setActiveWidget(widgetId);
            }}
            isCollapsed={isDrawerCollapsed}
            onToggleCollapsed={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
          />
        </div>
      )}
      
      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300 h-full flex flex-col px-6 pb-6 pt-3",
        layoutMode === 'tabbed' && !isDrawerCollapsed ? "ml-2" : "ml-0"
      )}>
        {/* Main Content */}
        <div className="widget-content flex-1 min-h-0 relative">
          {tabsWithData.map((tab) => (
            <div
              key={tab.name}
              className={cn(
                "absolute inset-0 overflow-auto transition-opacity duration-200",
                tab.isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}
            >
              <CanvasIntegration 
                tab={tab.name}
                widgets={tab.data?.widgets || []}
                activeWidget={tab.data?.activeWidget || null}
                isLoading={tab.data?.isLoading || false}
                isActive={tab.isActive}
                onDoubleClick={handleShowWidgetSelector}
                onDeleteWidget={async (widgetId) => {
                  currentTabData?.deleteWidget(widgetId);
                  return true;
                }}
                onUpdateWidget={async (widgetId, updates) => {
                  currentTabData?.updateWidget({ widgetId, updates });
                  return true;
                }}
                onToggleCollapsed={async (widget) => {
                  currentTabData?.updateWidget({ widgetId: widget.id, updates: { is_collapsed: !widget.is_collapsed } });
                  return true;
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      <WidgetSelectorModal
        isOpen={showWidgetSelector}
        onClose={() => setShowWidgetSelector(false)}
        onAddWidget={handleAddWidget}
        activeTab={activeTab}
      />

      <DashboardModals
        showTabEditor={showTabEditor}
        onCloseTabEditor={() => setShowTabEditor(false)}
        onSaveTab={handleSaveTab}
        currentTab={currentTab}
        showDeleteConfirm={showDeleteConfirm}
        onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
        onDeleteTab={handleDeleteTab}
      />
    </div>
  );
});