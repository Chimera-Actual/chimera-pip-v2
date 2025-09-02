import React, { useState } from 'react';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { Button } from '@/components/ui/button';
import { PlusIcon, MoveIcon, LayersIcon } from 'lucide-react';

interface DashboardContentProps {
  activeTab: string;
  className?: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  className
}) => {
  const [isDragMode, setIsDragMode] = useState(false);

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
        
        <div className="flex items-center gap-3 group">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 font-pip-mono text-xs border border-pip-border hover:border-primary ${
              isDragMode ? 'opacity-100 bg-primary/20 border-primary text-primary pip-glow' : 'hover:bg-pip-bg-secondary/50'
            }`}
            onClick={() => setIsDragMode(!isDragMode)}
            title={isDragMode ? 'Exit Edit Mode' : 'Edit Widget Layout'}
          >
            <MoveIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Widget Grid */}
      <div className={`widget-content ${isDragMode ? 'drag-mode' : ''}`}>
        <WidgetGrid tab={activeTab} />
      </div>
    </main>
  );
};