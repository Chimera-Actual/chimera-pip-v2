import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PipBoyTabs } from './PipBoyTabs';
import { VerticalAppDrawer } from './VerticalAppDrawer';
import { DashboardHeader } from './DashboardHeader';
import { DashboardContent } from './DashboardContent';
import { DashboardFooter } from './DashboardFooter';
import { BootSequence } from './BootSequence';
import { useAuth } from '@/contexts/AuthContext';
import { useTabManagerContext } from '@/contexts/TabManagerContext';
import { useTheme } from '@/contexts/theme';
import { cn } from '@/lib/utils';

export type ColorTheme = 'green' | 'amber' | 'blue' | 'red' | 'white';
export type PipBoyTab = 'STAT' | 'INV' | 'DATA' | 'MAP' | 'RADIO';

interface PipBoyContainerProps {
  className?: string;
}

export const PipBoyContainer: React.FC<PipBoyContainerProps> = ({ className }) => {
  const { profile, updateProfile } = useAuth();
  const { tabs, activeTab, setActiveTab, isLoading: tabsLoading } = useTabManagerContext();
  const { layoutMode } = useTheme();
  const [colorTheme, setColorTheme] = useState<ColorTheme>('green');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Smart boot sequence - skip after first visit
  const [hasVisited, setHasVisited] = useState(() => {
    return localStorage.getItem('pip-boy-visited') === 'true';
  });
  const [isBooting, setIsBooting] = useState(!hasVisited);
  const [showSkipButton, setShowSkipButton] = useState(false);

  // Initialize theme from user profile
  useEffect(() => {
    if (profile?.theme_config) {
      setColorTheme(profile.theme_config.colorScheme);
      setSoundEnabled(profile.theme_config.soundEnabled);
    }
  }, [profile]);

  useEffect(() => {
    if (isBooting) {
      // Show skip button after 1 second
      const skipTimer = setTimeout(() => {
        setShowSkipButton(true);
      }, 1000);

      // Auto-complete boot sequence after 3 seconds
      const bootTimer = setTimeout(() => {
        setIsBooting(false);
        localStorage.setItem('pip-boy-visited', 'true');
        setHasVisited(true);
      }, 3000);

      return () => {
        clearTimeout(skipTimer);
        clearTimeout(bootTimer);
      };
    }
  }, [isBooting]);

  const skipBoot = () => {
    setIsBooting(false);
    localStorage.setItem('pip-boy-visited', 'true');
    setHasVisited(true);
  };

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

  // Show boot sequence only if booting or critical data still loading
  if (isBooting || (tabsLoading && !hasVisited)) {
    return (
      <div className="relative h-screen">
        <BootSequence />
        {showSkipButton && (
          <div className="absolute bottom-8 right-8 z-50">
            <Button
              onClick={skipBoot}
              variant="outline"
              className="pip-button-secondary animate-pulse"
            >
              Skip Boot Sequence
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (tabsLoading) {
    return (
      <div className="min-h-screen pip-scanlines flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("h-screen pip-scanlines", className)}>
      <div className="container mx-auto p-4 max-w-7xl h-full">
        {layoutMode === 'drawer' ? (
          // Vertical Drawer Layout
          <Card variant="pip-terminal" className="h-full flex">
            {/* Vertical App Drawer */}
            <VerticalAppDrawer 
              currentTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
            />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Dashboard Header */}
              <DashboardHeader 
                colorTheme={colorTheme}
                onColorThemeChange={setColorTheme}
                soundEnabled={soundEnabled}
                onSoundToggle={handleSoundToggle}
              />
              
              {/* Dashboard Content - Takes remaining space */}
              <div className="flex-1 min-h-0">
                <DashboardContent activeTab={activeTab} />
              </div>
              
              {/* Dashboard Footer */}
              <DashboardFooter />
            </div>
          </Card>
        ) : (
          // Traditional Tabbed Layout
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
        )}
      </div>
    </div>
  );
};