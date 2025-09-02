import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidgets } from '@/contexts/WidgetContext';
import { WidgetRenderer } from './WidgetRegistry';
import { WidgetType } from '@/types/widgets';
import { cn } from '@/lib/utils';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';

interface WidgetGridProps {
  tab: string;
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({ tab, className }) => {
  const { getWidgetsByTab, addWidget, isLoading } = useWidgets();
  const [showAdvancedCatalog, setShowAdvancedCatalog] = useState(false);
  
  const widgets = getWidgetsByTab(tab as any);

  const handleAddWidget = async (type: WidgetType) => {
    const widget = await addWidget(type, tab as any);
    if (widget) {
      setShowAdvancedCatalog(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Existing Widgets */}
      <div className="grid gap-6 auto-fit-widgets">
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-slot">
            <WidgetRenderer widget={widget} />
          </div>
        ))}
      </div>

      {/* Add Widget Button */}
      <Button
        variant="outline"
        className="w-full h-32 border-2 border-dashed border-pip-border hover:border-primary/50 bg-transparent hover:bg-pip-bg-secondary/30 transition-all duration-200 group"
        disabled={isLoading}
        onClick={() => setShowAdvancedCatalog(true)}
      >
        <div className="flex flex-col items-center gap-2 text-pip-text-muted group-hover:text-primary transition-colors">
          <Plus className="h-8 w-8" />
          <span className="font-pip-mono text-sm">ADD WIDGET</span>
        </div>
      </Button>

      {/* Advanced Widget Catalog */}
      {showAdvancedCatalog && (
        <AdvancedWidgetCatalog
          currentTab={tab}
          onAddWidget={handleAddWidget}
          onClose={() => setShowAdvancedCatalog(false)}
        />
      )}

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-12">
          <div className="pip-special-stat p-8 max-w-md mx-auto">
            <div className="text-pip-text-muted font-pip-mono mb-4">
              No widgets in this tab yet
            </div>
            <div className="text-xs text-pip-text-secondary font-pip-mono">
              Click "ADD WIDGET" above to get started
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS for auto-fitting widget grid
const gridStyles = `
  .auto-fit-widgets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  @media (min-width: 1024px) {
    .auto-fit-widgets {
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    }
  }
  
  @media (min-width: 1536px) {
    .auto-fit-widgets {
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = gridStyles;
  document.head.appendChild(styleSheet);
}
