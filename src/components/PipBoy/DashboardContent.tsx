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
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className={`font-pip-mono text-xs border-pip-border hover:border-primary transition-colors ${
              isDragMode ? 'bg-primary/20 border-primary text-primary' : ''
            }`}
            onClick={() => setIsDragMode(!isDragMode)}
          >
            <MoveIcon className="w-4 h-4 mr-2" />
            {isDragMode ? 'Exit Edit' : 'Edit Layout'}
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