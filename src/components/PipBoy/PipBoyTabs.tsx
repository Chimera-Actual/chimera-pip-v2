import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Package, Database, Map, Radio } from 'lucide-react';
import { PipBoyTab } from './PipBoyContainer';

interface PipBoyTabsProps {
  currentTab: PipBoyTab;
  onTabChange: (tab: PipBoyTab) => void;
}

const tabs = [
  { id: 'STAT' as PipBoyTab, label: 'STAT', icon: BarChart3, description: 'Statistics & Character' },
  { id: 'INV' as PipBoyTab, label: 'INV', icon: Package, description: 'Inventory & Assets' },
  { id: 'DATA' as PipBoyTab, label: 'DATA', icon: Database, description: 'Information Hub' },
  { id: 'MAP' as PipBoyTab, label: 'MAP', icon: Map, description: 'Location & Navigation' },
  { id: 'RADIO' as PipBoyTab, label: 'RADIO', icon: Radio, description: 'Media & Entertainment' },
];

export const PipBoyTabs: React.FC<PipBoyTabsProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className="flex border-b border-pip-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        
        return (
          <Button
            key={tab.id}
            variant="ghost"
            className={`flex-1 h-14 rounded-none border-r border-pip-border last:border-r-0 font-pip-display font-semibold transition-all ${
              isActive 
                ? 'pip-tab-active text-primary' 
                : 'text-pip-text-secondary hover:text-primary hover:bg-pip-bg-secondary/50'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex flex-col items-center space-y-1">
              <Icon className="h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
};