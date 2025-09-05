import React, { useState } from 'react';
import { CanvasIntegration } from '@/components/canvas/CanvasIntegration';
import { DashboardHeaderSection, DashboardModals } from '@/features/dashboard';
import { useWidgets } from '@/contexts/WidgetContext';
import { useTabManager } from '@/hooks/useTabManager';
import { WidgetType } from '@/types/widgets';

interface DashboardContentProps {
  activeTab: string;
  className?: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  className
}) => {
  const [showAdvancedCatalog, setShowAdvancedCatalog] = useState(false);
  const [showTabEditor, setShowTabEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { addWidget } = useWidgets();
  const { tabs, updateTab, deleteTab, archiveTab } = useTabManager();
  
  const currentTab = tabs.find(tab => tab.name === activeTab);

  const handleAddWidget = async (type: WidgetType) => {
    await addWidget(type, activeTab as any);
    setShowAdvancedCatalog(false);
  };


  const handleArchiveTab = async () => {
    if (currentTab && !currentTab.isDefault) {
      await archiveTab(currentTab.id);
    }
  };

  const handleDeleteTab = async () => {
    if (currentTab && !currentTab.isDefault) {
      await deleteTab(currentTab.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveTab = async (tabData: any) => {
    if (currentTab) {
      await updateTab(currentTab.id, tabData);
      setShowTabEditor(false);
    }
  };


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
};