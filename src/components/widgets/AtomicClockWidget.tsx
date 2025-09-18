import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDebounce } from '@/hooks/core/useDebounce';
import { Button } from '@/components/ui/button';
import { Settings, Clock, Globe, Bell } from 'lucide-react';
import { WidgetTemplate } from './WidgetTemplate';
import { ConsolidatedClocksPanel } from './clock/ConsolidatedClocksPanel';
import { AlarmManager } from './clock/AlarmManager';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { SettingsGroup, SettingsToggle, SettingsSelect, SettingsSlider } from '@/components/ui/SettingsControls';
import { ClockThemePreview } from './clock/ClockThemePreview';
import { VisualEffectsRenderer } from './clock/VisualEffectsRenderer';
import { useLocalStorage } from '@/hooks/core/useLocalStorage';
import { timeUtils } from './clock/utils/timeUtils';

export interface AtomicClockSettings {
  title?: string;
  theme: string;
  showSeconds: boolean;
  format24: boolean;
  showDate: boolean;
  showTimezone: boolean;
  worldClocks: Array<{
    id: string;
    timezone: string;
    label: string;
  }>;
  alarms: Array<{
    id: string;
    time: string;
    days: string[];
    enabled: boolean;
    label: string;
    sound: string;
  }>;
  effects: {
    particles: boolean;
    scanlines: boolean;
    glow: boolean;
  };
}

interface AtomicClockWidgetProps {
  title?: string;
  settings: AtomicClockSettings;
  onSettingsChange: (settings: AtomicClockSettings) => void;
  widgetId?: string;
  widget?: any;
  onRemove?: () => void;
  onToggleCollapse?: () => void;
  onToggleFullWidth?: () => void;
  onOpenSettings?: () => void;
}

export const AtomicClockWidget: React.FC<AtomicClockWidgetProps> = ({
  title = "Atomic Clock",
  settings,
  onSettingsChange,
  widgetId = 'default',
  widget,
  onRemove,
  onToggleCollapse,
  onToggleFullWidth,
  onOpenSettings
}) => {
  const [activePanel, setActivePanel] = useState<'clock' | 'alarms'>('clock');
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Merge default settings
  const defaultSettings: AtomicClockSettings = {
    theme: 'vault-tec',
    showSeconds: true,
    format24: false,
    showDate: true,
    showTimezone: true,
    worldClocks: [
      { id: '1', timezone: 'America/New_York', label: 'New York' },
      { id: '2', timezone: 'Europe/London', label: 'London' },
      { id: '3', timezone: 'Asia/Tokyo', label: 'Tokyo' }
    ],
    alarms: [],
    effects: {
      particles: true,
      scanlines: true,
      glow: true
    }
  };

  const mergedSettings = useMemo(() => ({ ...defaultSettings, ...settings }), [settings]);
  
  // Debounce theme changes to prevent rapid re-renders
  const debouncedTheme = useDebounce(mergedSettings.theme, 100);

  const [tempSettings, setTempSettings] = useState<Pick<AtomicClockSettings, 'format24' | 'showSeconds' | 'showDate' | 'theme' | 'effects'>>({
    format24: mergedSettings.format24,
    showSeconds: mergedSettings.showSeconds,
    showDate: mergedSettings.showDate,
    theme: mergedSettings.theme,
    effects: mergedSettings.effects,
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (showSettings) {
      setTempSettings({
        format24: mergedSettings.format24,
        showSeconds: mergedSettings.showSeconds,
        showDate: mergedSettings.showDate,
        theme: mergedSettings.theme,
        effects: mergedSettings.effects,
      });
      setIsDirty(false);
    }
  }, [showSettings, mergedSettings.format24, mergedSettings.showSeconds, mergedSettings.showDate, mergedSettings.theme, mergedSettings.effects]);

  useEffect(() => {
    const dirty =
      tempSettings.format24 !== mergedSettings.format24 ||
      tempSettings.showSeconds !== mergedSettings.showSeconds ||
      tempSettings.showDate !== mergedSettings.showDate ||
      tempSettings.theme !== mergedSettings.theme ||
      JSON.stringify(tempSettings.effects) !== JSON.stringify(mergedSettings.effects);
    setIsDirty(dirty);
  }, [tempSettings, mergedSettings.format24, mergedSettings.showSeconds, mergedSettings.showDate, mergedSettings.theme, mergedSettings.effects]);

  // Time update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, mergedSettings.showSeconds ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [mergedSettings.showSeconds]);

  // Alarm checking effect
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTimeStr = timeUtils.formatTime(now, mergedSettings.format24);
      const currentDay = timeUtils.getDayOfWeek(now);

      mergedSettings.alarms.forEach(alarm => {
        if (alarm.enabled && 
            alarm.days.includes(currentDay) && 
            alarm.time === currentTimeStr.substring(0, 5)) {
          // Trigger alarm
          console.log(`Alarm triggered: ${alarm.label}`);
        }
      });
    };

    const interval = setInterval(checkAlarms, 60000);
    return () => clearInterval(interval);
  }, [mergedSettings.alarms, mergedSettings.format24]);

  const handleSettingsUpdate = (newSettings: Partial<AtomicClockSettings>) => {
    const updated = { ...mergedSettings, ...newSettings };
    onSettingsChange(updated);
  };

  const themeClass = `clock-theme-${mergedSettings.theme}`;

  // Status bar content (Clock/Alarms toggle buttons)
  const statusBarContent = (
    <div className="flex items-center gap-2">
      <Button
        variant={activePanel === 'clock' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActivePanel('clock')}
        className="h-8 px-3 text-xs"
      >
        <Globe className="h-3 w-3 mr-1" />
        Clock
      </Button>
      
      <Button
        variant={activePanel === 'alarms' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActivePanel('alarms')}
        className="h-8 px-3 text-xs"
      >
        <Bell className="h-3 w-3 mr-1" />
        Alarms
      </Button>
    </div>
  );

  return (
    <>
      <WidgetTemplate
        title={title}
        settings={{...mergedSettings, theme: mergedSettings.theme}}
        icon={Clock}
        statusBarContent={statusBarContent}
        widget={widget}
        onRemove={onRemove}
        onToggleCollapse={onToggleCollapse}
        onToggleFullWidth={onToggleFullWidth}
        onOpenSettings={() => setShowSettings(true)}
        contentClassName="p-4"
        className={`atomic-clock-widget clock-theme-${mergedSettings.theme} relative overflow-hidden`}
      >
        {/* Visual Effects Canvas */}
        {mergedSettings.effects.particles && (
          <VisualEffectsRenderer
            ref={canvasRef}
            theme={debouncedTheme}
            effects={mergedSettings.effects}
          />
        )}

        {/* Scanlines Overlay */}
        {mergedSettings.effects.scanlines && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="scanlines opacity-20" />
          </div>
        )}

        {/* Panel Content - Direct content without extra wrapper */}
        <div className="relative z-10">
          {activePanel === 'clock' ? (
            <ConsolidatedClocksPanel
              currentTime={currentTime}
              settings={mergedSettings}
              onSettingsChange={handleSettingsUpdate}
            />
          ) : (
            <AlarmManager
              alarms={mergedSettings.alarms}
              onAlarmsChange={(alarms) => handleSettingsUpdate({ alarms })}
              format24={mergedSettings.format24}
            />
          )}
        </div>
      </WidgetTemplate>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Clock Settings"
        description="Configure your atomic clock display preferences"
        onSave={() => { handleSettingsUpdate(tempSettings); setShowSettings(false); }}
        onReset={() => setTempSettings({
          format24: mergedSettings.format24,
          showSeconds: mergedSettings.showSeconds,
          showDate: mergedSettings.showDate,
          theme: mergedSettings.theme,
          effects: mergedSettings.effects,
        })}
        isDirty={isDirty}
      >
        <SettingsGroup title="Display Options" description="Customize how time is displayed">
          <SettingsToggle
            label="24-Hour Format"
            description="Show time in 24-hour format instead of 12-hour with AM/PM"
            checked={tempSettings.format24}
            onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, format24: checked }))}
          />

          <SettingsToggle
            label="Show Seconds"
            description="Display seconds in the time"
            checked={tempSettings.showSeconds}
            onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, showSeconds: checked }))}
          />

          <SettingsToggle
            label="Show Date"
            description="Display the current date below the time" 
            checked={tempSettings.showDate}
            onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, showDate: checked }))}
          />
        </SettingsGroup>

        <SettingsGroup title="Theme" description="Choose and preview your clock theme">
          <SettingsSelect
            label="Clock Theme"
            description="Select the visual theme for the clock"
            value={tempSettings.theme}
            onChange={(value) => setTempSettings(prev => ({ ...prev, theme: value }))}
            options={[
              { value: 'vault-tec', label: 'Vault-Tec' },
              { value: 'military', label: 'Military' },
              { value: 'nixie', label: 'Nixie Tube' },
              { value: 'led', label: 'LED Display' },
              { value: 'terminal', label: 'Terminal' },
              { value: 'plasma', label: 'Plasma' },
              { value: 'hologram', label: 'Hologram' },
              { value: 'retro-lcd', label: 'Retro LCD' },
              { value: 'retro', label: 'Retro' },
              { value: 'minimal', label: 'Minimal' },
            ]}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-pip-text-bright">Theme Preview</label>
            <div className="border border-pip-border rounded-lg p-4 bg-pip-surface">
                    <ClockThemePreview
                      theme={tempSettings.theme}
                      showSeconds={false}
                      format24={tempSettings.format24}
                      showDate={tempSettings.showDate}
                    />
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Visual Effects" description="Enable atmospheric visual effects">
          <SettingsToggle
            label="Particle Effects"
            description="Show animated particles in the background"
            checked={tempSettings.effects.particles}
            onCheckedChange={(checked) => setTempSettings(prev => ({ 
              ...prev, 
              effects: { ...prev.effects, particles: checked }
            }))}
          />

          <SettingsToggle
            label="Scanlines"
            description="Add retro CRT-style scanlines overlay"
            checked={tempSettings.effects.scanlines}
            onCheckedChange={(checked) => setTempSettings(prev => ({ 
              ...prev, 
              effects: { ...prev.effects, scanlines: checked }
            }))}
          />

          <SettingsToggle
            label="Glow Effect"
            description="Add atmospheric glow around the clock"
            checked={tempSettings.effects.glow}
            onCheckedChange={(checked) => setTempSettings(prev => ({ 
              ...prev, 
              effects: { ...prev.effects, glow: checked }
            }))}
          />
        </SettingsGroup>
      </SettingsModal>
    </>
  );
};