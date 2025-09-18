import React from 'react';
import { BaseWidgetTemplate } from '../BaseWidgetTemplate';
import { WidgetActionButtons } from '../WidgetActionButtons';
import { WidgetControlButtons } from '../WidgetControlButtons';
import { useWidgetManager, type UserWidget } from '@/hooks/useWidgetManager';
import type { WidgetTemplateProps, BaseWidgetSettings } from '@/types/widget';

interface StandardWidgetTemplateProps extends WidgetTemplateProps {
  widget?: UserWidget;
  onSettingsChange?: (settings: BaseWidgetSettings) => void;
  onRemove?: () => void;
  onToggleCollapse?: () => void;
  onToggleFullWidth?: () => void;
  onOpenSettings?: () => void;
  widgetSpecificActions?: React.ReactNode;
  showStandardControls?: boolean;
}

export const StandardWidgetTemplate: React.FC<StandardWidgetTemplateProps> = ({
  widget,
  onRemove,
  onToggleCollapse,
  onToggleFullWidth,
  onOpenSettings,
  widgetSpecificActions,
  showStandardControls = true,
  children,
  ...props
}) => {
  const { deleteWidget, updateWidget } = useWidgetManager();

  const handleRemove = async () => {
    if (widget && onRemove) {
      onRemove();
    } else if (widget) {
      await deleteWidget(widget.id);
    }
  };

  const handleToggleCollapse = async () => {
    if (widget && onToggleCollapse) {
      onToggleCollapse();
    } else if (widget) {
      await updateWidget(widget.id, { is_collapsed: !widget.is_collapsed });
    }
  };

  const handleToggleFullWidth = async () => {
    if (widget && onToggleFullWidth) {
      onToggleFullWidth();
    } else if (widget) {
      const currentConfig = widget.widget_config || {};
      await updateWidget(widget.id, {
        widget_config: {
          ...currentConfig,
          fullWidth: !currentConfig.fullWidth
        }
      });
    }
  };

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    }
  };

  // Build standard controls if widget is provided and showStandardControls is true
  const standardControls = (widget && showStandardControls) ? (
    <WidgetActionButtons
      onSettings={handleOpenSettings}
      additionalActions={
        <WidgetControlButtons
          widget={widget}
          onClose={handleRemove}
          onToggleCollapse={handleToggleCollapse}
          onSettings={handleOpenSettings}
          onToggleFullWidth={handleToggleFullWidth}
        />
      }
    />
  ) : null;

  return (
    <BaseWidgetTemplate
      title={widget?.widget_config?.title || 'Widget'}
      widgetId={widget?.id}
      settings={widget?.widget_config || {}}
      icon={widget?.widget_config?.icon}
      showControls={showStandardControls}
      headerActions={props.headerActions}
      widgetSpecificActions={widgetSpecificActions}
      standardControls={showStandardControls ? standardControls : undefined}
      contentClassName="h-full flex flex-col"
      {...props}
    >
      {widget?.is_collapsed ? (
        <div className="flex items-center justify-center py-4 text-center text-pip-text-secondary font-pip-mono text-sm">
          Widget collapsed - Click expand to view content
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          {children}
        </div>
      )}
    </BaseWidgetTemplate>
  );
};