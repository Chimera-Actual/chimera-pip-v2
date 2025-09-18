import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Zap, Monitor, Image } from 'lucide-react';
import { UniversalSettingsTemplate } from '@/components/settings/UniversalSettingsTemplate';
import { SettingsInput, SettingsToggle, SettingsSelect, SettingsGroup } from '@/components/settings/SettingsControls';
import { IconSelectionModal } from '@/components/ui/IconSelectionModal';
import type { BaseWidgetSettingsModalProps, BaseWidgetSettings } from '@/types/widget';
import type { SettingsSection } from '@/types/settings';

export const BaseWidgetSettingsModal: React.FC<BaseWidgetSettingsModalProps> = ({
  isOpen,
  onClose,
  title = "Widget Settings",
  settings,
  onSave,
  customTabs = [],
  showGeneralTab = true,
  showEffectsTab = true,
  children,
}) => {
  const [localSettings, setLocalSettings] = useState<BaseWidgetSettings>(settings);
  const [showIconModal, setShowIconModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync local settings with prop changes
  useEffect(() => {
    setLocalSettings(settings);
    setIsDirty(false);
  }, [settings, isOpen]);

  const updateSetting = useCallback((key: keyof BaseWidgetSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  const updateEffectSetting = useCallback((key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      effects: { ...prev.effects, [key]: value }
    }));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave(localSettings);
    setIsDirty(false);
    onClose();
  }, [localSettings, onSave, onClose]);

  const handleReset = useCallback(() => {
    setLocalSettings(settings);
    setIsDirty(false);
  }, [settings]);

  const sections: SettingsSection[] = [
    ...(showGeneralTab ? [{
      id: 'general',
      title: 'General Settings',
      description: 'Basic widget information and display options',
      icon: Settings,
      order: 1,
      content: (
        <SettingsGroup>
          <SettingsInput
            label="Widget Title"
            description="Display name for this widget"
            value={localSettings.title || ''}
            onChange={(value) => updateSetting('title', value)}
            placeholder="Widget title"
          />
          
          <SettingsInput
            label="Description"
            description="Brief description of the widget's purpose"
            value={localSettings.description || ''}
            onChange={(value) => updateSetting('description', value)}
            placeholder="Widget description"
            type="text"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-pip-text-bright">Icon</label>
            <Button
              variant="outline"
              onClick={() => setShowIconModal(true)}
              className="w-full justify-start bg-pip-bg-secondary/50 border-pip-border text-pip-text-bright hover:bg-pip-bg-secondary/70"
            >
              <Image className="h-4 w-4 mr-2" />
              {localSettings.icon ? `Selected: ${localSettings.icon}` : 'Select Icon'}
            </Button>
          </div>

          <SettingsToggle
            label="Show Title"
            description="Display widget title in header"
            value={localSettings.showTitle !== false}
            onChange={(checked) => updateSetting('showTitle', checked)}
          />
          
          <SettingsToggle
            label="Show Description"
            description="Display widget description"
            value={localSettings.showDescription !== false}
            onChange={(checked) => updateSetting('showDescription', checked)}
          />
        </SettingsGroup>
      )
    }] : []),
    {
      id: 'display',
      title: 'Display & Appearance',
      description: 'Visual theme and layout options',
      icon: Monitor,
      order: 2,
      content: (
        <SettingsGroup>
          <SettingsSelect
            label="Theme"
            description="Choose the visual style for this widget"
            value={localSettings.theme || 'default'}
            onChange={(value) => updateSetting('theme', value)}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'retro', label: 'Retro' },
              { value: 'modern', label: 'Modern' },
              { value: 'current', label: 'Current' }
            ]}
          />
          {children && (
            <div className="border-t border-pip-border/30 pt-4">
              {children}
            </div>
          )}
        </SettingsGroup>
      )
    },
    ...(showEffectsTab ? [{
      id: 'effects',
      title: 'Visual Effects',
      description: 'Special effects and animations',
      icon: Zap,
      order: 3,
      content: (
        <SettingsGroup>
          <SettingsToggle
            label="Particles Effect"
            description="Enable floating particle animations"
            value={localSettings.effects?.particles || false}
            onChange={(checked) => updateEffectSetting('particles', checked)}
          />

          <SettingsToggle
            label="Scanlines Effect"
            description="Add retro CRT scanline overlay"
            value={localSettings.effects?.scanlines || false}
            onChange={(checked) => updateEffectSetting('scanlines', checked)}
          />

          <SettingsToggle
            label="Glow Effect"
            description="Apply glowing border effects"
            value={localSettings.effects?.glow || false}
            onChange={(checked) => updateEffectSetting('glow', checked)}
          />
        </SettingsGroup>
      )
    }] : []),
    // Add custom tabs as sections
    ...customTabs.map((tab, index) => ({
      id: tab.id,
      title: tab.label,
      description: `Custom settings for ${tab.label.toLowerCase()}`,
      icon: tab.icon,
      order: 10 + index,
      content: typeof tab.content === 'function' 
        ? tab.content({ localSettings, updateSetting, updateEffectSetting })
        : tab.content
    }))
  ];

  return (
    <>
      <UniversalSettingsTemplate
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        sections={sections}
        onSave={handleSave}
        onReset={handleReset}
        isDirty={isDirty}
        size="large"
      />

      <IconSelectionModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        onSelect={(icon) => {
          updateSetting('icon', icon);
          setShowIconModal(false);
        }}
        selectedIcon={localSettings.icon || ''}
      />
    </>
  );
};