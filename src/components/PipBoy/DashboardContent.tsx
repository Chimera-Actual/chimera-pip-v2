import React, { useState, memo, useCallback, useEffect } from 'react';
import { CanvasIntegration } from '@/components/canvas/CanvasIntegration';
import { DashboardHeaderSection, DashboardModals } from '@/features/dashboard';
import { WidgetSelectorModal } from '@/components/widgets/WidgetSelectorModal';
import { useTabManagerContext } from '@/contexts/TabManagerContext';
import { useTabWidgets } from '@/hooks/useTabWidgets';
import { TabWidgetDrawer } from '@/components/canvas/TabWidgetDrawer';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  
  // Centralized widget state management
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
  } = useTabWidgets(activeTab);
  
  const currentTab = tabs.find(tab => tab.name === activeTab);

  // Real-time subscription for widget changes
  useEffect(() => {
    if (!activeTab) return;

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
          loadWidgets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, loadWidgets]);

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
    const result = await addWidget(widgetType, settings);
    if (result) {
      toast({
        title: "Widget Added",
        description: `${widgetType} widget has been added successfully`,
      });
    }
    setShowWidgetSelector(false);
  }, [addWidget, toast]);

  const handleShowWidgetSelector = useCallback(() => {
    setShowWidgetSelector(true);
  }, []);

  return (
    <div className="h-full flex relative">
      {/* Sidebar Container */}
      <div className="relative h-full">
        <TabWidgetDrawer 
          activeTab={activeTab} 
          widgets={widgets}
          isLoading={widgetsLoading}
          onAddWidget={handleShowWidgetSelector}
          onToggleVisibility={toggleVisibility}
          isCollapsed={isDrawerCollapsed}
          onToggleCollapsed={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
        />
      </div>
      
      {/* Main Content Area */}
      <main className={cn(
        "dashboard-content flex-1 min-h-0 flex flex-col px-6 pb-6 pt-3 transition-all duration-300",
        isDrawerCollapsed ? "ml-12" : "ml-80",
        className
      )}>
        <DashboardHeaderSection
          activeTab={activeTab}
          description={currentTab?.description}
          onShowTabEditor={() => setShowTabEditor(true)}
          onArchiveTab={handleArchiveTab}
          onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
          isDefaultTab={currentTab?.isDefault || false}
        />

        {/* Canvas Content - Controlled scrolling container */}
        <div className="widget-content flex-1 min-h-0 overflow-auto">
          <CanvasIntegration 
            tab={activeTab}
            widgets={widgets}
            isLoading={widgetsLoading}
            onDoubleClick={handleShowWidgetSelector}
            onDeleteWidget={deleteWidget}
            onUpdateWidget={updateWidget}
            onToggleCollapsed={toggleCollapsed}
          />
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