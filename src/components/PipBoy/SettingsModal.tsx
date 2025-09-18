import React, { useState, useEffect } from 'react';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { SettingsGroup, SettingsToggle, SettingsSelect, SettingsSlider } from '@/components/ui/SettingsControls';
import { useTheme, type PipBoyTheme, type ScrollingScanLineMode } from '@/contexts/ThemeContext';

interface PipBoySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PipBoySettingsModal: React.FC<PipBoySettingsModalProps> = ({
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
    glow: glowIntensity,
    backgroundLines: backgroundScanLines,
    scrollingLines: scrollingScanLines,
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempSettings({
        theme: currentTheme,
        sound: soundEnabled,
        glow: glowIntensity,
        backgroundLines: backgroundScanLines,
        scrollingLines: scrollingScanLines,
      });
      setIsDirty(false);
    }
  }, [isOpen, currentTheme, soundEnabled, glowIntensity, backgroundScanLines, scrollingScanLines]);

  useEffect(() => {
    const hasChanges = 
      tempSettings.theme !== currentTheme ||
      tempSettings.sound !== soundEnabled ||
      tempSettings.glow !== glowIntensity ||
      tempSettings.backgroundLines !== backgroundScanLines ||
      tempSettings.scrollingLines !== scrollingScanLines;
    
    setIsDirty(hasChanges);
  }, [tempSettings, currentTheme, soundEnabled, glowIntensity, backgroundScanLines, scrollingScanLines]);

  const handleSave = () => {
    setTheme(tempSettings.theme);
    setSoundEnabled(tempSettings.sound);
    setGlowIntensity(tempSettings.glow);
    setBackgroundScanLines(tempSettings.backgroundLines);
    setScrollingScanLines(tempSettings.scrollingLines);
    onClose();
  };

  const handleReset = () => {
    setTempSettings({
      theme: currentTheme,
      sound: soundEnabled,
      glow: glowIntensity,
      backgroundLines: backgroundScanLines,
      scrollingLines: scrollingScanLines,
    });
  };

  const themeOptions = [
    { value: 'green', label: 'Classic Green' },
    { value: 'amber', label: 'Amber' },
    { value: 'blue', label: 'Blue' },
    { value: 'red', label: 'Red' },
    { value: 'white', label: 'White' },
  ];

  const scrollingOptions = [
    { value: 'off', label: 'Off' },
    { value: 'normal', label: 'Normal' },
    { value: 'random', label: 'Random' },
  ];

  return (
    <SettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pip-Boy Settings"
      description="Customize your Pip-Boy interface and experience"
      onSave={handleSave}
      onReset={handleReset}
      isDirty={isDirty}
    >
      <SettingsGroup title="Appearance & Theme" description="Customize the visual appearance of your Pip-Boy">
        <SettingsSelect
          label="Color Theme"
          description="Choose your preferred color scheme"
          value={tempSettings.theme}
          onChange={(value) => setTempSettings(prev => ({ ...prev, theme: value as PipBoyTheme }))}
          options={themeOptions}
        />
        
        <SettingsSlider
          label="Glow Intensity"
          description="Adjust the intensity of the screen glow effect"
          value={tempSettings.glow}
          onChange={(value) => setTempSettings(prev => ({ ...prev, glow: value }))}
          min={0}
          max={100}
          unit="%"
        />
      </SettingsGroup>

      <SettingsGroup title="Audio & Sound" description="Configure sound and audio preferences">
        <SettingsToggle
          label="Sound Effects"
          description="Enable or disable Pip-Boy sound effects"
          checked={tempSettings.sound}
          onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, sound: checked }))}
        />
      </SettingsGroup>

      <SettingsGroup title="Interface & Performance" description="Adjust interface behavior and performance settings">
        <SettingsSlider
          label="Background Scan Lines"
          description="Intensity of background scan line effects"
          value={tempSettings.backgroundLines}
          onChange={(value) => setTempSettings(prev => ({ ...prev, backgroundLines: value }))}
          min={0}
          max={100}
          unit="%"
        />
        
        <SettingsSelect
          label="Scrolling Scan Lines"
          description="Style of scrolling scan line effects"
          value={tempSettings.scrollingLines}
          onChange={(value) => setTempSettings(prev => ({ ...prev, scrollingLines: value as ScrollingScanLineMode }))}
          options={scrollingOptions}
        />
      </SettingsGroup>
    </SettingsModal>
  );
};

// Legacy export for backwards compatibility
export { PipBoySettingsModal as SettingsModal };