import React, { useState, memo, useCallback, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppDrawer } from '@/components/apps/AppDrawer';
import { AppRenderer } from '@/components/apps/AppRenderer';
import { AppSelectorModal } from '@/components/apps/AppSelectorModal';
import { DashboardHeaderSection, DashboardModals } from '@/features/dashboard';
import { useTabManager } from '@/hooks/useTabManager';
import { useAppManager } from '@/hooks/useAppManager';
import { UserApp } from '@/types/appManagement';

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
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [activeApp, setActiveApp] = useState<UserApp | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { tabs, updateTab, deleteTab, archiveTab } = useTabManager();
  const { addApp, getTabApps } = useAppManager();
  
  const currentTab = tabs.find(tab => tab.name === activeTab);

  // Load the first app for the current tab
  useEffect(() => {
    const loadActiveApp = async () => {
      if (activeTab) {
        const apps = await getTabApps(activeTab);
        if (apps.length > 0) {
          setActiveApp(apps[0]); // Use the first app as active
        } else {
          setActiveApp(null);
        }
      }
    };

    loadActiveApp();
  }, [activeTab, getTabApps, refreshKey]);

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

  const handleAddApp = useCallback(async (appId: string, settings: any) => {
    const result = await addApp(appId, activeTab, settings);
    if (result) {
      // Trigger refresh to reload apps
      setRefreshKey(prev => prev + 1);
    }
    setShowAppSelector(false);
  }, [addApp, activeTab]);

  const handleShowAppSelector = useCallback(() => {
    setShowAppSelector(true);
  }, []);

  const handleAppSelect = useCallback((app: UserApp) => {
    setActiveApp(app);
  }, []);

  return (
    <>
      {/* App Drawer */}
      <AppDrawer
        activeTab={activeTab}
        onAddApp={handleShowAppSelector}
        onAppSelect={handleAppSelect}
        activeAppId={activeApp?.id}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header with sidebar trigger */}
        <div className="border-b border-pip-border px-6 py-3">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-pip-text-secondary hover:text-pip-text-primary" />
            <DashboardHeaderSection
              activeTab={activeTab}
              description={currentTab?.description}
              onShowTabEditor={() => setShowTabEditor(true)}
              onArchiveTab={handleArchiveTab}
              onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
              onShowWidgetSelector={handleShowAppSelector}
              onToggleEditMode={() => {}} // No edit mode in app system
              editMode={false}
              isDefaultTab={currentTab?.isDefault || false}
            />
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-hidden">
          <AppRenderer 
            app={activeApp} 
            className="w-full h-full"
          />
        </div>
      </main>

      {/* Modals */}
      <AppSelectorModal
        isOpen={showAppSelector}
        onClose={() => setShowAppSelector(false)}
        onAddApp={handleAddApp}
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
    </>
  );
});