import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Clock, 
  CloudSun, 
  Brain,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserWidget } from '@/hooks/useWidgetManager';

const widgetIcons = {
  'atomic_clock': Clock,
  'atomicclock': Clock,
  'clockwidget': Clock,
  'weather_dashboard': CloudSun,
  'weatherdashboard': CloudSun,
  'weather': CloudSun,
  'ai_agent': Brain,
  'aiagent': Brain,
  'ai-agent': Brain,
};

const widgetLabels = {
  'atomic_clock': 'Atomic Clock',
  'atomicclock': 'Atomic Clock', 
  'clockwidget': 'Clock Widget',
  'weather_dashboard': 'Weather Dashboard',
  'weatherdashboard': 'Weather Dashboard',
  'weather': 'Weather',
  'ai_agent': 'AI Agent',
  'aiagent': 'AI Agent',
  'ai-agent': 'AI Agent',
};

interface WidgetSelectorProps {
  activeTab: string;
  widgets: UserWidget[];
  activeWidget: UserWidget | null;
  isLoading: boolean;
  onAddWidget: () => void;
  onSelectWidget: (widgetId: string) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

export const WidgetSelector = memo<WidgetSelectorProps>(({
  activeTab,
  widgets,
  activeWidget,
  isLoading,
  onAddWidget,
  onSelectWidget,
  isCollapsed,
  onToggleCollapsed
}) => {
  const getWidgetIcon = (widgetType: string) => {
    const normalizedType = (widgetType || '').toLowerCase().replace(/[^a-z]/g, '');
    return widgetIcons[normalizedType as keyof typeof widgetIcons] || Clock;
  };

  const getWidgetLabel = (widgetType: string) => {
    const normalizedType = (widgetType || '').toLowerCase().replace(/[^a-z]/g, '');
    return widgetLabels[normalizedType as keyof typeof widgetLabels] || widgetType;
  };

  return (
    <div className={cn(
      "h-full bg-pip-bg-primary border-r border-pip-border transition-all duration-300",
      isCollapsed ? "w-14" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-pip-border">
        {!isCollapsed && (
          <div className="flex-1">
            <h3 className="text-pip-text-bright font-pip-bold text-sm">
              {activeTab} Widgets
            </h3>
            <p className="text-pip-text-muted text-xs">
              {widgets.length} available
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapsed}
          className="h-8 w-8 p-0 hover:bg-pip-bg-secondary"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col h-0">
        {!isCollapsed && (
          <>
            {/* Add Widget Button */}
            <div className="p-4">
              <Button
                onClick={onAddWidget}
                className="w-full justify-start gap-2 bg-pip-bg-secondary hover:bg-pip-bg-secondary/80 border border-pip-border"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add Widget
              </Button>
            </div>

            <Separator className="bg-pip-border" />
          </>
        )}

        {/* Widget List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-pip-bg-secondary/50 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : widgets.length === 0 ? (
              <div className="text-center py-8">
                {!isCollapsed && (
                  <p className="text-pip-text-muted text-xs">
                    No widgets yet
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {widgets.map((widget) => {
                  const IconComponent = getWidgetIcon(widget.widget_type);
                  const isActive = activeWidget?.id === widget.id;
                  
                  return (
                    <Button
                      key={widget.id}
                      variant="ghost"
                      onClick={() => onSelectWidget(widget.id)}
                      className={cn(
                        "w-full justify-start gap-2 p-2 h-auto min-h-[44px] text-left hover:bg-pip-bg-secondary/80",
                        isActive && "bg-pip-bg-secondary border border-pip-green-secondary"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <IconComponent className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isActive ? "text-pip-green-bright" : "text-pip-text-secondary"
                        )} />
                        
                        {!isCollapsed && (
                          <div className="min-w-0 flex-1">
                            <div className={cn(
                              "text-xs font-pip-medium truncate",
                              isActive ? "text-pip-green-bright" : "text-pip-text-bright"
                            )}>
                              {widget.widget_config?.title || getWidgetLabel(widget.widget_type)}
                            </div>
                            <div className="text-pip-text-muted text-xs truncate">
                              {getWidgetLabel(widget.widget_type)}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!isCollapsed && isActive && (
                        <Badge variant="secondary" className="text-xs bg-pip-green-secondary/20 text-pip-green-bright border-pip-green-secondary/30">
                          Active
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Collapsed mode add button */}
        {isCollapsed && (
          <div className="p-2">
            <Button
              onClick={onAddWidget}
              variant="ghost"
              size="sm"
              className="w-full h-10 hover:bg-pip-bg-secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});