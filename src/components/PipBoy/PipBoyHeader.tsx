import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Volume2, VolumeX, Zap, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ColorTheme } from './PipBoyContainer';

interface PipBoyHeaderProps {
  colorTheme: ColorTheme;
  onColorThemeChange: (theme: ColorTheme) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export const PipBoyHeader: React.FC<PipBoyHeaderProps> = ({ 
  colorTheme, 
  onColorThemeChange, 
  soundEnabled, 
  onSoundToggle 
}) => {
  const { profile, signOut } = useAuth();
  const themeColors: Record<ColorTheme, string> = {
    green: 'hsl(120 100% 50%)',
    amber: 'hsl(45 100% 55%)',
    blue: 'hsl(200 100% 55%)',
    red: 'hsl(0 100% 55%)',
    white: 'hsl(0 0% 90%)'
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-pip-border">
      {/* Left: Vault-Tec Branding */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-primary pip-text-glow" />
          <div>
            <h1 className="text-xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
              CHIMERA-PIP 4000 mk2
            </h1>
            <p className="text-xs text-pip-text-secondary font-pip-mono">
              VAULT-TEC PERSONAL INFORMATION PROCESSOR
            </p>
          </div>
        </div>
      </div>

      {/* Center: User Profile */}
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-xs text-pip-text-muted font-pip-mono">STATUS</div>
          <div className="text-sm text-primary font-pip-mono pip-text-glow">OPERATIONAL</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-pip-text-muted font-pip-mono">VAULT DWELLER</div>
          <div className="text-sm text-primary font-pip-mono pip-text-glow">
            {profile?.character_name || 'UNNAMED'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-pip-text-muted font-pip-mono">VAULT</div>
          <div className="text-sm text-primary font-pip-mono pip-text-glow">
            {profile?.vault_number?.toString().padStart(3, '0') || '000'}
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-2">
        {/* Theme Selector */}
        <div className="flex space-x-1">
          {(Object.keys(themeColors) as ColorTheme[]).map((theme) => (
            <Button
              key={theme}
              size="sm"
              variant="ghost"
              className={`w-6 h-6 p-0 rounded-full border-2 transition-all ${
                colorTheme === theme 
                  ? 'border-pip-text-bright shadow-pip-glow' 
                  : 'border-pip-border hover:border-pip-border-bright'
              }`}
              style={{ backgroundColor: themeColors[theme] }}
              onClick={() => onColorThemeChange(theme)}
              title={`${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`}
            />
          ))}
        </div>

        {/* Sound Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onSoundToggle}
          className="text-pip-text-secondary hover:text-primary"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        {/* Settings */}
        <Button
          size="sm"
          variant="ghost"
          className="text-pip-text-secondary hover:text-primary"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Logout */}
        <Button
          size="sm"
          variant="ghost"
          onClick={signOut}
          className="text-pip-text-secondary hover:text-destructive"
          title="Exit Vault"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};