import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';
import { useTabManagerContext } from '@/contexts/TabManagerContext';
import { TabEditor } from '@/components/tabManagement/TabEditor';
import { TabContextMenu } from './TabContextMenu';
import { TabConfiguration } from '@/types/tabManagement';
import { getTabIcon } from '@/utils/iconMapping';
import { cn } from '@/lib/utils';

interface VerticalAppDrawerProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const VerticalAppDrawer: React.FC<VerticalAppDrawerProps> = ({
  currentTab,
  onTabChange,
  className,
}) => {
  const { tabs, createTab, isLoading } = useTabManagerContext();
  const [showTabEditor, setShowTabEditor] = useState(false);
  const [editingTab, setEditingTab] = useState<TabConfiguration | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tab: TabConfiguration;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, tab: TabConfiguration) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tab
    });
  };

  const handleCreateTabAction = useCallback(async (tabData: any) => {
    await createTab(tabData);
    setShowTabEditor(false);
  }, [createTab]);

  const handleUpdateTabAction = useCallback(async (tabData: any) => {
    if (editingTab) {
      // Handle update via context or direct API call
      setShowTabEditor(false);
      setEditingTab(null);
    }
  }, [editingTab]);

  const handleEditTab = useCallback((tab: TabConfiguration) => {
    setEditingTab(tab);
    setShowTabEditor(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setShowTabEditor(false);
    setEditingTab(null);
  }, []);

  if (isLoading) {
    return (
      <aside className={cn(
        "h-full w-64 bg-pip-bg-secondary/95 border-r border-pip-border backdrop-blur-sm animate-pulse",
        className
      )}>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-pip-bg-secondary/30 rounded" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className={cn(
        "h-full w-64 bg-pip-bg-secondary/95 border-r border-pip-border backdrop-blur-sm transition-all duration-300",
        className
      )}>
        {/* Drawer Header */}
        <div className="p-4 border-b border-pip-border">
          <h2 className="text-sm font-pip-display font-semibold text-pip-text-bright uppercase tracking-wider">
            Applications
          </h2>
        </div>

        {/* App List */}
        <div className="p-2 space-y-1 flex-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.name;
            const Icon = getTabIcon(tab.name, tab.icon);
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  "w-full flex items-center justify-start gap-3 px-3 py-3 text-sm font-mono uppercase transition-all duration-200",
                  isActive 
                    ? 'bg-primary/20 text-primary border-l-2 border-primary shadow-lg' 
                    : 'text-pip-text-secondary hover:text-primary hover:bg-primary/10 border-l-2 border-transparent'
                )}
                onClick={() => onTabChange(tab.name)}
                onContextMenu={(e) => handleContextMenu(e, tab)}
                style={{ color: isActive ? (tab.color || undefined) : undefined }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-left flex-1">
                  {tab.name}
                </span>
                
                {/* Active indicator glow */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-current opacity-80 shadow-[0_0_8px_currentColor]"
                    style={{ color: tab.color || 'hsl(var(--primary))' }}
                  />
                )}
              </Button>
            );
          })}
        </div>

        {/* Drawer Footer - Management Actions */}
        <div className="p-4 border-t border-pip-border">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setShowTabEditor(true)}
              title="Add new application tab"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add App
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-2"
              title="Manage tabs"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Tab Editor Modal */}
      <TabEditor
        tab={editingTab}
        isOpen={showTabEditor}
        onClose={handleCloseEditor}
        onSave={editingTab ? handleUpdateTabAction : handleCreateTabAction}
        existingTabs={tabs.map(t => ({ name: t.name, isDefault: t.isDefault, id: t.id }))}
      />

      {/* Context Menu */}
      {contextMenu && (
        <TabContextMenu
          tab={contextMenu.tab}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onEdit={handleEditTab}
        />
      )}
    </>
  );
};