import React, { useState, memo, useCallback, useEffect, useMemo } from 'react';
import { useMemoizedSelector } from '@/features/state-management/hooks/useMemoizedSelector';
import { CanvasIntegration } from '@/components/canvas/CanvasIntegration';
import { DashboardHeaderSection, DashboardModals } from '@/features/dashboard';
import { WidgetSelectorModal } from '@/components/widgets/WidgetSelectorModal';
import { useTabManagerContext } from '@/contexts/TabManagerContext';
import { useTabWidgets } from '@/hooks/useTabWidgets';
import { TabWidgetDrawer } from '@/components/canvas/TabWidgetDrawer';
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
  const [tabWidgetData, setTabWidgetData] = useState<Record<string, ReturnType<typeof useTabWidgets>>>({});
  
  const { tabs, updateTab, deleteTab, archiveTab } = useTabManagerContext();
  const { toast } = useToast();
  const { layoutMode } = useTheme();
  
  // Memoized callback to receive widget data from TabWidgetManager components
  const handleTabDataReady = useCallback((tabName: string, data: ReturnType<typeof useTabWidgets>) => {
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
    const result = await currentTabData?.addWidget?.(widgetType, settings);
    if (result) {
      toast({
        title: "Widget Added",
        description: `${widgetType} widget has been added successfully`,
      });
    }
    setShowWidgetSelector(false);
  }, [currentTabData?.addWidget, toast]);

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
          <TabWidgetDrawer 
            activeTab={activeTab} 
            widgets={currentTabData?.widgets || []}
            isLoading={currentTabData?.isLoading || false}
            onAddWidget={handleShowWidgetSelector}
            onToggleVisibility={currentTabData?.toggleVisibility}
            isCollapsed={isDrawerCollapsed}
            onToggleCollapsed={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
          />
        </div>
      )}
      
      {/* Main Content Area - preserve all tab content */}
      <main className={cn(
        "dashboard-content flex-1 min-h-0 flex flex-col px-6 pb-6 pt-3 transition-all duration-300",
        layoutMode === 'tabbed' ? (isDrawerCollapsed ? "ml-12" : "ml-80") : "",
        className
      )}>
        {/* Only show header section in tabbed mode */}
        {layoutMode === 'tabbed' && (
          <DashboardHeaderSection
            activeTab={activeTab}
            description={currentTab?.description}
            onShowTabEditor={() => setShowTabEditor(true)}
            onArchiveTab={handleArchiveTab}
            onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
            isDefaultTab={currentTab?.isDefault || false}
          />
        )}

        {/* Canvas Content Container - Optimized tab rendering */}
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
                isLoading={tab.data?.isLoading || false}
                isActive={tab.isActive}
                onDoubleClick={handleShowWidgetSelector}
                onDeleteWidget={tab.data?.deleteWidget}
                onUpdateWidget={tab.data?.updateWidget}
                onToggleCollapsed={tab.data?.toggleCollapsed}
              />
            </div>
          ))}
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
      </main>
    </div>
  );
});