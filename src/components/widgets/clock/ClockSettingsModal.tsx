import React, { useState, useEffect } from 'react';
import { Clock, Palette, Check, Globe, AlarmClock, Sparkles, Plus, Trash2 } from 'lucide-react';
import { UniversalSettingsTemplate } from '@/components/settings/UniversalSettingsTemplate';
import { SettingsToggle, SettingsGroup, SettingsSelect, SettingsInput } from '@/components/settings/SettingsControls';
import { ClockThemePreview } from './ClockThemePreview';
import { Button } from '@/components/ui/button';
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

  // Check if settings have changed with deep comparison
  useEffect(() => {
    const currentStr = JSON.stringify(settings);
    const tempStr = JSON.stringify(tempSettings);
    setIsDirty(currentStr !== tempStr);
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

  const updateEffectSetting = (key: keyof AtomicClockSettings['effects'], value: boolean) => {
    setTempSettings(prev => ({
      ...prev,
      effects: { ...prev.effects, [key]: value }
    }));
  };

  const addWorldClock = () => {
    const newClock = {
      id: Date.now().toString(),
      timezone: 'UTC',
      label: 'New Clock'
    };
    setTempSettings(prev => ({
      ...prev,
      worldClocks: [...prev.worldClocks, newClock]
    }));
  };

  const removeWorldClock = (id: string) => {
    setTempSettings(prev => ({
      ...prev,
      worldClocks: prev.worldClocks.filter(clock => clock.id !== id)
    }));
  };

  const updateWorldClock = (id: string, field: string, value: string | number) => {
    setTempSettings(prev => ({
      ...prev,
      worldClocks: prev.worldClocks.map(clock =>
        clock.id === id ? { ...clock, [field]: String(value) } : clock
      )
    }));
  };

  const addAlarm = () => {
    const newAlarm = {
      id: Date.now().toString(),
      time: '09:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      enabled: true,
      label: 'New Alarm',
      sound: 'default'
    };
    setTempSettings(prev => ({
      ...prev,
      alarms: [...prev.alarms, newAlarm]
    }));
  };

  const removeAlarm = (id: string) => {
    setTempSettings(prev => ({
      ...prev,
      alarms: prev.alarms.filter(alarm => alarm.id !== id)
    }));
  };

  const updateAlarm = (id: string, field: string, value: string | number | boolean | string[]) => {
    setTempSettings(prev => ({
      ...prev,
      alarms: prev.alarms.map(alarm =>
        alarm.id === id ? { 
          ...alarm, 
          [field]: typeof value === 'number' ? String(value) : value 
        } : alarm
      )
    }));
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

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Chicago', label: 'Central Time (US)' },
    { value: 'America/Denver', label: 'Mountain Time (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
    { value: 'Europe/London', label: 'London, UK' },
    { value: 'Europe/Paris', label: 'Paris, France' },
    { value: 'Europe/Berlin', label: 'Berlin, Germany' },
    { value: 'Asia/Tokyo', label: 'Tokyo, Japan' },
    { value: 'Asia/Shanghai', label: 'Shanghai, China' },
    { value: 'Asia/Kolkata', label: 'Mumbai, India' },
    { value: 'Australia/Sydney', label: 'Sydney, Australia' },
  ];

  const soundOptions = [
    { value: 'default', label: 'Default Beep' },
    { value: 'geiger', label: 'Geiger Counter' },
    { value: 'pipboy', label: 'Pip-Boy Alert' },
    { value: 'terminal', label: 'Terminal Bell' },
    { value: 'siren', label: 'Vault Alarm' },
  ];

  const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
    },
    {
      id: 'worldclocks',
      title: 'World Clocks',
      description: 'Add and configure additional timezone displays.',
      icon: Globe,
      order: 3,
      content: (
        <SettingsGroup>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-pip-display text-pip-text-bright">
                  Timezone Displays
                </div>
                <div className="text-xs text-pip-text-secondary font-pip-mono">
                  Show multiple timezones simultaneously
                </div>
              </div>
              <Button
                onClick={addWorldClock}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Clock
              </Button>
            </div>
            
            {tempSettings.worldClocks.map((clock) => (
              <div key={clock.id} className="border border-pip-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <SettingsInput
                    label="Label"
                    value={clock.label}
                    onChange={(value) => updateWorldClock(clock.id, 'label', value)}
                    placeholder="Clock label"
                    className="flex-1 mr-3"
                  />
                  <Button
                    onClick={() => removeWorldClock(clock.id)}
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <SettingsSelect
                  label="Timezone"
                  value={clock.timezone}
                  onChange={(value) => updateWorldClock(clock.id, 'timezone', value)}
                  options={timezoneOptions}
                />
              </div>
            ))}
          </div>
        </SettingsGroup>
      )
    },
    {
      id: 'alarms',
      title: 'Alarms',
      description: 'Configure alarm notifications and schedules.',
      icon: AlarmClock,
      order: 4,
      content: (
        <SettingsGroup>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-pip-display text-pip-text-bright">
                  Alarm Settings
                </div>
                <div className="text-xs text-pip-text-secondary font-pip-mono">
                  Set up recurring alarms
                </div>
              </div>
              <Button
                onClick={addAlarm}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Alarm
              </Button>
            </div>
            
            {tempSettings.alarms.map((alarm) => (
              <div key={alarm.id} className="border border-pip-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <SettingsToggle
                    label="Enabled"
                    value={alarm.enabled}
                    onChange={(value) => updateAlarm(alarm.id, 'enabled', value)}
                  />
                  <Button
                    onClick={() => removeAlarm(alarm.id)}
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <SettingsInput
                    label="Label"
                    value={alarm.label}
                    onChange={(value) => updateAlarm(alarm.id, 'label', value)}
                    placeholder="Alarm name"
                  />
                  <div className="space-y-2">
                    <div className="text-sm font-pip-display text-pip-text-bright">
                      Time
                    </div>
                    <input
                      type="time"
                      value={alarm.time}
                      onChange={(e) => updateAlarm(alarm.id, 'time', e.target.value)}
                      className="w-full px-3 py-2 bg-pip-bg-secondary border border-pip-border rounded-md text-pip-text-bright font-pip-mono focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                
                <SettingsSelect
                  label="Sound"
                  value={alarm.sound}
                  onChange={(value) => updateAlarm(alarm.id, 'sound', value)}
                  options={soundOptions}
                />
                
                <div>
                  <div className="text-sm font-pip-display text-pip-text-bright mb-2">
                    Days
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {dayOptions.map((day) => (
                      <Button
                        key={day}
                        size="sm"
                        variant={alarm.days.includes(day) ? "default" : "outline"}
                        onClick={() => {
                          const newDays = alarm.days.includes(day)
                            ? alarm.days.filter(d => d !== day)
                            : [...alarm.days, day];
                          updateAlarm(alarm.id, 'days', newDays);
                        }}
                        className="text-xs"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingsGroup>
      )
    },
    {
      id: 'effects',
      title: 'Visual Effects',
      description: 'Configure visual enhancements and animations.',
      icon: Sparkles,
      order: 5,
      content: (
        <SettingsGroup>
          <SettingsToggle
            label="Particle Effects"
            description="Enable atmospheric particle animations"
            value={tempSettings.effects.particles}
            onChange={(value) => updateEffectSetting('particles', value)}
          />
          
          <SettingsToggle
            label="Scanlines"
            description="Add retro CRT scanline effect"
            value={tempSettings.effects.scanlines}
            onChange={(value) => updateEffectSetting('scanlines', value)}
          />
          
          <SettingsToggle
            label="Glow Effect"
            description="Add screen phosphor glow effect"
            value={tempSettings.effects.glow}
            onChange={(value) => updateEffectSetting('glow', value)}
          />
        </SettingsGroup>
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