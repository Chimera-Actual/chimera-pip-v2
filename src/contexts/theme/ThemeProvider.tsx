import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { normalizeError } from '@/lib/errors';
import { localStorageService } from '@/services/storage/localStorageService';

// Types
export type ColorScheme = 'green' | 'amber' | 'blue' | 'red' | 'white';
export type ScrollingScanLineMode = 'off' | 'normal' | 'random';
export type LayoutMode = 'tabbed' | 'drawer';

export interface ThemeConfig {
  colorScheme: ColorScheme;
  soundEnabled: boolean;
  glowIntensity: number;
  scanLineIntensity: number;
  backgroundScanLines: number;
  scrollingScanLines: ScrollingScanLineMode;
  layoutMode: LayoutMode;
}

interface ThemeContextValue extends ThemeConfig {
  setColorScheme: (scheme: ColorScheme) => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  setGlowIntensity: (intensity: number) => void;
  setScanLineIntensity: (intensity: number) => void;
  setBackgroundScanLines: (intensity: number) => void;
  setScrollingScanLines: (mode: ScrollingScanLineMode) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  updateThemeSettings: (updates: Partial<ThemeConfig>) => void;
  isLoading: boolean;
}

// Context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Default theme configuration
const DEFAULT_THEME: ThemeConfig = {
  colorScheme: 'green',
  soundEnabled: true,
  glowIntensity: 75,
  scanLineIntensity: 50,
  backgroundScanLines: 0,        // Scanlines OFF by default
  scrollingScanLines: 'off',     // Scrolling scanlines OFF by default
  layoutMode: 'tabbed',
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
        console.log('🎨 ThemeProvider: Loading theme from user profile:', profile.theme_config);
        // Load from user profile with proper defaults
        const userTheme: ThemeConfig = {
          ...DEFAULT_THEME,
          ...profile.theme_config,
        };
        console.log('🎨 ThemeProvider: Applied user theme:', userTheme);
        setTheme(userTheme);
      } else if (user && !profile?.theme_config) {
        console.log('🎨 ThemeProvider: User authenticated but no theme_config, using defaults');
        setTheme(DEFAULT_THEME);
      } else {
        console.log('🎨 ThemeProvider: Loading theme from localStorage (guest mode)');
        // Load from localStorage for guests
        try {
          const stored = localStorageService.get<ThemeConfig>(STORAGE_KEY);
          if (stored) {
            console.log('🎨 ThemeProvider: Loaded theme from localStorage:', stored);
            setTheme({ ...DEFAULT_THEME, ...stored });
          } else {
            console.log('🎨 ThemeProvider: No stored theme, using defaults');
            setTheme(DEFAULT_THEME);
          }
        } catch (error) {
          console.warn('Failed to load theme from localStorage:', error);
          setTheme(DEFAULT_THEME);
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
      
      // Apply visual effects with intensity
      root.style.setProperty('--glow-intensity', `${theme.glowIntensity / 100}`);
      root.style.setProperty('--scan-line-intensity', `${theme.scanLineIntensity / 100}`);
      root.style.setProperty('--background-scan-intensity', `${theme.backgroundScanLines / 100}`);
      root.style.setProperty('--scrolling-scan-mode', theme.scrollingScanLines);
      
      // Apply classes based on intensity (0 = disabled)
      if (theme.glowIntensity > 0) {
        root.classList.add('glow-effects-enabled');
      } else {
        root.classList.remove('glow-effects-enabled');
      }
      
      if (theme.backgroundScanLines > 0 || theme.scrollingScanLines !== 'off') {
        root.classList.add('scan-lines-enabled');
      } else {
        root.classList.remove('scan-lines-enabled');
      }

      // Apply scrolling scan lines mode class
      root.classList.remove('scrolling-normal', 'scrolling-random');
      if (theme.scrollingScanLines === 'normal') {
        root.classList.add('scrolling-normal');
      } else if (theme.scrollingScanLines === 'random') {
        root.classList.add('scrolling-random');
      }

      // Apply theme-specific CSS variables
      const colorMappings: Record<ColorScheme, Record<string, string>> = {
        green: {
          '--pip-green-primary': '120 100% 55%',
          '--pip-green-secondary': '120 80% 45%',
          '--pip-green-muted': '120 60% 35%',
          '--pip-text-primary': '120 70% 85%',
          '--pip-text-secondary': '120 50% 70%',
          '--pip-text-muted': '120 30% 55%',
          '--pip-text-bright': '120 90% 95%',
          '--pip-border': '120 40% 30%',
          '--pip-border-bright': '120 70% 50%',
          '--pip-glow': '120 100% 65%',
          '--primary': '120 100% 55%',
          '--primary-foreground': '120 5% 10%',
          '--secondary': '120 30% 25%',
          '--accent': '120 50% 40%',
          '--destructive': '0 62% 50%',
          '--ring': '120 100% 65%',
        },
        amber: {
          '--pip-green-primary': '45 100% 55%',
          '--pip-green-secondary': '45 80% 45%',
          '--pip-green-muted': '45 60% 35%',
          '--pip-text-primary': '45 70% 85%',
          '--pip-text-secondary': '45 50% 70%',
          '--pip-text-muted': '45 30% 55%',
          '--pip-text-bright': '45 90% 95%',
          '--pip-border': '45 40% 30%',
          '--pip-border-bright': '45 70% 50%',
          '--pip-glow': '45 100% 65%',
          '--primary': '45 100% 55%',
          '--primary-foreground': '45 5% 10%',
          '--secondary': '45 30% 25%',
          '--accent': '45 50% 40%',
          '--destructive': '0 62% 50%',
          '--ring': '45 100% 65%',
        },
        blue: {
          '--pip-green-primary': '207 100% 55%',
          '--pip-green-secondary': '207 80% 45%',
          '--pip-green-muted': '207 60% 35%',
          '--pip-text-primary': '207 70% 85%',
          '--pip-text-secondary': '207 50% 70%',
          '--pip-text-muted': '207 30% 55%',
          '--pip-text-bright': '207 90% 95%',
          '--pip-border': '207 40% 30%',
          '--pip-border-bright': '207 70% 50%',
          '--pip-glow': '207 100% 65%',
          '--primary': '207 100% 55%',
          '--primary-foreground': '207 5% 10%',
          '--secondary': '207 30% 25%',
          '--accent': '207 50% 40%',
          '--destructive': '0 62% 50%',
          '--ring': '207 100% 65%',
        },
        red: {
          '--pip-green-primary': '0 100% 55%',
          '--pip-green-secondary': '0 80% 45%',
          '--pip-green-muted': '0 60% 35%',
          '--pip-text-primary': '0 70% 85%',
          '--pip-text-secondary': '0 50% 70%',
          '--pip-text-muted': '0 30% 55%',
          '--pip-text-bright': '0 90% 95%',
          '--pip-border': '0 40% 30%',
          '--pip-border-bright': '0 70% 50%',
          '--pip-glow': '0 100% 65%',
          '--primary': '0 100% 55%',
          '--primary-foreground': '0 5% 10%',
          '--secondary': '0 30% 25%',
          '--accent': '0 50% 40%',
          '--destructive': '0 62% 50%',
          '--ring': '0 100% 65%',
        },
        white: {
          '--pip-green-primary': '0 0% 95%',
          '--pip-green-secondary': '0 0% 80%',
          '--pip-green-muted': '0 0% 60%',
          '--pip-text-primary': '0 0% 95%',
          '--pip-text-secondary': '0 0% 80%',
          '--pip-text-muted': '0 0% 65%',
          '--pip-text-bright': '0 0% 100%',
          '--pip-border': '0 0% 40%',
          '--pip-border-bright': '0 0% 70%',
          '--pip-glow': '0 0% 100%',
          '--primary': '0 0% 95%',
          '--primary-foreground': '0 0% 5%',
          '--secondary': '0 0% 25%',
          '--accent': '0 0% 50%',
          '--destructive': '0 62% 50%',
          '--ring': '0 0% 100%',
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
  const persistTheme = useCallback(async (newTheme: ThemeConfig) => {
    console.log('🔄 ThemeProvider: persistTheme called with:', newTheme);
    
    if (user && updateProfile) {
      console.log('🔄 ThemeProvider: Saving to user profile (authenticated user)');
      // Persist to user profile
      setIsLoading(true);
      try {
        const result = await updateProfile({
          theme_config: newTheme,
        });

        if (result.error) {
          console.error('❌ ThemeProvider: Failed to save to profile:', result.error);
          throw new Error('Failed to save theme preferences');
        }

        console.log('✅ ThemeProvider: Theme saved to user profile successfully');
        toast({
          title: 'Theme Updated',
          description: 'Your theme preferences have been saved.',
        });
      } catch (error) {
        console.error('❌ ThemeProvider: Persistence error:', error);
        const normalizedError = normalizeError(error, 'ThemeProvider');
        toast({
          title: 'Error',
          description: normalizedError.userMessage,
          variant: 'destructive',
        });
        
        // Fallback to localStorage on database error
        console.log('🔄 ThemeProvider: Falling back to localStorage due to database error');
        try {
          localStorageService.set(STORAGE_KEY, newTheme);
          console.log('✅ ThemeProvider: Fallback to localStorage successful');
        } catch (fallbackError) {
          console.error('❌ ThemeProvider: localStorage fallback also failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('🔄 ThemeProvider: Saving to localStorage (guest mode or auth unavailable)');
      // Persist to localStorage for guests or when auth is not available
      try {
        localStorageService.set(STORAGE_KEY, newTheme);
        console.log('✅ ThemeProvider: Theme saved to localStorage successfully');
      } catch (error) {
        console.error('❌ ThemeProvider: Failed to save theme to localStorage:', error);
        toast({
          title: 'Error',
          description: 'Failed to save theme preferences locally.',
          variant: 'destructive',
        });
      }
    }
  }, [user, updateProfile]);

  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    persistTheme(newTheme);
  }, [theme, persistTheme]);

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    updateTheme({ colorScheme });
  }, [updateTheme]);

  const setSoundEnabled = useCallback((soundEnabled: boolean) => {
    updateTheme({ soundEnabled });
  }, [updateTheme]);

  const toggleSound = useCallback(() => {
    updateTheme({ soundEnabled: !theme.soundEnabled });
  }, [theme.soundEnabled, updateTheme]);

  const setGlowIntensity = useCallback((glowIntensity: number) => {
    updateTheme({ glowIntensity: Math.max(0, Math.min(100, glowIntensity)) });
  }, [updateTheme]);

  const setScanLineIntensity = useCallback((scanLineIntensity: number) => {
    updateTheme({ scanLineIntensity: Math.max(0, Math.min(100, scanLineIntensity)) });
  }, [updateTheme]);

  const setBackgroundScanLines = useCallback((backgroundScanLines: number) => {
    updateTheme({ backgroundScanLines: Math.max(0, Math.min(100, backgroundScanLines)) });
  }, [updateTheme]);

  const setScrollingScanLines = useCallback((scrollingScanLines: ScrollingScanLineMode) => {
    updateTheme({ scrollingScanLines });
  }, [updateTheme]);

  const setLayoutMode = useCallback((layoutMode: LayoutMode) => {
    updateTheme({ layoutMode });
  }, [updateTheme]);

  // Batch update function for settings modal
  const updateThemeSettings = useCallback((updates: Partial<ThemeConfig>) => {
    console.log('🎨 ThemeProvider: updateThemeSettings called with:', updates);
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    persistTheme(newTheme);
  }, [theme, persistTheme]);

  const contextValue: ThemeContextValue = {
    ...theme,
    setColorScheme,
    setSoundEnabled,
    toggleSound,
    setGlowIntensity,
    setScanLineIntensity,
    setBackgroundScanLines,
    setScrollingScanLines,
    setLayoutMode,
    updateThemeSettings,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};