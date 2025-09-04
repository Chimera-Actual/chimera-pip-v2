import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Volume2, VolumeX, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ColorTheme } from './PipBoyContainer';
import { UserAvatar } from './UserAvatar';
import { SettingsModal } from './SettingsModal';

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
  const { profile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 border-b border-pip-border">
      {/* Left: CHIMERA-TEC Branding */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Zap className="pip-icon-xl text-primary pip-text-glow" />
          <div>
            <h1 className="text-xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
              CHIMERA-PIP 4000 mk2
            </h1>
            <p className="text-xs text-pip-text-secondary font-pip-mono">
              CHIMERA-TEC PERSONAL INFORMATION PROCESSOR
            </p>
          </div>
        </div>
      </div>

      {/* Center: System Info */}
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-xs text-pip-text-muted font-pip-mono">VAULT</div>
          <div className="text-sm text-primary font-pip-mono pip-text-glow">
            {profile?.vault_number?.toString().padStart(3, '0') || '000'}
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-3">
        {/* Sound Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onSoundToggle}
          className="text-pip-text-secondary hover:text-primary transition-colors pip-button-glow"
          title={soundEnabled ? 'Mute System Sounds' : 'Enable System Sounds'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        {/* Settings */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowSettings(true)}
          className="text-pip-text-secondary hover:text-primary transition-colors pip-button-glow"
          title="System Preferences"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* User Avatar */}
        <UserAvatar />
      </div>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};