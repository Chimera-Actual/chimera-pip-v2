import React, { useState, memo, useCallback, useEffect } from 'react';
import { CanvasIntegration } from '@/components/canvas/CanvasIntegration';
import { DashboardHeaderSection, DashboardModals } from '@/features/dashboard';
import { WidgetSelectorModal } from '@/components/widgets/WidgetSelectorModal';
import { useTabManagerContext } from '@/contexts/TabManagerContext';
import { useTabWidgets } from '@/hooks/useTabWidgets';
import { TabWidgetDrawer } from '@/components/canvas/TabWidgetDrawer';
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
  
  const { tabs, updateTab, deleteTab, archiveTab } = useTabManagerContext();
  const { toast } = useToast();
  const { layoutMode } = useTheme();
  
  // Get widget data for all tabs to preserve state
  const tabWidgetData = tabs.reduce((acc, tab) => {
    const { 
      widgets, 
      isLoading: widgetsLoading, 
      error: widgetsError,
      addWidget,
      deleteWidget,
      updateWidget,
      toggleCollapsed,
      toggleVisibility,
      loadWidgets
    } = useTabWidgets(tab.name);
    
    acc[tab.name] = {
      widgets,
      isLoading: widgetsLoading,
      error: widgetsError,
      addWidget,
      deleteWidget,
      updateWidget,
      toggleCollapsed,
      toggleVisibility,
      loadWidgets
    };
    return acc;
  }, {} as Record<string, any>);
  
  // Get current tab data
  const currentTabData = tabWidgetData[activeTab];
  const currentTab = tabs.find(tab => tab.name === activeTab);

  // Real-time subscription for widget changes
  useEffect(() => {
    if (!activeTab || !currentTabData) return;

    const channel = supabase
      .channel(`widgets-${activeTab}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_widgets',
          filter: `tab_assignment=eq.${activeTab}`
        },
        (payload) => {
          console.log('Widget change detected:', payload);
          // Reload widgets when any change occurs
          currentTabData.loadWidgets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, currentTabData]);

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
    const result = await currentTabData?.addWidget(widgetType, settings);
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

        {/* Canvas Content Container - All tabs rendered but only active visible */}
        <div className="widget-content flex-1 min-h-0 relative">
          {tabs.map((tab) => {
            const tabData = tabWidgetData[tab.name];
            const isActive = activeTab === tab.name;
            
            return (
              <div
                key={tab.name}
                className={cn(
                  "absolute inset-0 overflow-auto transition-opacity duration-200",
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
              >
                <CanvasIntegration 
                  tab={tab.name}
                  widgets={tabData?.widgets || []}
                  isLoading={tabData?.isLoading || false}
                  onDoubleClick={handleShowWidgetSelector}
                  onDeleteWidget={tabData?.deleteWidget}
                  onUpdateWidget={tabData?.updateWidget}
                  onToggleCollapsed={tabData?.toggleCollapsed}
                />
              </div>
            );
          })}
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