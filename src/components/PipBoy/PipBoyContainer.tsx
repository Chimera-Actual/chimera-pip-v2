import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PipBoyTabs } from './PipBoyTabs';
import { DashboardHeader } from './DashboardHeader';
import { DashboardContent } from './DashboardContent';
import { DashboardFooter } from './DashboardFooter';
import { BootSequence } from './BootSequence';
import { useAuth } from '@/contexts/AuthContext';
import { useTabManagerContext } from '@/contexts/TabManagerContext';

export type ColorTheme = 'green' | 'amber' | 'blue' | 'red' | 'white';
export type PipBoyTab = 'STAT' | 'INV' | 'DATA' | 'MAP' | 'RADIO';

interface PipBoyContainerProps {
  className?: string;
}

export const PipBoyContainer: React.FC<PipBoyContainerProps> = ({ className }) => {
  const { profile, updateProfile } = useAuth();
  const { tabs, activeTab, setActiveTab, isLoading: tabsLoading } = useTabManagerContext();
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

  if (tabsLoading) {
    return (
      <div className="min-h-screen pip-scanlines flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`h-screen pip-scanlines ${className}`}>
      <div className="container mx-auto p-4 max-w-7xl h-full">
        <Card variant="pip-terminal" className="h-full flex flex-col">
          {/* Dashboard Header */}
          <DashboardHeader 
            colorTheme={colorTheme}
            onColorThemeChange={setColorTheme}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
          />
          
          {/* Tab Navigation */}
          <PipBoyTabs 
            currentTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />
          
          {/* Dashboard Content - Takes remaining space */}
          <div className="flex-1 min-h-0">
            <DashboardContent activeTab={activeTab} />
          </div>
          
          {/* Dashboard Footer */}
          <DashboardFooter />
        </Card>
      </div>
    </div>
  );
};