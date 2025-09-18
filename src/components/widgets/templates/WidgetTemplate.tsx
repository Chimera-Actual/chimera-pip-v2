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
}

export const StandardWidgetTemplate: React.FC<StandardWidgetTemplateProps> = ({
  widget,
  onRemove,
  onToggleCollapse,
  onToggleFullWidth,
  onOpenSettings,
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

  const headerActions = widget ? (
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
  ) : props.headerActions;

  return (
    <BaseWidgetTemplate
      {...props}
      headerActions={headerActions}
    />
  );
};