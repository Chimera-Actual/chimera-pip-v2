import React, { useState, memo, useCallback } from 'react';
import { CanvasIntegration } from '@/components/canvas/CanvasIntegration';
import { DashboardHeaderSection, DashboardModals } from '@/features/dashboard';
import { WidgetSelectorModal } from '@/components/widgets/WidgetSelectorModal';
import { useTabManagerContext } from '@/contexts/TabManagerContext';
import { useTabWidgets } from '@/hooks/useTabWidgets';
import { TabWidgetDrawer } from '@/components/canvas/TabWidgetDrawer';

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
  const { addWidget } = useTabWidgets(activeTab);
  
  const currentTab = tabs.find(tab => tab.name === activeTab);

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
    setShowWidgetSelector(false);
  }, [addWidget]);

  const handleShowWidgetSelector = useCallback(() => {
    setShowWidgetSelector(true);
  }, []);

  return (
    <div className="h-full flex relative">
      {/* Fixed Sidebar */}
      <div className="relative">
        <TabWidgetDrawer 
          activeTab={activeTab} 
          onAddWidget={handleShowWidgetSelector}
          isCollapsed={isDrawerCollapsed}
          onToggleCollapsed={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
        />
      </div>
      
      {/* Main Content Area */}
      <main className={`dashboard-content flex-1 min-h-0 flex flex-col px-6 pb-6 pt-3 transition-all duration-300 ${className || ''}`}>
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
            onDoubleClick={handleShowWidgetSelector}
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