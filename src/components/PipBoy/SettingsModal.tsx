import React, { useState, useEffect } from 'react';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { SettingsSelect, SettingsSlider, SettingsToggle } from '@/components/ui/SettingsControls';
import { PrimarySettingsGroup, SecondarySettingsGroup } from '@/components/ui/SettingsGroupEnhanced';
import { useTheme, type ColorScheme, type ScrollingScanLineMode, type LayoutMode } from '@/contexts/theme';

interface PipBoySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PipBoySettingsModal: React.FC<PipBoySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    colorScheme, 
    setColorScheme,
    soundEnabled, 
    setSoundEnabled,
    glowIntensity, 
    setGlowIntensity,
    backgroundScanLines, 
    setBackgroundScanLines,
    scrollingScanLines, 
    setScrollingScanLines,
    layoutMode,
    setLayoutMode
  } = useTheme();

  const [tempSettings, setTempSettings] = useState({
    theme: colorScheme,
    sound: soundEnabled,
    glow: glowIntensity,
    backgroundLines: backgroundScanLines,
    scrollingLines: scrollingScanLines,
    layout: layoutMode,
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempSettings({
        theme: colorScheme,
        sound: soundEnabled,
        glow: glowIntensity,
        backgroundLines: backgroundScanLines,
        scrollingLines: scrollingScanLines,
        layout: layoutMode,
      });
      setIsDirty(false);
    }
  }, [isOpen, colorScheme, soundEnabled, glowIntensity, backgroundScanLines, scrollingScanLines, layoutMode]);

  useEffect(() => {
    const hasChanges = 
      tempSettings.theme !== colorScheme ||
      tempSettings.sound !== soundEnabled ||
      tempSettings.glow !== glowIntensity ||
      tempSettings.backgroundLines !== backgroundScanLines ||
      tempSettings.scrollingLines !== scrollingScanLines ||
      tempSettings.layout !== layoutMode;
    
    setIsDirty(hasChanges);
  }, [tempSettings, colorScheme, soundEnabled, glowIntensity, backgroundScanLines, scrollingScanLines, layoutMode]);

  const handleSave = () => {
    setColorScheme(tempSettings.theme);
    setSoundEnabled(tempSettings.sound);
    setGlowIntensity(tempSettings.glow);
    setBackgroundScanLines(tempSettings.backgroundLines);
    setScrollingScanLines(tempSettings.scrollingLines);
    setLayoutMode(tempSettings.layout);
    onClose();
  };

  const handleReset = () => {
    setTempSettings({
      theme: colorScheme,
      sound: soundEnabled,
      glow: glowIntensity,
      backgroundLines: backgroundScanLines,
      scrollingLines: scrollingScanLines,
      layout: layoutMode,
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

  const layoutOptions = [
    { value: 'tabbed', label: 'Horizontal Tabs' },
    { value: 'drawer', label: 'Vertical App Drawer' },
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
      <PrimarySettingsGroup 
        title="Appearance & Theme" 
        description="Customize the visual appearance of your Pip-Boy interface"
      >
        <SettingsSelect
          label="Color Theme"
          description="Choose your preferred color scheme"
          value={tempSettings.theme}
          onChange={(value) => setTempSettings(prev => ({ ...prev, theme: value as ColorScheme }))}
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
      </PrimarySettingsGroup>

      <SecondarySettingsGroup 
        title="Audio & Sound" 
        description="Configure sound and audio experience settings"
      >
        <SettingsToggle
          label="Sound Effects"
          description="Enable or disable Pip-Boy sound effects and audio feedback"
          checked={tempSettings.sound}
          onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, sound: checked }))}
        />
      </SecondarySettingsGroup>

      <SecondarySettingsGroup 
        title="Layout & Navigation" 
        description="Choose between different interface layout modes"
      >
        <SettingsSelect
          label="Layout Mode"
          description="Switch between horizontal tabs and vertical app drawer navigation"
          value={tempSettings.layout}
          onChange={(value) => setTempSettings(prev => ({ ...prev, layout: value as LayoutMode }))}
          options={layoutOptions}
        />
      </SecondarySettingsGroup>

      <SecondarySettingsGroup 
        title="Interface & Performance" 
        description="Adjust visual effects and performance optimization settings"
      >
        <SettingsSlider
          label="Background Scan Lines"
          description="Control the intensity of background scan line effects"
          value={tempSettings.backgroundLines}
          onChange={(value) => setTempSettings(prev => ({ ...prev, backgroundLines: value }))}
          min={0}
          max={100}
          unit="%"
        />
        
        <SettingsSelect
          label="Scrolling Scan Lines"
          description="Choose the style and behavior of scrolling scan line effects"
          value={tempSettings.scrollingLines}
          onChange={(value) => setTempSettings(prev => ({ ...prev, scrollingLines: value as ScrollingScanLineMode }))}
          options={scrollingOptions}
        />
      </SecondarySettingsGroup>
    </SettingsModal>
  );
};
