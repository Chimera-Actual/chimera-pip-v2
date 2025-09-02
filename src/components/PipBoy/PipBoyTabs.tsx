import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Package, Database, Map, Radio } from 'lucide-react';
import { PipBoyTab } from './PipBoyContainer';

interface PipBoyTabsProps {
  currentTab: PipBoyTab;
  onTabChange: (tab: PipBoyTab) => void;
}

const tabs = [
  { id: 'STAT' as PipBoyTab, label: 'STAT', icon: BarChart3, description: 'Character Statistics & System Status', shortcut: '1' },
  { id: 'INV' as PipBoyTab, label: 'INV', icon: Package, description: 'Digital Inventory & File Management', shortcut: '2' },
  { id: 'DATA' as PipBoyTab, label: 'DATA', icon: Database, description: 'Information & Communication Hub', shortcut: '3' },
  { id: 'MAP' as PipBoyTab, label: 'MAP', icon: Map, description: 'Location Services & Navigation', shortcut: '4' },
  { id: 'RADIO' as PipBoyTab, label: 'RADIO', icon: Radio, description: 'Media & Entertainment Center', shortcut: '5' },
];

export const PipBoyTabs: React.FC<PipBoyTabsProps> = ({ currentTab, onTabChange }) => {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      const tabIndex = parseInt(key) - 1;
      
      if (tabIndex >= 0 && tabIndex < tabs.length && !e.ctrlKey && !e.altKey) {
        const targetTab = tabs[tabIndex];
        if (targetTab && targetTab.id !== currentTab) {
          onTabChange(targetTab.id);
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentTab, onTabChange]);

  return (
    <div>
      <div className="flex border-b border-pip-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              title={`${tab.description} (Press ${tab.shortcut})`}
              className={`relative flex-1 h-16 rounded-none border-r border-pip-border last:border-r-0 font-pip-display font-semibold transition-all group ${
                isActive 
                  ? 'pip-tab-active text-primary' 
                  : 'text-pip-text-secondary hover:text-primary hover:bg-pip-bg-secondary/50'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icon className="h-5 w-5" />
                <span className="text-xs">{tab.label}</span>
                <span className="text-xs opacity-50 font-pip-mono">{tab.shortcut}</span>
              </div>
              
              {/* Tab indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-transform duration-300 ${
                isActive ? 'scale-x-100' : 'scale-x-0'
              }`} />
            </Button>
          );
        })}
      </div>
      
      {/* Tab Description */}
      <div className="px-6 py-2 border-b border-pip-border/30">
        <span className="text-xs font-pip-mono text-pip-text-muted italic">
          {tabs.find(t => t.id === currentTab)?.description}
        </span>
      </div>
    </div>
  );
};