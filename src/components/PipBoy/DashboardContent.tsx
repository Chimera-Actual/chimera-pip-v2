import React, { useState, memo, useCallback } from 'react';
import { CanvasIntegration } from '@/components/canvas/CanvasIntegration';
import { DashboardHeaderSection, DashboardModals } from '@/features/dashboard';
import { useWidgets } from '@/contexts/WidgetContext';
import { useTabManager } from '@/hooks/useTabManager';
import { WidgetType } from '@/types/widgets';

interface DashboardContentProps {
  activeTab: string;
  className?: string;
}

export const DashboardContent = memo<DashboardContentProps>(({
  activeTab,
  className
}) => {
  const [showAdvancedCatalog, setShowAdvancedCatalog] = useState(false);
  const [showTabEditor, setShowTabEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { addWidget } = useWidgets();
  const { tabs, updateTab, deleteTab, archiveTab } = useTabManager();
  
  const currentTab = tabs.find(tab => tab.name === activeTab);

  const handleAddWidget = useCallback(async (type: WidgetType) => {
    await addWidget(type, activeTab as any);
    setShowAdvancedCatalog(false);
  }, [addWidget, activeTab]);

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


  return (
    <main className={`dashboard-content flex-1 px-6 pb-6 pt-3 ${className || ''}`}>
      <DashboardHeaderSection
        activeTab={activeTab}
        onShowCatalog={() => setShowAdvancedCatalog(true)}
        onShowTabEditor={() => setShowTabEditor(true)}
        onArchiveTab={handleArchiveTab}
        onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
        isDefaultTab={currentTab?.isDefault || false}
      />

      {/* Modern Widget Canvas */}
      <div className="widget-content">
        <CanvasIntegration tab={activeTab} />
      </div>

      <DashboardModals
        showAdvancedCatalog={showAdvancedCatalog}
        onCloseAdvancedCatalog={() => setShowAdvancedCatalog(false)}
        onAddWidget={handleAddWidget}
        activeTab={activeTab}
        showTabEditor={showTabEditor}
        onCloseTabEditor={() => setShowTabEditor(false)}
        onSaveTab={handleSaveTab}
        currentTab={currentTab}
        showDeleteConfirm={showDeleteConfirm}
        onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
        onDeleteTab={handleDeleteTab}
      />
    </main>
  );
}, (prevProps, nextProps) => {
  return prevProps.activeTab === nextProps.activeTab &&
         prevProps.className === nextProps.className;
});