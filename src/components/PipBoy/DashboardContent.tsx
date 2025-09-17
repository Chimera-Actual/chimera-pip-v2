import React, { useState, memo, useCallback } from 'react';
import { CanvasIntegration } from '@/components/canvas/CanvasIntegration';
import { DashboardHeaderSection, DashboardModals } from '@/features/dashboard';
import { useTabManager } from '@/hooks/useTabManager';

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
  
  const { tabs, updateTab, deleteTab, archiveTab } = useTabManager();
  
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

  return (
    <main className={`dashboard-content flex-1 px-6 pb-6 pt-3 ${className || ''}`}>
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
        <CanvasIntegration tab={activeTab} />
      </div>

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
  );
});