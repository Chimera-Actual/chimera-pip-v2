import React, { memo, useMemo } from 'react';
import { BaseWidgetTemplate } from '@/components/widgets/BaseWidgetTemplate';
import { WidgetControlButtons } from '@/components/widgets/WidgetControlButtons';
import { getTabIcon } from '@/utils/iconMapping';
import type { UserWidget } from '@/hooks/useWidgetManager';

interface StandardWidgetTemplateProps {
  widget?: UserWidget;
  onRemove?: () => void;
  onToggleCollapse?: () => void;
  onToggleFullWidth?: () => void;
  onOpenSettings?: () => void;
  widgetSpecificActions?: React.ReactNode;
  showStandardControls?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

export const StandardWidgetTemplate = memo<StandardWidgetTemplateProps>(({
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
  // Get the appropriate icon for the widget
  const IconComponent = getTabIcon(
    widget?.widget_type || 'widget',
    widget?.widget_config?.icon
  );

  // Prepare standard controls
  const standardControls = useMemo(() => {
    if (!widget || !showStandardControls) return null;
    
    return (
      <WidgetControlButtons
        widget={widget}
        onToggleCollapse={onToggleCollapse}
        onToggleFullWidth={onToggleFullWidth}
        onClose={onRemove}
        onSettings={onOpenSettings}
      />
    );
  }, [widget, showStandardControls, onToggleCollapse, onToggleFullWidth, onRemove, onOpenSettings]);

  return (
    <BaseWidgetTemplate
      {...props}
      title={widget?.widget_config?.title || widget?.widget_type || 'Widget'}
      settings={{
        ...widget?.widget_config,
        description: widget?.widget_config?.description
      }}
      icon={IconComponent}
      widget={widget}
      isCollapsed={widget?.is_collapsed}
      widgetSpecificActions={widgetSpecificActions}
      standardControls={standardControls}
    >
      {children}
    </BaseWidgetTemplate>
  );
});