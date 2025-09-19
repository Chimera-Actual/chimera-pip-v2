import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Clock, Globe, Bell } from 'lucide-react';
import { WidgetShell } from './base/WidgetShell';
import type { WidgetAction } from './base/WidgetActionBar';
import { ConsolidatedClocksPanel } from './clock/ConsolidatedClocksPanel';
import { AlarmManager } from './clock/AlarmManager';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { SettingsToggle } from '@/components/ui/SettingsControls';
import { PrimarySettingsGroup, SecondarySettingsGroup } from '@/components/ui/SettingsGroupEnhanced';
import { VisualEffectsRenderer } from './clock/VisualEffectsRenderer';
import { timeUtils } from './clock/utils/timeUtils';

export interface AtomicClockSettings {
  title?: string;
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
  const animationFrameRef = useRef<number>();

  // Merge default settings (hard-coded to vault-tec theme)
  const defaultSettings: AtomicClockSettings = {
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

  const [tempSettings, setTempSettings] = useState<Pick<AtomicClockSettings, 'format24' | 'showSeconds' | 'showDate' | 'effects'>>({
    format24: mergedSettings.format24,
    showSeconds: mergedSettings.showSeconds,
    showDate: mergedSettings.showDate,
    effects: mergedSettings.effects,
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (showSettings) {
      setTempSettings({
        format24: mergedSettings.format24,
        showSeconds: mergedSettings.showSeconds,
        showDate: mergedSettings.showDate,
        effects: mergedSettings.effects,
      });
      setIsDirty(false);
    }
  }, [showSettings, mergedSettings.format24, mergedSettings.showSeconds, mergedSettings.showDate, mergedSettings.effects]);

  useEffect(() => {
    const dirty =
      tempSettings.format24 !== mergedSettings.format24 ||
      tempSettings.showSeconds !== mergedSettings.showSeconds ||
      tempSettings.showDate !== mergedSettings.showDate ||
      JSON.stringify(tempSettings.effects) !== JSON.stringify(mergedSettings.effects);
    setIsDirty(dirty);
  }, [tempSettings, mergedSettings.format24, mergedSettings.showSeconds, mergedSettings.showDate, mergedSettings.effects]);

  // Optimized timer management with single requestAnimationFrame loop
  useEffect(() => {
    let lastUpdateTime = 0;
    const updateInterval = mergedSettings.showSeconds ? 1000 : 60000;

    const updateLoop = (timestamp: number) => {
      if (timestamp - lastUpdateTime >= updateInterval) {
        const now = new Date();
        setCurrentTime(now);

        // Check alarms (only once per minute)
        if ((timestamp - lastUpdateTime) >= 60000 || lastUpdateTime === 0) {
          const currentTimeStr = timeUtils.formatTime(now, mergedSettings.format24);
          const currentDay = timeUtils.getDayOfWeek(now);

          mergedSettings.alarms.forEach(alarm => {
            if (alarm.enabled && 
                alarm.days.includes(currentDay) && 
                alarm.time === currentTimeStr.substring(0, 5)) {
              console.log(`Alarm triggered: ${alarm.label}`);
            }
          });
        }

        lastUpdateTime = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mergedSettings.showSeconds, mergedSettings.alarms, mergedSettings.format24]);

  const handleSettingsUpdate = useCallback((newSettings: Partial<AtomicClockSettings>) => {
    const updated = { ...mergedSettings, ...newSettings };
    onSettingsChange(updated);
  }, [mergedSettings, onSettingsChange]);

  // Function Bar actions (Clock/Alarms mode tabs + settings)
  const actions: WidgetAction[] = [
    {
      type: 'tab',
      id: 'clock',
      label: 'Clock',
      active: activePanel === 'clock',
      onSelect: () => setActivePanel('clock'),
      icon: Globe,
    },
    {
      type: 'tab', 
      id: 'alarms',
      label: 'Alarms',
      active: activePanel === 'alarms',
      onSelect: () => setActivePanel('alarms'),
      icon: Bell,
    },
    {
      type: 'menu',
      id: 'settings',
      icon: Settings,
      items: [
        {
          id: 'widget-settings',
          label: 'Widget Settings',
          onClick: () => setShowSettings(true),
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      <WidgetShell
        title={title}
        icon={Clock}
        actions={actions}
        onCollapse={onToggleCollapse}
        onClose={onRemove}
        onToggleFullWidth={onToggleFullWidth}
        isFullWidth={widget?.widget_width === 'full'}
        isCollapsed={widget?.collapsed}
        effects={mergedSettings.effects}
        className="atomic-clock-widget clock-theme-vault-tec relative overflow-hidden"
      >
        {/* Visual Effects Canvas */}
        {mergedSettings.effects.particles && (
          <VisualEffectsRenderer
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
      </WidgetShell>

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
          effects: mergedSettings.effects,
        })}
        isDirty={isDirty}
      >
        <PrimarySettingsGroup 
          title="Time Display" 
          description="Configure how time and date information is shown"
        >
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
        </PrimarySettingsGroup>

        <SecondarySettingsGroup 
          title="Visual Effects" 
          description="Customize atmospheric and visual enhancements"
        >
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
        </SecondarySettingsGroup>
      </SettingsModal>
    </>
  );
};