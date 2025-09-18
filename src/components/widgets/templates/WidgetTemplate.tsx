import React, { memo, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BaseWidgetTemplate } from '@/components/widgets/BaseWidgetTemplate';
import { WidgetActionButtons } from '@/components/widgets/WidgetActionButtons';
import { WidgetControlButtons } from '@/components/widgets/WidgetControlButtons';
import { getTabIcon } from '@/utils/iconMapping';
import type { UserWidget } from '@/hooks/useWidgetManager';

interface WidgetTemplateProps {
  [key: string]: any;
}

interface StandardWidgetTemplateProps extends WidgetTemplateProps {
  widget?: UserWidget;
  onRemove?: () => void;
  onToggleCollapse?: () => void;
  onToggleFullWidth?: () => void;
  onOpenSettings?: () => void;
  widgetSpecificActions?: React.ReactNode;
  showStandardControls?: boolean;
  selfWrapped?: boolean; // When true, skip the shell wrapper
}

export const StandardWidgetTemplate = memo<StandardWidgetTemplateProps>(({
  widget,
  onRemove,
  onToggleCollapse,
  onToggleFullWidth,
  onOpenSettings,
  widgetSpecificActions,
  showStandardControls = true,
  selfWrapped = false,
  children,
  ...props
}) => {
  // If selfWrapped, render content directly without shell
  if (selfWrapped) {
    const isCollapsed = widget?.is_collapsed ?? false;
    
    return (
      <Card 
        className={`pip-widget-card transition-all duration-300 ${
          widget?.widget_width === 'full' ? 'col-span-full' : ''
        } ${isCollapsed ? 'min-h-[80px]' : ''} hover:pip-glow-subtle`}
      >
        <div className="p-4">
          {/* Widget Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {(() => {
                const IconComponent = getTabIcon(
                  widget?.widget_type || 'widget',
                  widget?.widget_config?.icon
                );
                return <IconComponent className="w-4 h-4 text-pip-primary" />;
              })()}
              <h3 className="text-pip-text-primary font-pip-display text-sm font-semibold">
                {widget?.widget_config?.title || widget?.widget_type || 'Widget'}
              </h3>
              {widget?.widget_config?.description && (
                <span className="text-pip-text-muted text-xs">
                  {widget.widget_config.description}
                </span>
              )}
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              {widgetSpecificActions}
              
              {showStandardControls && widget && (
                <>
                  <WidgetControlButtons
                    widget={widget}
                    onToggleCollapse={onToggleCollapse}
                    onToggleFullWidth={onToggleFullWidth}
                    onClose={onRemove}
                    onSettings={onOpenSettings}
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Widget Content */}
          {isCollapsed ? (
            <div className="flex items-center justify-center py-2">
              <span className="text-pip-text-muted text-xs font-pip-mono">
                Widget collapsed - click to expand
              </span>
            </div>
          ) : (
            <div className="widget-content">
              {children}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Standard template fallback
  const standardControls = useMemo(() => {
    if (!widget || !showStandardControls) return null;
    
    return (
      <>
        <WidgetControlButtons
          widget={widget}
          onToggleCollapse={onToggleCollapse}
          onToggleFullWidth={onToggleFullWidth}
          onClose={onRemove}
          onSettings={onOpenSettings}
        />
        {widgetSpecificActions && (
          <div className="flex items-center gap-2">
            {widgetSpecificActions}
          </div>
        )}
      </>
    );
  }, [widget, showStandardControls, onToggleCollapse, onToggleFullWidth, onRemove, onOpenSettings, widgetSpecificActions]);

  return (
    <BaseWidgetTemplate
      {...props}
      title={widget?.widget_config?.title || widget?.widget_type || 'Widget'}
      standardControls={standardControls}
      className={`${widget?.widget_width === 'full' ? 'col-span-2' : ''} ${widget?.is_collapsed ? 'min-h-[80px]' : ''}`}
    >
      {widget?.is_collapsed ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-pip-text-muted text-sm font-pip-mono">
            Widget collapsed - click expand to view content
          </span>
        </div>
      ) : (
        children
      )}
    </BaseWidgetTemplate>
  );
});