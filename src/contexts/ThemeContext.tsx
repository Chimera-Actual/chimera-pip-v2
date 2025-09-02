import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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
    const saved = localStorage.getItem('pip-boy-theme');
    return (saved as PipBoyTheme) || defaultTheme;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('pip-boy-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const setTheme = useCallback((theme: PipBoyTheme) => {
    setCurrentTheme(theme);
    localStorage.setItem('pip-boy-theme', theme);
  }, []);

  const handleSetSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('pip-boy-sound-enabled', JSON.stringify(enabled));
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
        root.style.setProperty('--pip-green-primary', '45 100% 51%'); // #ffaa00
        root.style.setProperty('--primary', '45 100% 51%');
        break;
      case 'blue':
        root.style.setProperty('--pip-green-primary', '207 100% 52%'); // #0088ff
        root.style.setProperty('--primary', '207 100% 52%');
        break;
      case 'red':
        root.style.setProperty('--pip-green-primary', '0 100% 50%'); // #ff0000
        root.style.setProperty('--primary', '0 100% 50%');
        break;
      case 'white':
        root.style.setProperty('--pip-green-primary', '0 0% 100%'); // #ffffff
        root.style.setProperty('--primary', '0 0% 100%');
        break;
      default: // green
        root.style.setProperty('--pip-green-primary', '120 100% 50%'); // #00ff00
        root.style.setProperty('--primary', '120 100% 50%');
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