import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWidgets } from '@/contexts/WidgetContext';
import { WidgetRenderer } from './WidgetRegistry';
import { WidgetType, BaseWidget, WidgetWidth } from '@/types/widgets';
import { cn } from '@/lib/utils';
import { AdvancedWidgetCatalog } from '@/components/tabManagement/AdvancedWidgetCatalog';
import { PullToRefresh } from '@/components/common/PullToRefresh';
import { useIsMobile } from '@/hooks/use-mobile';
import { RefreshCw, Plus, Move, Settings, X, Minimize, Maximize } from 'lucide-react';
import { WidgetSettingsModal } from './WidgetSettingsModal';

interface SimpleWidgetGridProps {
  tab: string;
  className?: string;
}

export const SimpleWidgetGrid: React.FC<SimpleWidgetGridProps> = ({ tab, className = '' }) => {
  const { 
    getWidgetsByTab, 
    addWidget, 
    removeWidget, 
    updateWidget, 
    refreshWidgets, 
    isLoading 
  } = useWidgets();
  
  const [showAdvancedCatalog, setShowAdvancedCatalog] = useState(false);
  const [settingsWidget, setSettingsWidget] = useState<BaseWidget | null>(null);
  const isMobile = useIsMobile();

  const widgets = getWidgetsByTab(tab as any).sort((a, b) => a.order - b.order);

  const handleAddWidget = async (type: WidgetType) => {
    await addWidget(type, tab as any);
    setShowAdvancedCatalog(false);
  };

  const handleUpdateWidget = async (widgetId: string, updates: Partial<BaseWidget>) => {
    await updateWidget(widgetId, updates);
  };

  const handleDeleteWidget = async (widgetId: string) => {
    await removeWidget(widgetId);
  };

  const handleToggleWidth = async (widget: BaseWidget) => {
    const newWidth: WidgetWidth = widget.widgetWidth === 'half' ? 'full' : 'half';
    await handleUpdateWidget(widget.id, { widgetWidth: newWidth });
  };

  const handleMoveUp = async (widget: BaseWidget) => {
    const widgetIndex = widgets.findIndex(w => w.id === widget.id);
    if (widgetIndex > 0) {
      const prevWidget = widgets[widgetIndex - 1];
      await handleUpdateWidget(widget.id, { order: prevWidget.order });
      await handleUpdateWidget(prevWidget.id, { order: widget.order });
    }
  };

  const handleMoveDown = async (widget: BaseWidget) => {
    const widgetIndex = widgets.findIndex(w => w.id === widget.id);
    if (widgetIndex < widgets.length - 1) {
      const nextWidget = widgets[widgetIndex + 1];
      await handleUpdateWidget(widget.id, { order: nextWidget.order });
      await handleUpdateWidget(nextWidget.id, { order: widget.order });
    }
  };

  const renderWidget = (widget: BaseWidget) => {
    const widgetClass = cn(
      "rounded-lg border border-pip-border/30 bg-pip-bg-overlay/40 backdrop-blur-sm transition-all duration-200 hover:border-pip-border-bright/60 hover:bg-pip-bg-overlay/60",
      widget.widgetWidth === 'full' ? "col-span-2" : "col-span-1",
      widget.collapsed && "h-14"
    );

    return (
      <div key={widget.id} className={widgetClass}>
        {/* Widget Header */}
        <div className="flex items-center justify-between p-3 border-b border-pip-border/20">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-pip-text-primary cursor-grab" />
            <h3 className="text-sm font-medium text-pip-text-bright truncate">{widget.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            {/* Width Toggle - Desktop Only */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-pip-text-primary hover:text-pip-text-bright hover:bg-pip-green-primary/10"
                onClick={() => handleToggleWidth(widget)}
              >
                {widget.widgetWidth === 'half' ? <Maximize className="h-3 w-3" /> : <Minimize className="h-3 w-3" />}
              </Button>
            )}
            
            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-pip-text-primary hover:text-pip-text-bright hover:bg-pip-green-primary/10"
              onClick={() => handleUpdateWidget(widget.id, { collapsed: !widget.collapsed })}
            >
              <Minimize className="h-3 w-3" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-pip-text-primary hover:text-pip-text-bright hover:bg-pip-green-primary/10"
              onClick={() => setSettingsWidget(widget)}
            >
              <Settings className="h-3 w-3" />
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
              onClick={() => handleDeleteWidget(widget.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Widget Content */}
        {!widget.collapsed && (
          <div className="p-3">
            <WidgetRenderer widget={widget} />
          </div>
        )}

        {widget.collapsed && (
          <div className="px-3 pb-2 text-xs text-pip-text-muted">
            Click to expand
          </div>
        )}
      </div>
    );
  };

  const gridContent = (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-pip-text-bright">
            {tab} Widgets ({widgets.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshWidgets()}
            disabled={isLoading}
            className="text-pip-text-primary border-pip-border/30 hover:bg-pip-green-primary/10"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedCatalog(true)}
            className="text-pip-text-primary border-pip-border/30 hover:bg-pip-green-primary/10"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Widget Grid */}
      {widgets.length > 0 ? (
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-2"
        )}>
          {widgets.map(renderWidget)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="max-w-md">
            <h3 className="text-lg font-medium text-pip-text-bright mb-2">No widgets yet</h3>
            <p className="text-sm text-pip-text-muted mb-4">
              Add your first widget to get started with your {tab} dashboard
            </p>
            <Button
              onClick={() => setShowAdvancedCatalog(true)}
              className="bg-pip-green-primary hover:bg-pip-green-secondary text-pip-bg-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Widget Catalog Modal */}
      {showAdvancedCatalog && (
        <AdvancedWidgetCatalog
          onClose={() => setShowAdvancedCatalog(false)}
          onAddWidget={handleAddWidget}
          currentTab={tab as any}
        />
      )}

      {/* Widget Settings Modal */}
      {settingsWidget && (
        <WidgetSettingsModal
          widgetId={settingsWidget.id}
          widgetType={settingsWidget.type}
          widgetTitle={settingsWidget.title}
          isOpen={true}
          onClose={() => setSettingsWidget(null)}
        />
      )}
    </div>
  );

  // Wrap with pull-to-refresh on mobile
  if (isMobile) {
    return (
      <PullToRefresh onRefresh={refreshWidgets}>
        <div className={cn("p-4", className)}>
          {gridContent}
        </div>
      </PullToRefresh>
    );
  }

  return (
    <div className={cn("p-4", className)}>
      {gridContent}
    </div>
  );
};