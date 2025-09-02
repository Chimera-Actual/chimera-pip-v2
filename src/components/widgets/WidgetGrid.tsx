import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useWidgets } from '@/contexts/WidgetContext';
import { WidgetRenderer } from './WidgetRegistry';
import { WidgetFactory } from '@/lib/widgetFactory';
import { TabAssignment, WidgetType } from '@/types/widgets';
import { cn } from '@/lib/utils';

interface WidgetGridProps {
  tab: TabAssignment;
  className?: string;
}

const categoryColors = {
  productivity: 'bg-pip-green-primary/20 border-pip-green-primary/50 text-pip-green-primary',
  system: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  data: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
  entertainment: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
};

export const WidgetGrid: React.FC<WidgetGridProps> = ({ tab, className }) => {
  const { getWidgetsByTab, addWidget, isLoading } = useWidgets();
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const widgets = getWidgetsByTab(tab);
  const availableWidgets = WidgetFactory.getAllDefinitions();

  const handleAddWidget = async (type: WidgetType) => {
    const widget = await addWidget(type, tab);
    if (widget) {
      setShowAddDialog(false);
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
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-32 border-2 border-dashed border-pip-border hover:border-primary/50 bg-transparent hover:bg-pip-bg-secondary/30 transition-all duration-200 group"
            disabled={isLoading}
          >
            <div className="flex flex-col items-center gap-2 text-pip-text-muted group-hover:text-primary transition-colors">
              <Plus className="h-8 w-8" />
              <span className="font-pip-mono text-sm">ADD WIDGET</span>
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="pip-terminal border-2 border-pip-border-bright/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-pip-display text-pip-text-bright pip-text-glow">
              Add Widget to {tab} Tab
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(
              availableWidgets.reduce((acc, widget) => {
                if (!acc[widget.category]) {
                  acc[widget.category] = [];
                }
                acc[widget.category].push(widget);
                return acc;
              }, {} as Record<string, typeof availableWidgets>)
            ).map(([category, categoryWidgets]) => (
              <div key={category}>
                <h3 className="font-pip-display font-semibold text-pip-text-bright mb-3 text-sm uppercase tracking-wide">
                  {category}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryWidgets.map((widgetDef) => (
                    <button
                      key={widgetDef.type}
                      onClick={() => handleAddWidget(widgetDef.type)}
                      className="text-left p-4 rounded border border-pip-border bg-pip-bg-secondary/50 hover:border-primary/50 hover:bg-pip-bg-secondary transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-pip-display font-semibold text-pip-text-bright group-hover:text-primary transition-colors">
                          {widgetDef.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', categoryColors[widgetDef.category])}
                        >
                          {category}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-pip-text-muted font-pip-mono">
                        {widgetDef.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-pip-text-secondary font-pip-mono">
                        <span>{widgetDef.defaultSize.width} x {widgetDef.defaultSize.height}</span>
                        <span className="text-pip-green-primary">+ ADD</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
