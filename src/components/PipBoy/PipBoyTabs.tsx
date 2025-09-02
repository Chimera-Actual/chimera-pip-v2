import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Package, Database, Map, Radio, Settings, Plus } from 'lucide-react';
import { PipBoyTab } from './PipBoyContainer';
import { useTabManager } from '@/hooks/useTabManager';
import { TabEditor } from '@/components/tabManagement/TabEditor';
import { TabContextMenu } from './TabContextMenu';
import { TabConfiguration } from '@/types/tabManagement';

interface PipBoyTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const getTabIcon = (name: string, iconName?: string) => {
  // Default icons for core tabs
  const defaultIcons: Record<string, any> = {
    'STAT': BarChart3,
    'INV': Package, 
    'DATA': Database,
    'MAP': Map,
    'RADIO': Radio
  };
  
  return defaultIcons[name] || Settings;
};

export const PipBoyTabs: React.FC<PipBoyTabsProps> = ({ currentTab, onTabChange }) => {
  const { tabs, createTab, isLoading } = useTabManager();
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

  const handleCreateTab = async (tabData: any) => {
    await createTab(tabData);
    setShowTabEditor(false);
  };

  const handleEditTab = (tab: TabConfiguration) => {
    setEditingTab(tab);
    setShowTabEditor(true);
  };

  const handleCloseEditor = () => {
    setShowTabEditor(false);
    setEditingTab(null);
  };

  if (isLoading) {
    return (
      <div className="flex border-b border-pip-border animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 h-16 border-r border-pip-border last:border-r-0 bg-pip-bg-secondary/30" />
        ))}
      </div>
    );
  }
  return (
    <>
      <div className="flex border-b border-pip-border">
        {tabs.map((tab) => {
          const Icon = getTabIcon(tab.name, tab.icon);
          const isActive = currentTab === tab.name;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              title={tab.description}
              className={`relative flex-1 h-16 rounded-none border-r border-pip-border last:border-r-0 font-pip-display font-semibold transition-all group ${
                isActive 
                  ? 'pip-tab-active text-primary' 
                  : 'text-pip-text-secondary hover:text-primary hover:bg-pip-bg-secondary/50'
              }`}
              onClick={() => onTabChange(tab.name)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
              style={{ color: tab.color || undefined }}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icon className="h-5 w-5" />
                <span className="text-xs">{tab.name}</span>
              </div>
              
              {/* Tab indicator */}
              <div 
                className={`absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-300 ${
                  isActive ? 'scale-x-100' : 'scale-x-0'
                }`}
                style={{ backgroundColor: tab.color || 'hsl(var(--primary))' }}
              />
            </Button>
          );
        })}
        
        {/* Add Tab Button */}
        <Button
          variant="ghost"
          className="h-16 px-4 border-r border-pip-border text-pip-text-secondary hover:text-primary hover:bg-pip-bg-secondary/50 transition-all"
          onClick={() => setShowTabEditor(true)}
          title="Create new tab"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Tab Description */}
      <div className="px-6 py-2 border-b border-pip-border/30">
        <span className="text-xs font-pip-mono text-pip-text-muted italic">
          {tabs.find(t => t.name === currentTab)?.description || 'Custom dashboard tab'}
        </span>
      </div>

      {/* Tab Editor Modal */}
      <TabEditor
        tab={editingTab}
        isOpen={showTabEditor}
        onClose={handleCloseEditor}
        onSave={editingTab ? undefined : handleCreateTab}
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