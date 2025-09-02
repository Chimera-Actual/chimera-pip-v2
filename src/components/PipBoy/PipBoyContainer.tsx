import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PipBoyTabs } from './PipBoyTabs';
import { DashboardHeader } from './DashboardHeader';
import { DashboardContent } from './DashboardContent';
import { DashboardFooter } from './DashboardFooter';
import { BootSequence } from './BootSequence';
import { useAuth } from '@/contexts/AuthContext';

export type PipBoyTab = 'STAT' | 'INV' | 'DATA' | 'MAP' | 'RADIO';
export type ColorTheme = 'green' | 'amber' | 'blue' | 'red' | 'white';

interface PipBoyContainerProps {
  className?: string;
}

export const PipBoyContainer: React.FC<PipBoyContainerProps> = ({ className }) => {
  const { profile, updateProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState<PipBoyTab>('STAT');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('green');
  const [isBooting, setIsBooting] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize theme from user profile
  useEffect(() => {
    if (profile?.theme_config) {
      setColorTheme(profile.theme_config.colorScheme);
      setSoundEnabled(profile.theme_config.soundEnabled);
    }
  }, [profile]);

  useEffect(() => {
    // Boot sequence timer
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, 3000);

    return () => clearTimeout(bootTimer);
  }, []);

  const handleSoundToggle = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    
    // Update user profile
    if (profile) {
      updateProfile({
        theme_config: {
          ...profile.theme_config,
          soundEnabled: newSoundState,
        }
      });
    }
  };

  // Apply theme to document and sync with user profile
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme);
    
    // Update user profile theme if user is authenticated
    if (profile && profile.theme_config.colorScheme !== colorTheme) {
      updateProfile({
        theme_config: {
          ...profile.theme_config,
          colorScheme: colorTheme,
        }
      });
    }
  }, [colorTheme, profile, updateProfile]);


  if (isBooting) {
    return <BootSequence />;
  }

  return (
    <div className={`min-h-screen pip-scanlines ${className}`}>
      <div className="container mx-auto p-4 max-w-7xl">
        <Card className="pip-terminal pip-glow border-2 border-pip-border-bright/30 min-h-[800px] flex flex-col">
          {/* Dashboard Header */}
          <DashboardHeader 
            colorTheme={colorTheme}
            onColorThemeChange={setColorTheme}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
          />
          
          {/* Tab Navigation */}
          <PipBoyTabs 
            currentTab={currentTab}
            onTabChange={setCurrentTab}
          />
          
          {/* Dashboard Content */}
          <DashboardContent activeTab={currentTab} />
          
          {/* Dashboard Footer */}
          <DashboardFooter />
        </Card>
      </div>
    </div>
  );
};