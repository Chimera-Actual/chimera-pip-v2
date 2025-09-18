import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Clock, Globe, Bell } from 'lucide-react';
import { ConsolidatedClocksPanel } from './clock/ConsolidatedClocksPanel';
import { AlarmManager } from './clock/AlarmManager';
import { ClockSettingsModal } from './clock/ClockSettingsModal';
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
}

export const AtomicClockWidget: React.FC<AtomicClockWidgetProps> = ({
  title = "Atomic Clock",
  settings,
  onSettingsChange,
  widgetId = 'default'
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

  const mergedSettings = { ...defaultSettings, ...settings };

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

  return (
    <Card className={`atomic-clock-widget ${themeClass} bg-pip-bg-secondary border-pip-border relative overflow-hidden`}>
      {/* Visual Effects Canvas */}
      {mergedSettings.effects.particles && (
        <VisualEffectsRenderer
          ref={canvasRef}
          theme={mergedSettings.theme}
          effects={mergedSettings.effects}
        />
      )}

      {/* Scanlines Overlay */}
      {mergedSettings.effects.scanlines && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="scanlines opacity-20" />
        </div>
      )}

      <CardContent className="p-4 relative z-10">
        {/* Header with title and controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-pip-text-bright font-pip-display text-lg">
              {title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Panel Toggle Buttons */}
            <Button
              variant={activePanel === 'clock' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel('clock')}
              className="pip-button-secondary text-xs"
            >
              <Globe className="w-4 h-4" />
            </Button>
            
            <Button
              variant={activePanel === 'alarms' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActivePanel('alarms')}
              className="pip-button-secondary text-xs"
            >
              <Bell className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="pip-button-secondary text-xs"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="min-h-[200px]">
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
      </CardContent>

      {/* Settings Modal */}
      <ClockSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={mergedSettings}
        onSave={handleSettingsUpdate}
      />

      {/* Theme-specific styles are handled via CSS classes */}
    </Card>
  );
};