import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PipBoyTabs } from './PipBoyTabs';
import { PipBoyHeader } from './PipBoyHeader';
import { StatTab } from './tabs/StatTab';
import { InvTab } from './tabs/InvTab';
import { DataTab } from './tabs/DataTab';
import { MapTab } from './tabs/MapTab';
import { RadioTab } from './tabs/RadioTab';
import { BootSequence } from './BootSequence';

export type PipBoyTab = 'STAT' | 'INV' | 'DATA' | 'MAP' | 'RADIO';
export type ColorTheme = 'green' | 'amber' | 'blue' | 'red' | 'white';

interface PipBoyContainerProps {
  className?: string;
}

export const PipBoyContainer: React.FC<PipBoyContainerProps> = ({ className }) => {
  const [currentTab, setCurrentTab] = useState<PipBoyTab>('STAT');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('green');
  const [isBooting, setIsBooting] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Boot sequence timer
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, 3000);

    return () => clearTimeout(bootTimer);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme);
  }, [colorTheme]);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'STAT':
        return <StatTab />;
      case 'INV':
        return <InvTab />;
      case 'DATA':
        return <DataTab />;
      case 'MAP':
        return <MapTab />;
      case 'RADIO':
        return <RadioTab />;
      default:
        return <StatTab />;
    }
  };

  if (isBooting) {
    return <BootSequence />;
  }

  return (
    <div className={`min-h-screen pip-scanlines ${className}`}>
      <div className="container mx-auto p-4 max-w-7xl">
        <Card className="pip-terminal pip-glow border-2 border-pip-border-bright/30 min-h-[800px]">
          {/* Header */}
          <PipBoyHeader 
            colorTheme={colorTheme}
            onColorThemeChange={setColorTheme}
            soundEnabled={soundEnabled}
            onSoundToggle={() => setSoundEnabled(!soundEnabled)}
          />
          
          {/* Tab Navigation */}
          <PipBoyTabs 
            currentTab={currentTab}
            onTabChange={setCurrentTab}
          />
          
          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </Card>
      </div>
    </div>
  );
};