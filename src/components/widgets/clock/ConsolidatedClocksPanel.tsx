import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Sun, Moon, Search, MapPin } from 'lucide-react';
import { timeUtils } from './utils/timeUtils';
import { AtomicClockSettings } from '../AtomicClockWidget';

interface ConsolidatedClocksPanelProps {
  currentTime: Date;
  settings: AtomicClockSettings;
  onSettingsChange: (settings: Partial<AtomicClockSettings>) => void;
}

export const ConsolidatedClocksPanel: React.FC<ConsolidatedClocksPanelProps> = ({
  currentTime,
  settings,
  onSettingsChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClock, setShowAddClock] = useState(false);

  // Main time display
  const mainTimeData = timeUtils.getTimeData(currentTime);
  const mainTimeStr = timeUtils.formatTime(
    currentTime, 
    settings.format24, 
    settings.showSeconds
  );

  // Popular timezones for quick selection
  const popularTimezones = timeUtils.getPopularTimezones();
  const filteredTimezones = popularTimezones.filter(tz =>
    tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tz.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addWorldClock = (timezone: string, label: string) => {
    const newClock = {
      id: Date.now().toString(),
      timezone,
      label
    };
    
    const updatedWorldClocks = [...settings.worldClocks, newClock];
    onSettingsChange({ worldClocks: updatedWorldClocks });
    setShowAddClock(false);
    setSearchQuery('');
  };

  const removeWorldClock = (clockId: string) => {
    const updatedWorldClocks = settings.worldClocks.filter(clock => clock.id !== clockId);
    onSettingsChange({ worldClocks: updatedWorldClocks });
  };

  const getThemeStyles = (theme: string) => {
    // All themes now use system colors for consistency
    const themes = {
      'vault-tec': {
        mainText: 'text-primary font-mono',
        accent: 'text-primary/80 font-mono',
        glow: 'drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]',
        bg: 'bg-pip-bg-primary/30',
        container: 'font-mono'
      },
      'military': {
        mainText: 'text-primary font-bold tracking-wider',
        accent: 'text-primary/80 font-bold',
        glow: 'drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]',
        bg: 'bg-pip-bg-primary/30',
        container: 'font-bold tracking-wider'
      },
      'nixie': {
        mainText: 'text-primary font-serif italic',
        accent: 'text-primary/80 font-serif',
        glow: 'drop-shadow-[0_0_12px_rgba(var(--primary),0.8)]',
        bg: 'bg-pip-bg-primary/30',
        container: 'font-serif italic'
      },
      'led': {
        mainText: 'text-primary font-mono font-black tracking-widest',
        accent: 'text-primary/80 font-mono font-bold',
        glow: 'drop-shadow-[0_0_6px_rgba(var(--primary),0.9)]',
        bg: 'bg-pip-bg-primary/30',
        container: 'font-mono font-black tracking-widest'
      },
      'terminal': {
        mainText: 'text-primary font-mono font-light',
        accent: 'text-primary/80 font-mono font-light',
        glow: 'drop-shadow-[0_0_4px_rgba(var(--primary),0.4)]',
        bg: 'bg-pip-bg-primary/30',
        container: 'font-mono font-light'
      },
      'plasma': {
        mainText: 'text-primary font-sans font-extralight tracking-wide',
        accent: 'text-primary/80 font-sans font-light',
        glow: 'drop-shadow-[0_0_12px_rgba(var(--primary),0.7)] drop-shadow-[0_0_24px_rgba(var(--primary),0.3)]',
        bg: 'bg-pip-bg-primary/30',
        container: 'font-sans font-extralight tracking-wide'
      },
      'hologram': {
        mainText: 'text-primary font-sans font-thin tracking-[0.2em] opacity-90',
        accent: 'text-primary/70 font-sans font-thin',
        glow: 'drop-shadow-[0_0_8px_rgba(var(--primary),0.5)] drop-shadow-[0_0_16px_rgba(var(--primary),0.3)]',
        bg: 'bg-pip-bg-primary/30',
        container: 'font-sans font-thin tracking-[0.2em]'
      },
      'retro-lcd': {
        mainText: 'text-primary font-mono font-medium',
        accent: 'text-primary/80 font-mono',
        glow: 'drop-shadow-[0_0_2px_rgba(var(--primary),0.8)]',
        bg: 'bg-pip-bg-primary/30',
        container: 'font-mono font-medium'
      }
    };
    
    return themes[theme as keyof typeof themes] || themes['vault-tec'];
  };

  const themeStyle = getThemeStyles('vault-tec');

  return (
    <div className="space-y-6">
      {/* Main Clock Display - Render directly without card wrapper */}
      <div className={`text-center py-4 ${themeStyle.container} ${settings.effects.glow ? themeStyle.glow : ''}`}>
        {/* Main Time */}
        <div className={`text-4xl md:text-6xl font-bold ${themeStyle.mainText} leading-none mb-2`}>
          {mainTimeStr}
        </div>
        
        {/* Date Display */}
        {settings.showDate && (
          <div className={`text-lg ${themeStyle.accent} mb-2`}>
            {mainTimeData.formattedDate}
          </div>
        )}
        
        {/* Timezone Display */}
        {settings.showTimezone && (
          <div className={`text-sm ${themeStyle.accent} flex items-center justify-center gap-2`}>
            <MapPin className="w-4 h-4" />
            {mainTimeData.timezone}
          </div>
        )}
      </div>

      {/* World Clocks Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className={`text-lg font-pip-display ${themeStyle.mainText}`}>
            World Clocks
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddClock(true)}
            className="pip-button-secondary text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Clock
          </Button>
        </div>

        {/* World Clock Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {settings.worldClocks.map((clock) => {
            const clockTime = timeUtils.formatTime(currentTime, settings.format24, false, clock.timezone);
            const isNight = timeUtils.isNightTime(currentTime, clock.timezone);
            
            return (
              <Card key={clock.id} className={`${themeStyle.bg} border-pip-border relative group ${themeStyle.container}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isNight ? (
                        <Moon className={`w-4 h-4 text-primary/60`} />
                      ) : (
                        <Sun className={`w-4 h-4 text-primary/60`} />
                      )}
                      <span className={`text-sm ${themeStyle.accent}`}>
                        {clock.label}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorldClock(clock.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs p-1 h-auto pip-button-secondary"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className={`text-2xl font-bold ${themeStyle.mainText}`}>
                    {clockTime}
                  </div>
                  
                  <div className={`text-xs ${themeStyle.accent} mt-1`}>
                    {clock.timezone.split('/')[1]?.replace('_', ' ')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Clock Interface */}
        {showAddClock && (
          <Card className={`${themeStyle.bg} border-pip-border`}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className={`font-pip-display ${themeStyle.mainText}`}>
                  Add World Clock
                </h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddClock(false)}
                  className="text-xs pip-button-secondary"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search timezones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pip-input"
                />
              </div>
              
              {/* Timezone List */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredTimezones.map((tz) => (
                  <Button
                    key={tz.value}
                    variant="ghost"
                    className="w-full justify-start text-left pip-button-secondary"
                    onClick={() => addWorldClock(tz.value, tz.label.split(' (')[0])}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{tz.label}</span>
                      <span className="text-xs text-muted-foreground">{tz.region}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};