import React, { useState, useEffect } from 'react';
import { Palette, Volume2, Settings } from 'lucide-react';
import { useTheme, PipBoyTheme, ScrollingScanLineMode } from '@/contexts/ThemeContext';
import { UniversalSettingsTemplate } from '../UniversalSettingsTemplate';
import { 
  SettingsToggle, 
  SettingsSelect, 
  SettingsSlider, 
  SettingsGroup 
} from '../SettingsControls';
import type { SettingsSection } from '@/types/settings';

interface SystemSettingsExampleProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemSettingsExample: React.FC<SystemSettingsExampleProps> = ({
  isOpen,
  onClose,
}) => {
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
    glowIntensity: glowIntensity,
    backgroundScanLines: backgroundScanLines,
    scrollingScanLines: scrollingScanLines,
    masterVolume: 50,
    animationSpeed: 'normal' as const,
    autoSaveLayouts: true
  });
  
  const [isDirty, setIsDirty] = useState(false);

  // Sync temp settings with theme when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSettings({
        theme: currentTheme,
        sound: soundEnabled,
        glowIntensity: glowIntensity,
        backgroundScanLines: backgroundScanLines,
        scrollingScanLines: scrollingScanLines,
        masterVolume: 50,
        animationSpeed: 'normal',
        autoSaveLayouts: true
      });
      setIsDirty(false);
    }
  }, [isOpen, currentTheme, soundEnabled, glowIntensity, backgroundScanLines, scrollingScanLines]);

  // Check if settings have changed
  useEffect(() => {
    const originalSettings = {
      theme: currentTheme,
      sound: soundEnabled,
      glowIntensity: glowIntensity,
      backgroundScanLines: backgroundScanLines,
      scrollingScanLines: scrollingScanLines,
      masterVolume: 50,
      animationSpeed: 'normal',
      autoSaveLayouts: true
    };
    setIsDirty(JSON.stringify(tempSettings) !== JSON.stringify(originalSettings));
  }, [tempSettings, currentTheme, soundEnabled, glowIntensity, backgroundScanLines, scrollingScanLines]);

  const handleSave = () => {
    setTheme(tempSettings.theme);
    setSoundEnabled(tempSettings.sound);
    setGlowIntensity(tempSettings.glowIntensity);
    setBackgroundScanLines(tempSettings.backgroundScanLines);
    setScrollingScanLines(tempSettings.scrollingScanLines);
    setIsDirty(false);
    onClose();
  };

  const handleReset = () => {
    setTempSettings({
      theme: currentTheme,
      sound: soundEnabled,
      glowIntensity: glowIntensity,
      backgroundScanLines: backgroundScanLines,
      scrollingScanLines: scrollingScanLines,
      masterVolume: 50,
      animationSpeed: 'normal',
      autoSaveLayouts: true
    });
    setIsDirty(false);
  };

  // Theme color options
  const themeColors = {
    green: { name: 'Classic Green' },
    blue: { name: 'Vault Blue' },
    amber: { name: 'Amber Glow' },
    red: { name: 'Alert Red' },
    white: { name: 'Vault White' }
  };

  const colorOptions = Object.entries(themeColors).map(([key, { name }]) => ({
    value: key,
    label: name
  }));

  const sections: SettingsSection[] = [
    {
      id: 'appearance',
      title: 'Appearance & Theme',
      description: 'Customize the visual appearance and color scheme of your Pip-Boy interface.',
      icon: Palette,
      order: 1,
      content: (
        <SettingsGroup>
          <SettingsSelect
            label="Color Theme"
            description="Select the primary color scheme for the interface"
            value={tempSettings.theme}
            onChange={(value) => setTempSettings(prev => ({ ...prev, theme: value as PipBoyTheme }))}
            options={colorOptions}
          />
          
          <SettingsSlider
            label="Glow Intensity"
            description="Adjust the intensity of the terminal glow effects"
            value={tempSettings.glowIntensity}
            onChange={(value) => setTempSettings(prev => ({ ...prev, glowIntensity: value }))}
            min={0}
            max={100}
            step={5}
            unit="%"
          />
          
          <SettingsSlider
            label="Background Scan Lines"
            description="Adjust the intensity of background scan line effects"
            value={tempSettings.backgroundScanLines}
            onChange={(value) => setTempSettings(prev => ({ ...prev, backgroundScanLines: value }))}
            min={0}
            max={100}
            step={5}
            unit="%"
          />
          
          <SettingsSelect
            label="Scrolling Scan Lines"
            description="Configure animated scrolling scan line behavior"
            value={tempSettings.scrollingScanLines}
            onChange={(value) => setTempSettings(prev => ({ ...prev, scrollingScanLines: value as ScrollingScanLineMode }))}
            options={[
              { value: 'off', label: 'Disabled' },
              { value: 'normal', label: 'Normal Speed' },
              { value: 'random', label: 'Random Speed' }
            ]}
          />
        </SettingsGroup>
      )
    },
    {
      id: 'audio',
      title: 'Audio & Sound',
      description: 'Configure system sounds and audio feedback.',
      icon: Volume2,
      order: 2,
      content: (
        <SettingsGroup>
          <SettingsToggle
            label="System Sounds"
            description="Enable or disable UI sound effects"
            value={tempSettings.sound}
            onChange={(value) => setTempSettings(prev => ({ ...prev, sound: value }))}
          />
          
          <SettingsSlider
            label="Master Volume"
            description="Adjust the overall volume of system sounds"
            value={tempSettings.masterVolume}
            onChange={(value) => setTempSettings(prev => ({ ...prev, masterVolume: value }))}
            min={0}
            max={100}
            step={5}
            unit="%"
          />
        </SettingsGroup>
      )
    },
    {
      id: 'interface',
      title: 'Interface & Performance',
      description: 'Adjust interface behavior and performance settings.',
      icon: Settings,
      order: 3,
      content: (
        <SettingsGroup>
          <SettingsSelect
            label="Animation Speed"
            description="Control the speed of interface animations"
            value={tempSettings.animationSpeed}
            onChange={(value) => setTempSettings(prev => ({ ...prev, animationSpeed: value as any }))}
            options={[
              { value: 'slow', label: 'Slow' },
              { value: 'normal', label: 'Normal' },
              { value: 'fast', label: 'Fast' },
              { value: 'instant', label: 'Instant' }
            ]}
          />
          
          <SettingsToggle
            label="Auto-Save Layouts"
            description="Automatically save widget layouts and positions"
            value={tempSettings.autoSaveLayouts}
            onChange={(value) => setTempSettings(prev => ({ ...prev, autoSaveLayouts: value }))}
          />
        </SettingsGroup>
      )
    }
  ];

  return (
    <UniversalSettingsTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="SYSTEM SETTINGS"
      description="Configure your Pip-Boy interface preferences and behavior."
      sections={sections}
      onSave={handleSave}
      onReset={handleReset}
      isDirty={isDirty}
      size="large"
    />
  );
};