import React from 'react';
import { BaseWidgetSettingsModal } from './BaseWidgetSettingsModal';
import type { BaseWidgetSettingsModalProps, WidgetSettingsTab } from '@/types/widget';

interface WidgetSettingsTemplateProps extends Omit<BaseWidgetSettingsModalProps, 'customTabs'> {
  widgetType?: string;
  customTabs?: WidgetSettingsTab[];
  displayTabs?: WidgetSettingsTab[];
  effectsTabs?: WidgetSettingsTab[];
}

export const WidgetSettingsTemplate: React.FC<WidgetSettingsTemplateProps> = ({
  widgetType,
  customTabs = [],
  displayTabs = [],
  effectsTabs = [],
  title,
  ...props
}) => {
  const widgetTitle = title || `${widgetType ? widgetType.charAt(0).toUpperCase() + widgetType.slice(1) : 'Widget'} Settings`;

  // Merge custom tabs with display and effects tabs
  const allCustomTabs = [
    ...customTabs,
    ...displayTabs,
    ...effectsTabs,
  ];

  return (
    <BaseWidgetSettingsModal
      {...props}
      title={widgetTitle}
      customTabs={allCustomTabs}
    />
  );
};