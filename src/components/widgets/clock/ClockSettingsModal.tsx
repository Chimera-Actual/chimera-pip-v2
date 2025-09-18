import React, { useState, useEffect } from 'react';
import { BaseWidgetSettingsModal } from '../BaseWidgetSettingsModal';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Clock, Palette, Zap, Check } from 'lucide-react';
import { ClockThemePreview } from './ClockThemePreview';
import type { AtomicClockSettings } from '../AtomicClockWidget';
import type { WidgetSettingsTab } from '@/types/widget';

interface ClockSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: AtomicClockSettings;
  onSave: (settings: Partial<AtomicClockSettings>) => void;
}

export const ClockSettingsModal: React.FC<ClockSettingsModalProps> = ({
  open,
  onClose,
  settings,
  onSave,
}) => {
  const updateSetting = (key: keyof AtomicClockSettings, value: any) => {
    onSave({ ...settings, [key]: value });
  };

  const updateEffectSetting = (key: string, value: any) => {
    onSave({
      ...settings,
      effects: { ...settings.effects, [key]: value }
    });
  };

  const themeOptions = [
    { value: 'vault-tec', label: 'Vault-Tec', description: 'Classic Fallout green phosphor' },
    { value: 'military', label: 'Military', description: 'Orange tactical display' },
    { value: 'nixie', label: 'Nixie Tube', description: 'Warm amber glow' },
    { value: 'led', label: 'LED Matrix', description: 'Red digital display' },
    { value: 'terminal', label: 'Terminal', description: 'Green on black CRT' },
    { value: 'plasma', label: 'Plasma', description: 'Blue-white futuristic' },
    { value: 'hologram', label: 'Hologram', description: 'Cyan projection effect' },
    { value: 'retro-lcd', label: 'Retro LCD', description: 'Dark blue LCD style' }
  ];

  // Convert AtomicClockSettings to BaseWidgetSettings format
  const baseSettings = {
    ...settings,
    effects: settings.effects || {}
  };

  const handleSave = (newSettings: any) => {
    onSave(newSettings as AtomicClockSettings);
  };

  const customTabs: WidgetSettingsTab[] = [
    {
      id: 'display',
      label: 'Display',
      icon: Clock,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-pip-text-secondary font-pip-mono">24-Hour Format</Label>
            <Switch
              checked={settings.format24}
              onCheckedChange={(checked) => updateSetting('format24', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-pip-text-secondary font-pip-mono">Show Seconds</Label>
            <Switch
              checked={settings.showSeconds}
              onCheckedChange={(checked) => updateSetting('showSeconds', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-pip-text-secondary font-pip-mono">Show Date</Label>
            <Switch
              checked={settings.showDate}
              onCheckedChange={(checked) => updateSetting('showDate', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-pip-text-secondary font-pip-mono">Show Timezone</Label>
            <Switch
              checked={settings.showTimezone}
              onCheckedChange={(checked) => updateSetting('showTimezone', checked)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'theme',
      label: 'Theme',
      icon: Palette,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {themeOptions.map((theme) => (
              <div
                key={theme.value}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  settings.theme === theme.value
                    ? 'border-primary bg-pip-bg-primary/50 ring-1 ring-primary/50'
                    : 'border-pip-border hover:border-primary/50 hover:bg-pip-bg-primary/20'
                }`}
                onClick={() => updateSetting('theme', theme.value)}
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <ClockThemePreview
                      theme={theme.value}
                      showSeconds={settings.showSeconds}
                      format24={settings.format24}
                      showDate={settings.showDate}
                    />
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                      settings.theme === theme.value
                        ? 'border-primary bg-primary text-pip-bg-primary'
                        : 'border-pip-border'
                    }`}>
                      {settings.theme === theme.value && (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-pip-display text-pip-text-bright">
                      {theme.label}
                    </div>
                    <div className="text-xs text-pip-text-secondary font-pip-mono mt-1">
                      {theme.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <BaseWidgetSettingsModal
      isOpen={open}
      onClose={onClose}
      title="Atomic Clock Settings"
      settings={baseSettings}
      onSave={handleSave}
      customTabs={customTabs}
      showGeneralTab={false}
    />
  );
};