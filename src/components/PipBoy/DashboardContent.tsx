import React, { useState, memo, useCallback, useEffect } from 'react';
import { CanvasIntegration } from '@/components/canvas/CanvasIntegration';
import { DashboardHeaderSection, DashboardModals } from '@/features/dashboard';
import { WidgetSelectorModal } from '@/components/widgets/WidgetSelectorModal';
import { useTabManager } from '@/hooks/useTabManager';
import { useWidgetManager } from '@/hooks/useWidgetManager';
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  
  const { tabs, updateTab, deleteTab, archiveTab } = useTabManager();
  const { addWidget } = useWidgetManager();
  
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
    const result = await addWidget(widgetType, activeTab, settings);
    if (result) {
      // Trigger a refresh of the canvas
      setRefreshKey(prev => prev + 1);
    }
    setShowWidgetSelector(false);
  }, [addWidget, activeTab]);

  const handleShowWidgetSelector = useCallback(() => {
    setShowWidgetSelector(true);
  }, []);

  return (
    <div className="relative">
      <TabWidgetDrawer 
        activeTab={activeTab} 
        onAddWidget={handleShowWidgetSelector}
        isCollapsed={isDrawerCollapsed}
        onToggleCollapsed={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
      />
      <main className={`dashboard-content flex-1 px-6 pb-6 pt-3 transition-all duration-300 ${
        isDrawerCollapsed ? 'ml-12' : 'ml-80'
      } ${className || ''}`}>
        <DashboardHeaderSection
          activeTab={activeTab}
          description={currentTab?.description}
          onShowTabEditor={() => setShowTabEditor(true)}
          onArchiveTab={handleArchiveTab}
          onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
          isDefaultTab={currentTab?.isDefault || false}
        />

        {/* Canvas Content */}
        <div className="widget-content">
          <CanvasIntegration 
            key={`${activeTab}-${refreshKey}`}
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