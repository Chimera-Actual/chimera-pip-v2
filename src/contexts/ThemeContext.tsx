import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { localStorageService } from '@/services/storage/localStorageService';

export type PipBoyTheme = 'green' | 'amber' | 'blue' | 'red' | 'white';

interface ThemeContextType {
  currentTheme: PipBoyTheme;
  setTheme: (theme: PipBoyTheme) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: PipBoyTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'green' 
}) => {
  const [currentTheme, setCurrentTheme] = useState<PipBoyTheme>(() => {
    const saved = localStorageService.get<PipBoyTheme>('pip-boy-theme');
    return saved || defaultTheme;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorageService.get<boolean>('pip-boy-sound-enabled') ?? true;
  });

  const setTheme = useCallback((theme: PipBoyTheme) => {
    setCurrentTheme(theme);
    localStorageService.set('pip-boy-theme', theme);
  }, []);

  const handleSetSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorageService.set('pip-boy-sound-enabled', enabled);
  }, []);

  const toggleSound = useCallback(() => {
    handleSetSoundEnabled(!soundEnabled);
  }, [soundEnabled, handleSetSoundEnabled]);

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update CSS variables based on theme
    const root = document.documentElement;
    
    switch (currentTheme) {
      case 'amber':
        // Primary Colors
        root.style.setProperty('--pip-green-primary', '45 100% 55%');
        root.style.setProperty('--pip-green-secondary', '45 80% 45%');
        root.style.setProperty('--pip-green-muted', '45 60% 35%');
        // Text Colors
        root.style.setProperty('--pip-text-primary', '45 70% 85%');
        root.style.setProperty('--pip-text-secondary', '45 50% 70%');
        root.style.setProperty('--pip-text-muted', '45 30% 55%');
        root.style.setProperty('--pip-text-bright', '45 90% 95%');
        // UI Colors
        root.style.setProperty('--pip-border', '45 40% 30%');
        root.style.setProperty('--pip-border-bright', '45 70% 50%');
        root.style.setProperty('--pip-glow', '45 100% 65%');
        // Standard variables
        root.style.setProperty('--primary', '45 100% 55%');
        root.style.setProperty('--primary-foreground', '45 5% 10%');
        root.style.setProperty('--secondary', '45 30% 25%');
        root.style.setProperty('--accent', '45 50% 40%');
        root.style.setProperty('--destructive', '0 62% 50%');
        root.style.setProperty('--ring', '45 100% 65%');
        break;
      case 'blue':
        // Primary Colors
        root.style.setProperty('--pip-green-primary', '207 100% 55%');
        root.style.setProperty('--pip-green-secondary', '207 80% 45%');
        root.style.setProperty('--pip-green-muted', '207 60% 35%');
        // Text Colors
        root.style.setProperty('--pip-text-primary', '207 70% 85%');
        root.style.setProperty('--pip-text-secondary', '207 50% 70%');
        root.style.setProperty('--pip-text-muted', '207 30% 55%');
        root.style.setProperty('--pip-text-bright', '207 90% 95%');
        // UI Colors
        root.style.setProperty('--pip-border', '207 40% 30%');
        root.style.setProperty('--pip-border-bright', '207 70% 50%');
        root.style.setProperty('--pip-glow', '207 100% 65%');
        // Standard variables
        root.style.setProperty('--primary', '207 100% 55%');
        root.style.setProperty('--primary-foreground', '207 5% 10%');
        root.style.setProperty('--secondary', '207 30% 25%');
        root.style.setProperty('--accent', '207 50% 40%');
        root.style.setProperty('--destructive', '0 62% 50%');
        root.style.setProperty('--ring', '207 100% 65%');
        break;
      case 'red':
        // Primary Colors
        root.style.setProperty('--pip-green-primary', '0 100% 55%');
        root.style.setProperty('--pip-green-secondary', '0 80% 45%');
        root.style.setProperty('--pip-green-muted', '0 60% 35%');
        // Text Colors
        root.style.setProperty('--pip-text-primary', '0 70% 85%');
        root.style.setProperty('--pip-text-secondary', '0 50% 70%');
        root.style.setProperty('--pip-text-muted', '0 30% 55%');
        root.style.setProperty('--pip-text-bright', '0 90% 95%');
        // UI Colors
        root.style.setProperty('--pip-border', '0 40% 30%');
        root.style.setProperty('--pip-border-bright', '0 70% 50%');
        root.style.setProperty('--pip-glow', '0 100% 65%');
        // Standard variables
        root.style.setProperty('--primary', '0 100% 55%');
        root.style.setProperty('--primary-foreground', '0 5% 10%');
        root.style.setProperty('--secondary', '0 30% 25%');
        root.style.setProperty('--accent', '0 50% 40%');
        root.style.setProperty('--destructive', '0 62% 50%');
        root.style.setProperty('--ring', '0 100% 65%');
        break;
      case 'white':
        // Primary Colors (use neutral grays for white theme)
        root.style.setProperty('--pip-green-primary', '0 0% 95%');
        root.style.setProperty('--pip-green-secondary', '0 0% 80%');
        root.style.setProperty('--pip-green-muted', '0 0% 60%');
        // Text Colors
        root.style.setProperty('--pip-text-primary', '0 0% 95%');
        root.style.setProperty('--pip-text-secondary', '0 0% 80%');
        root.style.setProperty('--pip-text-muted', '0 0% 65%');
        root.style.setProperty('--pip-text-bright', '0 0% 100%');
        // UI Colors
        root.style.setProperty('--pip-border', '0 0% 40%');
        root.style.setProperty('--pip-border-bright', '0 0% 70%');
        root.style.setProperty('--pip-glow', '0 0% 100%');
        // Standard variables
        root.style.setProperty('--primary', '0 0% 95%');
        root.style.setProperty('--primary-foreground', '0 0% 5%');
        root.style.setProperty('--secondary', '0 0% 25%');
        root.style.setProperty('--accent', '0 0% 50%');
        root.style.setProperty('--destructive', '0 62% 50%');
        root.style.setProperty('--ring', '0 0% 100%');
        break;
      default: // green
        // Primary Colors
        root.style.setProperty('--pip-green-primary', '120 100% 55%');
        root.style.setProperty('--pip-green-secondary', '120 80% 45%');
        root.style.setProperty('--pip-green-muted', '120 60% 35%');
        // Text Colors
        root.style.setProperty('--pip-text-primary', '120 70% 85%');
        root.style.setProperty('--pip-text-secondary', '120 50% 70%');
        root.style.setProperty('--pip-text-muted', '120 30% 55%');
        root.style.setProperty('--pip-text-bright', '120 90% 95%');
        // UI Colors
        root.style.setProperty('--pip-border', '120 40% 30%');
        root.style.setProperty('--pip-border-bright', '120 70% 50%');
        root.style.setProperty('--pip-glow', '120 100% 65%');
        // Standard variables
        root.style.setProperty('--primary', '120 100% 55%');
        root.style.setProperty('--primary-foreground', '120 5% 10%');
        root.style.setProperty('--secondary', '120 30% 25%');
        root.style.setProperty('--accent', '120 50% 40%');
        root.style.setProperty('--destructive', '0 62% 50%');
        root.style.setProperty('--ring', '120 100% 65%');
        break;
    }
  }, [currentTheme]);

  const value = {
    currentTheme,
    setTheme,
    soundEnabled,
    setSoundEnabled: handleSetSoundEnabled,
    toggleSound,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};