import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, Plus, Eye, EyeOff } from 'lucide-react';
import { getTabIcon } from '@/utils/iconMapping';
import { cn } from '@/lib/utils';
import { useTabWidgets } from '@/hooks/useTabWidgets';
import type { UserWidget } from '@/hooks/useWidgetManager';

interface TabWidgetDrawerProps {
  activeTab: string;
  onAddWidget?: () => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

export const TabWidgetDrawer = memo<TabWidgetDrawerProps>(({
  activeTab,
  onAddWidget,
  isCollapsed,
  onToggleCollapsed,
}) => {
  const { widgets, isLoading, toggleVisibility } = useTabWidgets(activeTab);

  const handleToggleVisibility = async (widget: UserWidget) => {
    await toggleVisibility(widget);
  };

  const getIconComponent = (widget: UserWidget) => {
    const iconName = widget.widget_config?.icon || 'CogIcon';
    const IconComponent = getTabIcon('', iconName);
    return <IconComponent className="h-4 w-4 text-primary" />;
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-pip-bg-secondary/95 border-r border-pip-border backdrop-blur-sm z-40 transition-all duration-300",
      isCollapsed ? "w-12" : "w-80"
    )}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-4 h-6 w-6 rounded-full bg-pip-bg-secondary border border-pip-border hover:bg-pip-bg-tertiary z-50"
        onClick={onToggleCollapsed}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Header */}
      {!isCollapsed && (
        <div className="p-4 border-b border-pip-border">
          <div className="flex items-center gap-2">
            {(() => {
              const IconComponent = getTabIcon(activeTab, '');
              return <IconComponent className="h-5 w-5 text-pip-text-bright" />;
            })()}
            <h2 className="text-lg font-pip-display font-bold text-pip-text-bright">
              {activeTab} Widgets
            </h2>
          </div>
          <p className="text-xs text-pip-text-secondary font-pip-mono mt-1">
            Manage tab widgets
          </p>
        </div>
      )}

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="p-2 pt-16">
          <div className="flex flex-col items-center gap-2">
            {(() => {
              const IconComponent = getTabIcon(activeTab, '');
              return <IconComponent className="h-5 w-5 text-pip-text-bright" />;
            })()}
            <div className="w-6 h-px bg-pip-border"></div>
          </div>
        </div>
      )}

      {/* Content */}
      {!isCollapsed && (
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {/* Quick Add Button */}
            <Button
              onClick={onAddWidget}
              className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            >
              <Plus className="h-4 w-4" />
              Add Widget
            </Button>

            {/* Widget Instances */}
            <div className="space-y-2">
              <h3 className="text-sm font-pip-display font-semibold text-pip-text-bright mb-2">
                Widget Instances ({widgets.length})
              </h3>
              
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="text-xs text-pip-text-secondary font-pip-mono">
                    Loading widgets...
                  </div>
                </div>
              ) : widgets.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-xs text-pip-text-secondary font-pip-mono">
                    No widgets in this tab
                  </div>
                </div>
              ) : (
                widgets.map((widget) => (
                  <Card 
                    key={widget.id}
                    className="bg-pip-bg-secondary/50 border-pip-border hover:border-primary/50 transition-colors"
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-pip-bg-tertiary border border-pip-border">
                          {getIconComponent(widget)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-pip-display text-pip-text-bright truncate">
                            {widget.widget_config?.title || widget.widget_type}
                          </div>
                          <p className="text-xs text-pip-text-secondary font-pip-mono mt-1 truncate">
                            {widget.widget_type}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                          onClick={() => handleToggleVisibility(widget)}
                          title={widget.is_archived ? "Show Widget" : "Hide Widget"}
                        >
                          {widget.is_archived ? (
                            <EyeOff className="h-3 w-3 text-pip-text-secondary" />
                          ) : (
                            <Eye className="h-3 w-3 text-pip-text-bright" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Widget Status */}
                      <div className="flex items-center gap-2 text-xs mt-2">
                        <Badge 
                          variant={widget.is_collapsed ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {widget.is_collapsed ? 'Collapsed' : 'Expanded'}
                        </Badge>
                        {widget.widget_width === 'full' && (
                          <Badge variant="outline" className="text-xs">
                            Full Width
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Widget Statistics */}
            {widgets.length > 0 && (
              <div className="mt-6 p-3 bg-pip-bg-secondary/30 rounded border border-pip-border">
                <h3 className="text-sm font-pip-display font-semibold text-pip-text-bright mb-2">
                  Tab Statistics
                </h3>
                <div className="space-y-1 text-xs font-pip-mono">
                  <div className="flex justify-between">
                    <span className="text-pip-text-secondary">Total Widgets:</span>
                    <span className="text-pip-text-bright">{widgets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pip-text-secondary">Expanded:</span>
                    <span className="text-pip-text-bright">
                      {widgets.filter(w => !w.is_collapsed).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pip-text-secondary">Collapsed:</span>
                    <span className="text-pip-text-bright">
                      {widgets.filter(w => w.is_collapsed).length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
});