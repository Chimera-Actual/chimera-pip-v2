import React, { useState, useEffect } from 'react';
import { Clock, Palette, Check } from 'lucide-react';
import { UniversalSettingsTemplate } from '@/components/settings/UniversalSettingsTemplate';
import { SettingsToggle, SettingsGroup } from '@/components/settings/SettingsControls';
import { ClockThemePreview } from './ClockThemePreview';
import { cn } from '@/lib/utils';
import type { AtomicClockSettings } from '../AtomicClockWidget';
import type { SettingsSection } from '@/types/settings';

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
  const [tempSettings, setTempSettings] = useState<AtomicClockSettings>(settings);
  const [isDirty, setIsDirty] = useState(false);

  // Sync temp settings when modal opens
  useEffect(() => {
    if (open) {
      setTempSettings({ ...settings });
      setIsDirty(false);
    }
  }, [open, settings]);

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

  const updateSetting = (key: keyof AtomicClockSettings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
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

  const sections: SettingsSection[] = [
    {
      id: 'display',
      title: 'Display Settings',
      description: 'Configure how time and date information is displayed.',
      icon: Clock,
      order: 1,
      content: (
        <SettingsGroup>
          <SettingsToggle
            label="24-Hour Format"
            description="Display time in 24-hour military format"
            value={tempSettings.format24 ?? false}
            onChange={(value) => updateSetting('format24', value)}
          />
          
          <SettingsToggle
            label="Show Seconds"
            description="Display seconds in the time"
            value={tempSettings.showSeconds ?? true}
            onChange={(value) => updateSetting('showSeconds', value)}
          />
          
          <SettingsToggle
            label="Show Date"
            description="Display the current date below the time"
            value={tempSettings.showDate ?? true}
            onChange={(value) => updateSetting('showDate', value)}
          />
          
          <SettingsToggle
            label="Show Timezone"
            description="Display the current timezone information"
            value={tempSettings.showTimezone ?? false}
            onChange={(value) => updateSetting('showTimezone', value)}
          />
        </SettingsGroup>
      )
    },
    {
      id: 'theme',
      title: 'Visual Theme',
      description: 'Choose the visual appearance and color scheme for the clock.',
      icon: Palette,
      order: 2,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {themeOptions.map((theme) => (
              <div
                key={theme.value}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-105",
                  tempSettings.theme === theme.value
                    ? 'border-primary bg-pip-bg-primary/50 ring-1 ring-primary/50 shadow-lg shadow-primary/20'
                    : 'border-pip-border hover:border-primary/50 hover:bg-pip-bg-primary/20'
                )}
                onClick={() => updateSetting('theme', theme.value)}
              >
                <div className="flex flex-col space-y-3">
                  <div className="relative">
                    <ClockThemePreview
                      theme={theme.value}
                      showSeconds={tempSettings.showSeconds}
                      format24={tempSettings.format24}
                      showDate={tempSettings.showDate}
                    />
                    <div className={cn(
                      "absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors",
                      tempSettings.theme === theme.value
                        ? 'border-primary bg-primary text-pip-bg-primary shadow-md'
                        : 'border-pip-border bg-pip-bg-primary/50'
                    )}>
                      {tempSettings.theme === theme.value && (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-pip-display text-pip-text-bright truncate">
                      {theme.label}
                    </div>
                    <div className="text-xs text-pip-text-secondary font-pip-mono mt-1 line-clamp-2 min-h-[2rem]">
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
    <UniversalSettingsTemplate
      isOpen={open}
      onClose={onClose}
      title="ATOMIC CLOCK SETTINGS"
      description="Configure the display and appearance of your atomic clock widget."
      sections={sections}
      onSave={handleSave}
      onReset={handleReset}
      isDirty={isDirty}
      size="large"
    />
  );
};