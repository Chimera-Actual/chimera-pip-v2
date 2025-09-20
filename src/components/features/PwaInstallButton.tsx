import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useAnalytics } from '@/hooks/useAnalytics';
import { success, error } from '@/lib/toast';

export const PwaInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePwaInstall();
  const { track } = useAnalytics();

  const handleInstall = async () => {
    track('pwa_install_attempted');
    
    const success_result = await installApp();
    
    if (success_result) {
      success('App installed successfully!');
      track('pwa_install_completed');
    } else {
      error('Installation cancelled or failed');
      track('pwa_install_failed');
    }
  };

  if (isInstalled) {
    return (
      <Button variant="outline" size="sm" disabled className="text-primary border-primary/20">
        <Smartphone className="w-4 h-4 mr-2" />
        App Installed
      </Button>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleInstall}
      className="text-primary border-primary/20 hover:bg-primary/10"
    >
      <Download className="w-4 h-4 mr-2" />
      Install App
    </Button>
  );
};