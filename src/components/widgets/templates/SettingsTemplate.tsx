import React from 'react';
import { WidgetSettingsTemplate } from '../WidgetSettingsTemplate';
import type { BaseWidgetSettings, WidgetSettingsTab } from '@/types/widget';

interface StandardSettingsTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  widgetType: string;
  settings: BaseWidgetSettings;
  onSave: (settings: BaseWidgetSettings) => void;
  customSettingsTabs?: WidgetSettingsTab[];
  children?: React.ReactNode;
}

export const StandardSettingsTemplate: React.FC<StandardSettingsTemplateProps> = ({
  widgetType,
  customSettingsTabs = [],
  children,
  ...props
}) => {
  return (
    <WidgetSettingsTemplate
      {...props}
      widgetType={widgetType}
      customTabs={customSettingsTabs}
    >
      {children}
    </WidgetSettingsTemplate>
  );
};