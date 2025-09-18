import React, { useState, useEffect } from 'react';
import { Clock, Palette, Zap, Bell } from 'lucide-react';
import { UniversalSettingsTemplate } from '../UniversalSettingsTemplate';
import { 
  SettingsToggle, 
  SettingsSelect, 
  SettingsSlider, 
  SettingsInput,
  SettingsGroup 
} from '../SettingsControls';
import type { SettingsSection } from '@/types/settings';
import type { BaseWidgetSettings } from '@/types/widget';

interface WidgetSettingsExampleProps {
  isOpen: boolean;
  onClose: () => void;
  widgetType: string;
  settings: BaseWidgetSettings;
  onSave: (settings: BaseWidgetSettings) => void;
}

export const WidgetSettingsExample: React.FC<WidgetSettingsExampleProps> = ({
  isOpen,
  onClose,
  widgetType,
  settings,
  onSave,
}) => {
  const [tempSettings, setTempSettings] = useState<BaseWidgetSettings>(settings);
  const [isDirty, setIsDirty] = useState(false);

  // Sync temp settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSettings({ ...settings });
      setIsDirty(false);
    }
  }, [isOpen, settings]);

  // Check if settings have changed
  useEffect(() => {
    setIsDirty(JSON.stringify(tempSettings) !== JSON.stringify(settings));
  }, [tempSettings, settings]);

  const handleSave = () => {
    onSave(tempSettings);
    setIsDirty(false);
    onClose();
  };

  const handleReset = () => {
    setTempSettings({ ...settings });
    setIsDirty(false);
  };

  const updateSetting = (key: keyof BaseWidgetSettings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateEffectSetting = (key: string, value: any) => {
    setTempSettings(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [key]: value
      }
    }));
  };

  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic widget configuration and display options.',
      icon: Clock,
      order: 1,
      content: (
        <SettingsGroup>
          <SettingsInput
            label="Widget Title"
            description="Custom title displayed in the widget header"
            value={tempSettings.title || ''}
            onChange={(value) => updateSetting('title', value)}
            placeholder="Enter widget title..."
          />
          
          <SettingsInput
            label="Description"
            description="Optional description of the widget's purpose"
            value={tempSettings.description || ''}
            onChange={(value) => updateSetting('description', value)}
            placeholder="Enter widget description..."
          />
          
          <SettingsToggle
            label="Show Title"
            description="Display the title in the widget header"
            value={tempSettings.showTitle ?? true}
            onChange={(value) => updateSetting('showTitle', value)}
          />
          
          <SettingsToggle
            label="Show Description"
            description="Display the description below the title"
            value={tempSettings.showDescription ?? false}
            onChange={(value) => updateSetting('showDescription', value)}
          />
        </SettingsGroup>
      )
    },
    {
      id: 'appearance',
      title: 'Appearance & Style',
      description: 'Customize the visual appearance of the widget.',
      icon: Palette,
      order: 2,
      content: (
        <SettingsGroup>
          <SettingsSelect
            label="Widget Theme"
            description="Select the visual theme for this widget"
            value={tempSettings.theme || 'default'}
            onChange={(value) => updateSetting('theme', value)}
            options={[
              { value: 'default', label: 'Default Theme' },
              { value: 'minimal', label: 'Minimal Style' },
              { value: 'retro', label: 'Retro Terminal' },
              { value: 'modern', label: 'Modern Interface' }
            ]}
          />
          
          <SettingsInput
            label="Custom Icon"
            description="Icon name from Lucide React (e.g., 'clock', 'settings')"
            value={tempSettings.icon || ''}
            onChange={(value) => updateSetting('icon', value)}
            placeholder="Enter icon name..."
          />
        </SettingsGroup>
      )
    },
    {
      id: 'effects',
      title: 'Visual Effects',
      description: 'Configure visual effects and animations for enhanced appearance.',
      icon: Zap,
      order: 3,
      content: (
        <SettingsGroup>
          <SettingsToggle
            label="Particle Effects"
            description="Enable floating particle animations"
            value={tempSettings.effects?.particles ?? false}
            onChange={(value) => updateEffectSetting('particles', value)}
          />
          
          <SettingsToggle
            label="Scan Lines"
            description="Enable retro scan line overlay effect"
            value={tempSettings.effects?.scanlines ?? false}
            onChange={(value) => updateEffectSetting('scanlines', value)}
          />
          
          <SettingsToggle
            label="Glow Effect"
            description="Enable soft glow around the widget border"
            value={tempSettings.effects?.glow ?? false}
            onChange={(value) => updateEffectSetting('glow', value)}
          />
          
          <SettingsSlider
            label="Effect Intensity"
            description="Control the intensity of all visual effects"
            value={tempSettings.effects?.intensity ?? 50}
            onChange={(value) => updateEffectSetting('intensity', value)}
            min={0}
            max={100}
            step={5}
            unit="%"
          />
        </SettingsGroup>
      )
    }
  ];

  // Add widget-specific sections based on widget type
  if (widgetType === 'clock') {
    sections.push({
      id: 'clock-specific',
      title: 'Clock Settings',
      description: 'Configure clock-specific behavior and display options.',
      icon: Bell,
      order: 4,
      content: (
        <SettingsGroup>
          <SettingsSelect
            label="Time Format"
            description="Choose between 12-hour and 24-hour time display"
            value={tempSettings.customStyles?.timeFormat || '12'}
            onChange={(value) => setTempSettings(prev => ({
              ...prev,
              customStyles: { ...prev.customStyles, timeFormat: value }
            }))}
            options={[
              { value: '12', label: '12-hour (AM/PM)' },
              { value: '24', label: '24-hour (Military)' }
            ]}
          />
          
          <SettingsToggle
            label="Show Seconds"
            description="Display seconds in the time"
            value={tempSettings.customStyles?.showSeconds ?? true}
            onChange={(value) => setTempSettings(prev => ({
              ...prev,
              customStyles: { ...prev.customStyles, showSeconds: value }
            }))}
          />
        </SettingsGroup>
      )
    });
  }

  return (
    <UniversalSettingsTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={`${widgetType.toUpperCase()} WIDGET SETTINGS`}
      description={`Configure the behavior and appearance of your ${widgetType} widget.`}
      sections={sections}
      onSave={handleSave}
      onReset={handleReset}
      isDirty={isDirty}
      size="large"
    />
  );
};