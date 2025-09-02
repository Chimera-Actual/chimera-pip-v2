import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidgets } from '@/contexts/WidgetContext';
import { WidgetRenderer } from './WidgetRegistry';
import { WidgetType } from '@/types/widgets';
import { cn } from '@/lib/utils';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { PullToRefresh } from '@/components/common/PullToRefresh';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileWidgetContainer } from './MobileWidgetContainer';

interface WidgetGridProps {
  tab: string;
  className?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({ tab, className }) => {
  const { getWidgetsByTab, addWidget, removeWidget, updateWidget, refreshWidgets, isLoading } = useWidgets();
  const [showAdvancedCatalog, setShowAdvancedCatalog] = useState(false);
  const isMobile = useIsMobile();
  
  const widgets = getWidgetsByTab(tab as any);

  const handleAddWidget = async (type: WidgetType) => {
    const widget = await addWidget(type, tab as any);
    if (widget) {
      setShowAdvancedCatalog(false);
    }
  };

  const handleRefresh = async () => {
    await refreshWidgets();
  };

  const gridContent = (
    <div className={cn('space-y-6', className)}>
      {/* Existing Widgets */}
      <div className="widgets-grid">
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-slot">
            {isMobile ? (
              <MobileWidgetContainer
                widgetId={widget.id}
                widgetType={widget.type}
                title={widget.title}
                collapsed={widget.collapsed}
                onToggleCollapse={() => updateWidget(widget.id, { collapsed: !widget.collapsed })}
                onSettingsChange={(settings) => updateWidget(widget.id, { settings })}
                onDelete={() => removeWidget(widget.id)}
                onMove={(position) => updateWidget(widget.id, { position })}
              >
                <WidgetRenderer widget={widget} />
              </MobileWidgetContainer>
            ) : (
              <WidgetRenderer widget={widget} />
            )}
          </div>
        ))}
      </div>

      {/* Add Widget Button */}
      <Button
        variant="outline"
        size={isMobile ? "touch-large" : "default"}
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

  // Return with pull-to-refresh on mobile
  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh}>
      {gridContent}
    </PullToRefresh>
  ) : (
    gridContent
  );
};

// Note: Moved CSS to index.css for better performance and maintainability
