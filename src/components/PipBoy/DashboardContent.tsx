import React, { useState } from 'react';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Settings, Plus, Pencil, Archive, Trash2 } from 'lucide-react';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { TabEditor } from '@/components/tabManagement/TabEditor';
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

  const handleTabSettings = () => {
    setShowTabEditor(true);
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

  const getTabDescription = (tab: string) => {
    const descriptions: Record<string, string> = {
      'STAT': 'Character Statistics & System Status',
      'INV': 'Digital Inventory & File Management', 
      'DATA': 'Information & Communication Hub',
      'MAP': 'Location Services & Navigation',
      'RADIO': 'Media & Entertainment Center'
    };
    return descriptions[tab] || 'Custom dashboard tab';
  };

  return (
    <main className={`dashboard-content flex-1 p-6 ${className || ''}`}>
      {/* Content Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-pip-border">
        <div className="flex items-baseline gap-4">
          <h2 className="text-3xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
            {activeTab}
          </h2>
          <span className="text-sm text-pip-text-secondary font-pip-mono opacity-70">
            {getTabDescription(activeTab)}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 transition-all duration-200 font-pip-mono text-xs border border-pip-border hover:border-primary hover:bg-pip-bg-secondary/50"
                title="Tab Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowAdvancedCatalog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Widget
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTabSettings}>
                <Pencil className="mr-2 h-4 w-4" />
                Tab Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleArchiveTab}
                disabled={currentTab?.isDefault}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive Tab
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={currentTab?.isDefault}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Tab
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="widget-content">
        <WidgetGrid tab={activeTab} />
      </div>

      {/* Advanced Widget Catalog Modal */}
      {showAdvancedCatalog && (
        <AdvancedWidgetCatalog
          onClose={() => setShowAdvancedCatalog(false)}
          onAddWidget={handleAddWidget}
          currentTab={activeTab as any}
        />
      )}

      {/* Tab Editor Modal */}
      {showTabEditor && currentTab && (
        <TabEditor
          tab={currentTab}
          isOpen={showTabEditor}
          onClose={() => setShowTabEditor(false)}
          onSave={handleSaveTab}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tab</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentTab?.name}"? This action cannot be undone. 
              All widgets in this tab will be moved to the INV tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTab}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Tab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};