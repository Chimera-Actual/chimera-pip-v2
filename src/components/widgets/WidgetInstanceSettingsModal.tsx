import React, { useState, useEffect } from 'react';
import { Settings, Palette } from 'lucide-react';
import { UniversalSettingsTemplate } from '@/components/settings/UniversalSettingsTemplate';
import { SettingsInput, SettingsGroup } from '@/components/settings/SettingsControls';
import { IconSelectionModal } from '@/components/ui/IconSelectionModal';
import { getTabIcon } from '@/utils/iconMapping';
import type { UserWidget } from '@/hooks/useWidgetManager';
import type { SettingsSection } from '@/types/settings';

interface WidgetInstanceSettingsModalProps {
  open: boolean;
  onClose: () => void;
  widget: UserWidget | null;
  onSave: (widgetId: string, config: any) => void;
}

export const WidgetInstanceSettingsModal: React.FC<WidgetInstanceSettingsModalProps> = ({
  open,
  onClose,
  widget,
  onSave,
}) => {
  const [config, setConfig] = useState<any>({});
  const [showIconModal, setShowIconModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (widget) {
      setConfig(widget.widget_config || {});
      setIsDirty(false);
    }
  }, [widget]);

  const handleSave = () => {
    if (widget) {
      onSave(widget.id, config);
      onClose();
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  if (!widget) return null;

  const sections: SettingsSection[] = [
    {
      id: 'basic',
      title: 'Basic Configuration',
      description: 'Widget title, description, and display settings',
      icon: Settings,
      order: 1,
      content: (
        <SettingsGroup>
          <SettingsInput
            label="Widget Title"
            description="Display name for this widget instance"
            value={config.title || ''}
            onChange={(value) => updateConfig('title', value)}
            placeholder="Widget title"
          />
          
          <SettingsInput
            label="Description"
            description="Brief description of this widget instance"
            value={config.description || ''}
            onChange={(value) => updateConfig('description', value)}
            placeholder="Widget description"
            type="text"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-pip-text-primary">Icon</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded border border-pip-border bg-pip-bg-tertiary/50 pip-glow">
                {(() => {
                  const IconComponent = getTabIcon('', config.icon || 'CogIcon');
                  return <IconComponent className="h-5 w-5 text-pip-green-primary" />;
                })()}
              </div>
              <button
                type="button"
                onClick={() => setShowIconModal(true)}
                className="flex-1 px-3 py-2 text-left border border-pip-border rounded bg-pip-bg-secondary/50 hover:bg-pip-bg-secondary/70 text-pip-text-secondary hover:text-pip-green-secondary"
              >
                Select Icon
              </button>
            </div>
          </div>
        </SettingsGroup>
      )
    }
  ];

  // Add widget-specific settings for test widgets
  if (['test', 'test_widget'].includes((widget.widget_type || '').toLowerCase())) {
    sections.push({
      id: 'test-settings',
      title: 'Test Widget Settings',
      description: 'Special configuration options for test widgets',
      icon: Palette,
      order: 2,
      content: (
        <SettingsGroup>
          <SettingsInput
            label="Text Input"
            description="Custom text value for testing"
            value={config.textInput || ''}
            onChange={(value) => updateConfig('textInput', value)}
            placeholder="Enter text"
          />
          
          <SettingsInput
            label="Number Input"
            description="Custom number value for testing"
            value={config.numberInput?.toString() || '0'}
            onChange={(value) => updateConfig('numberInput', parseInt(value) || 0)}
            type="number"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-pip-text-primary">Color Value</label>
            <p className="text-xs text-pip-text-muted">Choose a color for testing purposes</p>
            <input
              type="color"
              value={config.colorValue || '#00ff00'}
              onChange={(e) => updateConfig('colorValue', e.target.value)}
              className="w-full h-10 rounded border border-pip-border bg-pip-bg-secondary"
            />
          </div>
        </SettingsGroup>
      )
    });
  }

  return (
    <>
      <UniversalSettingsTemplate
        isOpen={open}
        onClose={onClose}
        title="Widget Settings"
        description="Configure this widget instance"
        sections={sections}
        onSave={handleSave}
        isDirty={isDirty}
        size="default"
      />
      
      <IconSelectionModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        onSelect={(iconName) => updateConfig('icon', iconName)}
        selectedIcon={config.icon || 'CogIcon'}
        title="Select Widget Icon"
      />
    </>
  );
};