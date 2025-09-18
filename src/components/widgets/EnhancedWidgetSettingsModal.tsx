import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Settings, Palette, Activity, Bug } from 'lucide-react';
import { UniversalSettingsTemplate } from '@/components/settings/UniversalSettingsTemplate';
import { SettingsInput, SettingsToggle, SettingsSelect, SettingsGroup } from '@/components/settings/SettingsControls';
import { IconSelectionModal } from '@/components/ui/IconSelectionModal';
import { getTabIcon } from '@/utils/iconMapping';
import type { UserWidget } from '@/hooks/useWidgetManager';
import type { SettingsSection } from '@/types/settings';

interface EnhancedWidgetSettingsModalProps {
  open: boolean;
  onClose: () => void;
  widget: UserWidget | null;
  onSave: (widgetId: string, config: any) => void;
}

export const EnhancedWidgetSettingsModal: React.FC<EnhancedWidgetSettingsModalProps> = ({
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
      id: 'general',
      title: 'General Settings',
      description: 'Basic widget configuration and appearance',
      icon: Settings,
      order: 1,
      content: (
        <SettingsGroup>
          <SettingsInput
            label="Widget Title"
            description="Display name for this widget"
            value={config.title || ''}
            onChange={(value) => updateConfig('title', value)}
            placeholder="Enter widget title"
          />

          <SettingsInput
            label="Description"
            description="Brief description of the widget's purpose"
            value={config.description || ''}
            onChange={(value) => updateConfig('description', value)}
            placeholder="Widget description"
            type="text"
          />

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-pip-text-bright">Icon</label>
              <p className="text-xs text-pip-text-muted">Choose an icon to represent this widget</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded border border-pip-border bg-pip-bg-tertiary/50 pip-glow">
                {(() => {
                  const IconComponent = getTabIcon('', config.icon || 'CogIcon');
                  return <IconComponent className="h-6 w-6 text-primary" />;
                })()}
              </div>
              <button
                type="button"
                onClick={() => setShowIconModal(true)}
                className="flex-1 px-3 py-2 text-left border border-pip-border rounded bg-pip-bg-secondary/50 hover:bg-pip-bg-secondary/70 text-pip-text-bright"
              >
                Select Icon
              </button>
            </div>
          </div>
        </SettingsGroup>
      )
    },
    {
      id: 'display',
      title: 'Display Options',
      description: 'Control how the widget appears and behaves',
      icon: Palette,
      order: 2,
      content: (
        <SettingsGroup>
          <SettingsToggle
            label="Show Title"
            description="Display widget title in header"
            value={config.showTitle !== false}
            onChange={(checked) => updateConfig('showTitle', checked)}
          />

          <SettingsToggle
            label="Show Description"
            description="Display widget description"
            value={config.showDescription !== false}
            onChange={(checked) => updateConfig('showDescription', checked)}
          />
        </SettingsGroup>
      )
    },
    {
      id: 'behavior',
      title: 'Behavior Settings',
      description: 'Configure automatic updates and refresh intervals',
      icon: Activity,
      order: 3,
      content: (
        <SettingsGroup>
          <SettingsToggle
            label="Auto Refresh"
            description="Automatically refresh widget data"
            value={config.autoRefresh === true}
            onChange={(checked) => updateConfig('autoRefresh', checked)}
          />

          {config.autoRefresh && (
            <SettingsInput
              label="Refresh Interval (seconds)"
              description="How often to refresh the widget data"
              value={config.refreshInterval?.toString() || '30'}
              onChange={(value) => updateConfig('refreshInterval', parseInt(value) || 30)}
              type="number"
            />
          )}
        </SettingsGroup>
      )
    }
  ];

  // Add widget-specific settings if applicable
  if (['test', 'test_widget'].includes((widget.widget_type || '').toLowerCase())) {
    sections.push({
      id: 'advanced',
      title: 'Test Widget Settings',
      description: 'Special configuration for test widgets',
      icon: Bug,
      order: 4,
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
            <label className="text-sm font-medium text-pip-text-bright">Color Value</label>
            <p className="text-xs text-pip-text-muted">Choose a color for testing</p>
            <input
              type="color"
              value={config.colorValue || '#00ff00'}
              onChange={(e) => updateConfig('colorValue', e.target.value)}
              className="w-full h-10 rounded border border-pip-border bg-pip-bg-secondary"
            />
          </div>

          <div className="mt-6 p-4 bg-pip-bg-secondary/30 rounded border border-pip-border">
            <h4 className="text-sm font-semibold text-pip-text-primary mb-3">Debug Information</h4>
            <div className="font-pip-mono text-xs space-y-1">
              <div>Widget ID: <span className="text-pip-text-muted">{widget.id}</span></div>
              <div>Type: <span className="text-pip-text-muted">{widget.widget_type}</span></div>
              <div>Created: <span className="text-pip-text-muted">{new Date(widget.created_at).toLocaleDateString()}</span></div>
              <div>Updated: <span className="text-pip-text-muted">{new Date(widget.updated_at).toLocaleDateString()}</span></div>
            </div>
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
        description="Configure widget behavior and appearance"
        sections={sections}
        onSave={handleSave}
        isDirty={isDirty}
        size="large"
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