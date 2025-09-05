// Theme Configuration System for Chimera-PIP 4000 mk2
// Centralized theme management with dynamic switching

import { localStorageService } from '@/services/storage';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryForeground: string;
  
  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  
  // Background colors
  background: string;
  foreground: string;
  
  // Muted colors
  muted: string;
  mutedForeground: string;
  
  // Border colors
  border: string;
  input: string;
  
  // Status colors
  destructive: string;
  destructiveForeground: string;
  warning: string;
  warningForeground: string;
  success: string;
  successForeground: string;
  
  // PIP-specific colors
  pipGreen: string;
  pipAmber: string;
  pipBlue: string;
  pipRed: string;
}

export interface PipTheme {
  id: string;
  name: string;
  description: string;
  category: 'vault' | 'wasteland' | 'faction' | 'custom';
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  fonts: {
    display: string;
    mono: string;
    sans: string;
  };
  effects: {
    scanlines: boolean;
    crt: boolean;
    glow: boolean;
    noise: boolean;
  };
  isDefault?: boolean;
  isPremium?: boolean;
}

// Default Vault-Tec theme
const vaultTecTheme: PipTheme = {
  id: 'vault-tec',
  name: 'Vault-Tec Classic',
  description: 'The classic Vault-Tec PIP-Boy experience',
  category: 'vault',
  isDefault: true,
  colors: {
    light: {
      primary: '180 100% 45%', // Classic green
      primaryForeground: '0 0% 98%',
      secondary: '200 25% 15%',
      secondaryForeground: '180 100% 75%',
      accent: '45 100% 55%', // Amber accent
      accentForeground: '0 0% 5%',
      background: '200 30% 8%',
      foreground: '180 100% 85%',
      muted: '200 25% 12%',
      mutedForeground: '180 50% 65%',
      border: '180 50% 25%',
      input: '200 25% 15%',
      destructive: '0 70% 55%',
      destructiveForeground: '0 0% 98%',
      warning: '45 100% 55%',
      warningForeground: '0 0% 5%',
      success: '120 60% 50%',
      successForeground: '0 0% 98%',
      pipGreen: '180 100% 45%',
      pipAmber: '45 100% 55%',
      pipBlue: '200 100% 65%',
      pipRed: '0 70% 55%',
    },
    dark: {
      primary: '180 100% 45%',
      primaryForeground: '0 0% 98%',
      secondary: '200 25% 15%',
      secondaryForeground: '180 100% 75%',
      accent: '45 100% 55%',
      accentForeground: '0 0% 5%',
      background: '200 30% 3%',
      foreground: '180 100% 85%',
      muted: '200 25% 8%',
      mutedForeground: '180 50% 55%',
      border: '180 50% 20%',
      input: '200 25% 10%',
      destructive: '0 70% 50%',
      destructiveForeground: '0 0% 98%',
      warning: '45 100% 50%',
      warningForeground: '0 0% 5%',
      success: '120 60% 45%',
      successForeground: '0 0% 98%',
      pipGreen: '180 100% 45%',
      pipAmber: '45 100% 55%',
      pipBlue: '200 100% 65%',
      pipRed: '0 70% 55%',
    },
  },
  fonts: {
    display: 'Orbitron',
    mono: 'JetBrains Mono',
    sans: 'Inter',
  },
  effects: {
    scanlines: true,
    crt: true,
    glow: true,
    noise: false,
  },
};

// Brotherhood of Steel theme
const brotherhoodTheme: PipTheme = {
  id: 'brotherhood',
  name: 'Brotherhood of Steel',
  description: 'Military-grade interface for the Brotherhood',
  category: 'faction',
  colors: {
    light: {
      primary: '210 100% 55%', // Steel blue
      primaryForeground: '0 0% 98%',
      secondary: '210 25% 20%',
      secondaryForeground: '210 100% 80%',
      accent: '25 100% 55%', // Orange accent
      accentForeground: '0 0% 5%',
      background: '210 30% 10%',
      foreground: '210 100% 90%',
      muted: '210 25% 15%',
      mutedForeground: '210 50% 70%',
      border: '210 50% 30%',
      input: '210 25% 18%',
      destructive: '0 70% 55%',
      destructiveForeground: '0 0% 98%',
      warning: '45 100% 55%',
      warningForeground: '0 0% 5%',
      success: '120 60% 50%',
      successForeground: '0 0% 98%',
      pipGreen: '120 60% 50%',
      pipAmber: '45 100% 55%',
      pipBlue: '210 100% 55%',
      pipRed: '0 70% 55%',
    },
    dark: {
      primary: '210 100% 50%',
      primaryForeground: '0 0% 98%',
      secondary: '210 25% 15%',
      secondaryForeground: '210 100% 75%',
      accent: '25 100% 50%',
      accentForeground: '0 0% 5%',
      background: '210 30% 5%',
      foreground: '210 100% 85%',
      muted: '210 25% 10%',
      mutedForeground: '210 50% 60%',
      border: '210 50% 25%',
      input: '210 25% 12%',
      destructive: '0 70% 50%',
      destructiveForeground: '0 0% 98%',
      warning: '45 100% 50%',
      warningForeground: '0 0% 5%',
      success: '120 60% 45%',
      successForeground: '0 0% 98%',
      pipGreen: '120 60% 45%',
      pipAmber: '45 100% 50%',
      pipBlue: '210 100% 50%',
      pipRed: '0 70% 50%',
    },
  },
  fonts: {
    display: 'Orbitron',
    mono: 'JetBrains Mono',
    sans: 'Inter',
  },
  effects: {
    scanlines: false,
    crt: false,
    glow: true,
    noise: false,
  },
};

// NCR theme
const ncrTheme: PipTheme = {
  id: 'ncr',
  name: 'New California Republic',
  description: 'Democratic interface for NCR citizens',
  category: 'faction',
  colors: {
    light: {
      primary: '45 100% 50%', // NCR Gold
      primaryForeground: '0 0% 5%',
      secondary: '0 50% 25%',
      secondaryForeground: '45 100% 85%',
      accent: '0 70% 55%', // Red accent
      accentForeground: '0 0% 98%',
      background: '35 20% 12%',
      foreground: '45 100% 90%',
      muted: '35 15% 18%',
      mutedForeground: '45 60% 70%',
      border: '45 50% 35%',
      input: '35 15% 20%',
      destructive: '0 70% 55%',
      destructiveForeground: '0 0% 98%',
      warning: '45 100% 55%',
      warningForeground: '0 0% 5%',
      success: '120 60% 50%',
      successForeground: '0 0% 98%',
      pipGreen: '120 60% 50%',
      pipAmber: '45 100% 50%',
      pipBlue: '210 100% 65%',
      pipRed: '0 70% 55%',
    },
    dark: {
      primary: '45 100% 45%',
      primaryForeground: '0 0% 5%',
      secondary: '0 50% 20%',
      secondaryForeground: '45 100% 80%',
      accent: '0 70% 50%',
      accentForeground: '0 0% 98%',
      background: '35 20% 8%',
      foreground: '45 100% 85%',
      muted: '35 15% 12%',
      mutedForeground: '45 60% 65%',
      border: '45 50% 30%',
      input: '35 15% 15%',
      destructive: '0 70% 50%',
      destructiveForeground: '0 0% 98%',
      warning: '45 100% 50%',
      warningForeground: '0 0% 5%',
      success: '120 60% 45%',
      successForeground: '0 0% 98%',
      pipGreen: '120 60% 45%',
      pipAmber: '45 100% 45%',
      pipBlue: '210 100% 60%',
      pipRed: '0 70% 50%',
    },
  },
  fonts: {
    display: 'Orbitron',
    mono: 'JetBrains Mono',
    sans: 'Inter',
  },
  effects: {
    scanlines: true,
    crt: false,
    glow: false,
    noise: true,
  },
};

// Available themes
export const AVAILABLE_THEMES: Record<string, PipTheme> = {
  'vault-tec': vaultTecTheme,
  'brotherhood': brotherhoodTheme,
  'ncr': ncrTheme,
};

// Theme manager class
class ThemeManager {
  private currentTheme: string = 'vault-tec';
  private currentMode: 'light' | 'dark' = 'dark';
  private storageKey = 'pip_theme_config';

  constructor() {
    this.loadThemeConfig();
    this.applyTheme();
  }

  private loadThemeConfig() {
    try {
      const config = localStorageService.get<{ theme: string; mode: 'light' | 'dark' }>(
        this.storageKey
      );
      
      if (config) {
        this.currentTheme = config.theme;
        this.currentMode = config.mode;
      }
    } catch (error) {
      // Failed to load theme config
    }
  }

  private saveThemeConfig() {
    try {
      localStorageService.set(this.storageKey, {
        theme: this.currentTheme,
        mode: this.currentMode,
      });
    } catch (error) {
      // Failed to save theme config
    }
  }

  private applyTheme() {
    const theme = AVAILABLE_THEMES[this.currentTheme];
    if (!theme) {
      // Theme not found
      return;
    }

    const colors = theme.colors[this.currentMode];
    const root = document.documentElement;

    // Apply color variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    // Apply font variables
    root.style.setProperty('--font-display', theme.fonts.display);
    root.style.setProperty('--font-mono', theme.fonts.mono);
    root.style.setProperty('--font-sans', theme.fonts.sans);

    // Apply effects
    root.classList.toggle('scanlines', theme.effects.scanlines);
    root.classList.toggle('crt-effect', theme.effects.crt);
    root.classList.toggle('glow-effect', theme.effects.glow);
    root.classList.toggle('noise-effect', theme.effects.noise);

    // Update theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (themeColorMeta) {
      themeColorMeta.content = `hsl(${colors.primary})`;
    }
  }

  getCurrentTheme(): PipTheme {
    return AVAILABLE_THEMES[this.currentTheme] || AVAILABLE_THEMES['vault-tec'];
  }

  getCurrentThemeId(): string {
    return this.currentTheme;
  }

  getCurrentMode(): 'light' | 'dark' {
    return this.currentMode;
  }

  setTheme(themeId: string, persist = true): boolean {
    if (!AVAILABLE_THEMES[themeId]) {
      // Theme not found
      return false;
    }

    this.currentTheme = themeId;
    this.applyTheme();

    if (persist) {
      this.saveThemeConfig();
    }

    return true;
  }

  setMode(mode: 'light' | 'dark', persist = true): void {
    this.currentMode = mode;
    this.applyTheme();

    if (persist) {
      this.saveThemeConfig();
    }
  }

  toggleMode(persist = true): void {
    this.setMode(this.currentMode === 'light' ? 'dark' : 'light', persist);
  }

  getAvailableThemes(): PipTheme[] {
    return Object.values(AVAILABLE_THEMES);
  }

  getThemesByCategory(category: PipTheme['category']): PipTheme[] {
    return this.getAvailableThemes().filter(theme => theme.category === category);
  }

  // Custom theme support
  addCustomTheme(theme: PipTheme): boolean {
    if (AVAILABLE_THEMES[theme.id]) {
      // Theme already exists
      return false;
    }

    AVAILABLE_THEMES[theme.id] = theme;
    return true;
  }

  removeCustomTheme(themeId: string): boolean {
    const theme = AVAILABLE_THEMES[themeId];
    if (!theme) {
      return false;
    }

    if (theme.isDefault) {
      // Cannot remove default theme
      return false;
    }

    delete AVAILABLE_THEMES[themeId];

    // Switch to default theme if current theme is removed
    if (this.currentTheme === themeId) {
      this.setTheme('vault-tec');
    }

    return true;
  }

  // System theme detection
  detectSystemTheme(): 'light' | 'dark' {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  setAutoMode(enabled = true): void {
    if (enabled) {
      const systemTheme = this.detectSystemTheme();
      this.setMode(systemTheme);

      // Listen for system theme changes
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
          this.setMode(e.matches ? 'dark' : 'light');
        });
      }
    }
  }
}

// Create singleton instance
export const themeManager = new ThemeManager();

// Convenience functions
export const getCurrentTheme = (): PipTheme => {
  return themeManager.getCurrentTheme();
};

export const setTheme = (themeId: string): boolean => {
  return themeManager.setTheme(themeId);
};

export const toggleThemeMode = (): void => {
  themeManager.toggleMode();
};

export const getAvailableThemes = (): PipTheme[] => {
  return themeManager.getAvailableThemes();
};

// React hook for theme management
export const useTheme = () => {
  return {
    currentTheme: themeManager.getCurrentTheme(),
    currentThemeId: themeManager.getCurrentThemeId(),
    currentMode: themeManager.getCurrentMode(),
    availableThemes: themeManager.getAvailableThemes(),
    setTheme: (themeId: string) => themeManager.setTheme(themeId),
    setMode: (mode: 'light' | 'dark') => themeManager.setMode(mode),
    toggleMode: () => themeManager.toggleMode(),
  };
};