import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Palette, Volume2, Layout } from 'lucide-react';
import { UniversalSettingsTemplate } from '@/components/settings/UniversalSettingsTemplate';
import { SettingsToggle, SettingsSelect, SettingsSlider, SettingsGroup } from '@/components/settings/SettingsControls';
import { useTheme, PipBoyTheme, ScrollingScanLineMode } from '@/contexts/ThemeContext';
import { ColorTheme } from './PipBoyContainer';
import { cn } from '@/lib/utils';
import type { SettingsSection } from '@/types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentTheme, 
    setTheme, 
    soundEnabled, 
    setSoundEnabled, 
    glowIntensity, 
    setGlowIntensity, 
    backgroundScanLines, 
    setBackgroundScanLines, 
    scrollingScanLines, 
    setScrollingScanLines 
  } = useTheme();
  const [tempSettings, setTempSettings] = useState({
    theme: currentTheme,
    sound: soundEnabled,
    volume: 50,
    animationSpeed: 1,
    autoSave: true,
    notifications: true,
    glowIntensity: glowIntensity,
    backgroundScanLines: backgroundScanLines,
    scrollingScanLines: scrollingScanLines
  });

  useEffect(() => {
    setTempSettings({
      theme: currentTheme,
      sound: soundEnabled,
      volume: 50,
      animationSpeed: 1,
      autoSave: true,
      notifications: true,
      glowIntensity: glowIntensity,
      backgroundScanLines: backgroundScanLines,
      scrollingScanLines: scrollingScanLines
    });
  }, [currentTheme, soundEnabled, glowIntensity, backgroundScanLines, scrollingScanLines]);

  const themeColors: Record<ColorTheme, { color: string; name: string }> = {
    green: { color: 'hsl(120 100% 50%)', name: 'CLASSIC GREEN' },
    amber: { color: 'hsl(45 100% 55%)', name: 'AMBER GLOW' },
    blue: { color: 'hsl(200 100% 55%)', name: 'ICE BLUE' },
    red: { color: 'hsl(0 100% 55%)', name: 'EMERGENCY RED' },
    white: { color: 'hsl(0 0% 90%)', name: 'PURE WHITE' }
  };

  const handleThemeChange = (theme: ColorTheme) => {
    setTempSettings(prev => ({ ...prev, theme: theme as PipBoyTheme }));
  };

  const handleSaveSettings = () => {
    setTheme(tempSettings.theme);
    setSoundEnabled(tempSettings.sound);
    setGlowIntensity(tempSettings.glowIntensity);
    setBackgroundScanLines(tempSettings.backgroundScanLines);
    setScrollingScanLines(tempSettings.scrollingScanLines);
    onClose();
  };

  const handleResetSettings = () => {
    setTempSettings({
      theme: 'green' as PipBoyTheme,
      sound: true,
      volume: 50,
      animationSpeed: 1,
      autoSave: true,
      notifications: true,
      glowIntensity: 75,
      backgroundScanLines: 50,
      scrollingScanLines: 'normal' as ScrollingScanLineMode
    });
  };

  // Check if settings have changed for dirty state
  const isDirty = tempSettings.theme !== currentTheme || 
                  tempSettings.sound !== soundEnabled || 
                  tempSettings.glowIntensity !== glowIntensity || 
                  tempSettings.backgroundScanLines !== backgroundScanLines ||
                  tempSettings.scrollingScanLines !== scrollingScanLines;

  const sections: SettingsSection[] = [
    {
      id: 'theme',
      title: 'Appearance & Theme',
      description: 'Configure color schemes and visual effects',
      icon: Palette,
      order: 1,
      content: (
        <SettingsGroup>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-pip-display font-semibold text-pip-text-bright mb-4 pip-text-glow">
                COLOR SCHEME
              </h4>
              <div className="grid grid-cols-5 gap-3">
                {(Object.keys(themeColors) as ColorTheme[]).map((theme) => (
                  <Button
                    key={theme}
                    variant="ghost"
                    className={cn(
                      "flex flex-col items-center p-4 h-auto border-2 transition-all duration-300",
                      tempSettings.theme === theme 
                        ? 'border-pip-text-bright shadow-pip-glow bg-primary/10' 
                        : 'border-pip-border hover:border-pip-border-bright'
                    )}
                    onClick={() => handleThemeChange(theme)}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-pip-border mb-2"
                      style={{ backgroundColor: themeColors[theme].color }}
                    />
                    <span className="text-xs font-pip-mono text-pip-text-primary">
                      {themeColors[theme].name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <SettingsSlider
              label="Glow Intensity"
              description="Adjust the intensity of screen glow effects"
              value={tempSettings.glowIntensity}
              onChange={(value) => setTempSettings(prev => ({ ...prev, glowIntensity: value }))}
              min={0}
              max={100}
              step={5}
              unit="%"
              showValue={true}
            />

            <SettingsSlider
              label="Background Scan Lines"
              description="Control background scanline visibility"
              value={tempSettings.backgroundScanLines}
              onChange={(value) => setTempSettings(prev => ({ ...prev, backgroundScanLines: value }))}
              min={0}
              max={100}
              step={5}
              unit="%"
              showValue={true}
            />

            <SettingsSelect
              label="Scrolling Scan Lines"
              description="Configure animated scanline behavior"
              value={tempSettings.scrollingScanLines}
              onChange={(value) => setTempSettings(prev => ({ ...prev, scrollingScanLines: value as ScrollingScanLineMode }))}
              options={[
                { value: 'off', label: 'OFF' },
                { value: 'normal', label: 'NORMAL' },
                { value: 'random', label: 'RANDOM' }
              ]}
            />
          </div>
        </SettingsGroup>
      )
    },
    {
      id: 'audio',
      title: 'Audio & Sound',
      description: 'Configure sound settings and volume levels',
      icon: Volume2,
      order: 2,
      content: (
        <SettingsGroup>
          <SettingsToggle
            label="System Sounds"
            description="Enable or disable interface sound effects"
            value={tempSettings.sound}
            onChange={(checked) => setTempSettings(prev => ({ ...prev, sound: checked }))}
          />

          <SettingsSlider
            label="Master Volume"
            description="Adjust overall sound volume"
            value={tempSettings.volume}
            onChange={(value) => setTempSettings(prev => ({ ...prev, volume: value }))}
            min={0}
            max={100}
            step={1}
            unit="%"
            showValue={true}
          />
        </SettingsGroup>
      )
    },
    {
      id: 'interface',
      title: 'Interface & Performance',
      description: 'Adjust interface behavior and performance settings',
      icon: Layout,
      order: 3,
      content: (
        <SettingsGroup>
          <SettingsSelect
            label="Animation Speed"
            description="Control interface animation speed"
            value={tempSettings.animationSpeed.toString()}
            onChange={(value) => setTempSettings(prev => ({ ...prev, animationSpeed: parseFloat(value as string) }))}
            options={[
              { value: '0', label: 'DISABLED' },
              { value: '0.5', label: 'SLOW' },
              { value: '1', label: 'NORMAL' },
              { value: '1.5', label: 'FAST' }
            ]}
          />

          <SettingsToggle
            label="Auto-Save Layouts"
            description="Automatically save tab and widget layouts"
            value={tempSettings.autoSave}
            onChange={(checked) => setTempSettings(prev => ({ ...prev, autoSave: checked }))}
          />
        </SettingsGroup>
      )
    }
  ];

  return (
    <UniversalSettingsTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="SYSTEM CONFIGURATION"
      description="CHIMERA-PIP 4000 mk2 INTERFACE SETTINGS"
      sections={sections}
      onSave={handleSaveSettings}
      onReset={handleResetSettings}
      isDirty={isDirty}
      size="large"
    />
  );
};