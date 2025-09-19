import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { normalizeError } from '@/lib/errors';
import type { ThemeConfig, ColorScheme } from '@/types';

interface ThemeContextValue extends ThemeConfig {
  setColorScheme: (scheme: ColorScheme) => void;
  toggleSound: () => void;
  setGlowIntensity: (intensity: number) => void;
  setScanLineIntensity: (intensity: number) => void;
  setBackgroundScanLines: (enabled: boolean) => void;
  setScrollingScanLines: (mode: 'off' | 'normal' | 'random') => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const DEFAULT_THEME: ThemeConfig = {
  colorScheme: 'green',
  soundEnabled: true,
  glowIntensity: 0.5,
  scanLineIntensity: 0.3,
  backgroundScanLines: true,
  scrollingScanLines: 'normal',
};

const STORAGE_KEY = 'chimera-pip-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Partial<ThemeConfig>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = {},
}) => {
  // Safely get auth context - it may not be available during initialization
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // Auth context not available - will use localStorage fallback
    console.warn('Auth context not available, using localStorage for theme');
    authContext = { user: null, profile: null, updateProfile: null };
  }
  
  const { user, profile, updateProfile } = authContext;
  const [theme, setTheme] = useState<ThemeConfig>({ ...DEFAULT_THEME, ...defaultTheme });
  const [isLoading, setIsLoading] = useState(false);

  // Load theme on mount
  useEffect(() => {
    const loadTheme = () => {
      if (user && profile?.theme_config) {
        // Load from user profile
        const userTheme = {
          ...DEFAULT_THEME,
          colorScheme: profile.theme_config.colorScheme,
          soundEnabled: profile.theme_config.soundEnabled,
          // Add other theme properties from profile if they exist
        };
        setTheme(userTheme);
      } else {
        // Load from localStorage for guests
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsedTheme = JSON.parse(stored);
            setTheme({ ...DEFAULT_THEME, ...parsedTheme });
          }
        } catch (error) {
          console.warn('Failed to load theme from localStorage:', error);
        }
      }
    };

    loadTheme();
  }, [user, profile]);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      // Set theme data attribute
      root.dataset.theme = theme.colorScheme;
      
      // Apply CSS custom properties
      root.style.setProperty('--glow-intensity', theme.glowIntensity.toString());
      root.style.setProperty('--scanline-intensity', theme.scanLineIntensity.toString());
      
      // Apply theme classes
      root.classList.toggle('scanlines-bg', theme.backgroundScanLines);
      root.classList.remove('scanlines-off', 'scanlines-normal', 'scanlines-random');
      root.classList.add(`scanlines-${theme.scrollingScanLines}`);

      // Set color scheme CSS variables based on theme
      const colorMappings: Record<ColorScheme, Record<string, string>> = {
        green: {
          '--primary': '120 100% 50%',
          '--primary-foreground': '0 0% 0%',
          '--primary-glow': '120 100% 70%',
        },
        amber: {
          '--primary': '45 100% 50%',
          '--primary-foreground': '0 0% 0%',
          '--primary-glow': '45 100% 70%',
        },
        blue: {
          '--primary': '210 100% 50%',
          '--primary-foreground': '0 0% 100%',
          '--primary-glow': '210 100% 70%',
        },
        red: {
          '--primary': '0 100% 50%',
          '--primary-foreground': '0 0% 100%',
          '--primary-glow': '0 100% 70%',
        },
        white: {
          '--primary': '0 0% 100%',
          '--primary-foreground': '0 0% 0%',
          '--primary-glow': '0 0% 90%',
        },
      };

      const colors = colorMappings[theme.colorScheme] || colorMappings.green;
      Object.entries(colors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    };

    applyTheme();
  }, [theme]);

  // Persist theme changes
  const persistTheme = async (newTheme: ThemeConfig) => {
    if (user && updateProfile) {
      // Persist to user profile
      setIsLoading(true);
      try {
        const result = await updateProfile({
          theme_config: {
            colorScheme: newTheme.colorScheme,
            soundEnabled: newTheme.soundEnabled,
          },
        });

        if (result.error) {
          throw new Error('Failed to save theme preferences');
        }

        toast({
          title: 'Theme Updated',
          description: 'Your theme preferences have been saved.',
        });
      } catch (error) {
        const normalizedError = normalizeError(error, 'ThemeProvider');
        toast({
          title: 'Error',
          description: normalizedError.userMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Persist to localStorage for guests or when auth is not available
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTheme));
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  };

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    persistTheme(newTheme);
  };

  const setColorScheme = (colorScheme: ColorScheme) => {
    updateTheme({ colorScheme });
  };

  const toggleSound = () => {
    updateTheme({ soundEnabled: !theme.soundEnabled });
  };

  const setGlowIntensity = (glowIntensity: number) => {
    updateTheme({ glowIntensity: Math.max(0, Math.min(1, glowIntensity)) });
  };

  const setScanLineIntensity = (scanLineIntensity: number) => {
    updateTheme({ scanLineIntensity: Math.max(0, Math.min(1, scanLineIntensity)) });
  };

  const setBackgroundScanLines = (backgroundScanLines: boolean) => {
    updateTheme({ backgroundScanLines });
  };

  const setScrollingScanLines = (scrollingScanLines: 'off' | 'normal' | 'random') => {
    updateTheme({ scrollingScanLines });
  };

  const contextValue: ThemeContextValue = {
    ...theme,
    setColorScheme,
    toggleSound,
    setGlowIntensity,
    setScanLineIntensity,
    setBackgroundScanLines,
    setScrollingScanLines,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};