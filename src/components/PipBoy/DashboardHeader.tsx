import React from 'react';
import { PipBoyHeader } from './PipBoyHeader';
import { ColorTheme } from './PipBoyContainer';

interface DashboardHeaderProps {
  colorTheme: ColorTheme;
  onColorThemeChange: (theme: ColorTheme) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  colorTheme,
  onColorThemeChange,
  soundEnabled,
  onSoundToggle
}) => {
  return (
    <PipBoyHeader 
      colorTheme={colorTheme}
      onColorThemeChange={onColorThemeChange}
      soundEnabled={soundEnabled}
      onSoundToggle={onSoundToggle}
    />
  );
};