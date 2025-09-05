// Feature Flag System for Chimera-PIP 4000 mk2
// Centralized feature management with conditional functionality

import { environment } from './environment';
import { localStorageService } from '@/services/storage';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'experimental' | 'premium' | 'debug';
  requirements?: string[];
  conflicts?: string[];
}

// Core feature flags definition
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Core Features
  ANALYTICS: {
    key: 'analytics',
    name: 'Analytics Tracking',
    description: 'Enable user behavior analytics and performance monitoring',
    enabled: environment.features.enableAnalytics,
    category: 'core',
  },
  
  PWA_SUPPORT: {
    key: 'pwa_support',
    name: 'Progressive Web App',
    description: 'Enable PWA functionality including offline support and installation',
    enabled: environment.features.enablePWA,
    category: 'core',
  },
  
  OFFLINE_MODE: {
    key: 'offline_mode',
    name: 'Offline Mode',
    description: 'Enable offline functionality and local data synchronization',
    enabled: environment.features.enableOfflineMode,
    category: 'core',
    requirements: ['pwa_support'],
  },
  
  // Authentication Features
  BIOMETRIC_AUTH: {
    key: 'biometric_auth',
    name: 'Biometric Authentication',
    description: 'Enable fingerprint and face recognition login',
    enabled: environment.features.enableBiometrics,
    category: 'core',
  },
  
  PATTERN_LOGIN: {
    key: 'pattern_login',
    name: 'Pattern Login',
    description: 'Enable pattern-based authentication method',
    enabled: true,
    category: 'core',
  },
  
  PIN_LOGIN: {
    key: 'pin_login',
    name: 'PIN Login',
    description: 'Enable PIN-based quick authentication',
    enabled: true,
    category: 'core',
  },
  
  // Widget Features
  WIDGET_MARKETPLACE: {
    key: 'widget_marketplace',
    name: 'Widget Marketplace',
    description: 'Enable browsing and installing widgets from marketplace',
    enabled: false,
    category: 'experimental',
  },
  
  WIDGET_SHARING: {
    key: 'widget_sharing',
    name: 'Widget Sharing',
    description: 'Enable sharing widget configurations between users',
    enabled: false,
    category: 'experimental',
  },
  
  ADVANCED_WIDGETS: {
    key: 'advanced_widgets',
    name: 'Advanced Widgets',
    description: 'Enable advanced widget types like AI Oracle and Terminal',
    enabled: true,
    category: 'core',
  },
  
  // Premium Features
  CLOUD_SYNC: {
    key: 'cloud_sync',
    name: 'Cloud Synchronization',
    description: 'Sync settings and data across devices',
    enabled: false,
    category: 'premium',
  },
  
  ADVANCED_THEMES: {
    key: 'advanced_themes',
    name: 'Advanced Themes',
    description: 'Access to premium themes and customization options',
    enabled: false,
    category: 'premium',
  },
  
  UNLIMITED_TABS: {
    key: 'unlimited_tabs',
    name: 'Unlimited Tabs',
    description: 'Remove tab limitations for premium users',
    enabled: false,
    category: 'premium',
  },
  
  // Experimental Features
  AI_ASSISTANCE: {
    key: 'ai_assistance',
    name: 'AI Assistant',
    description: 'Enable AI-powered help and automation features',
    enabled: false,
    category: 'experimental',
  },
  
  VOICE_COMMANDS: {
    key: 'voice_commands',
    name: 'Voice Commands',
    description: 'Enable voice control for navigation and commands',
    enabled: false,
    category: 'experimental',
  },
  
  GESTURE_CONTROLS: {
    key: 'gesture_controls',
    name: 'Gesture Controls',
    description: 'Enable gesture-based navigation and interactions',
    enabled: false,
    category: 'experimental',
  },
  
  // Debug Features
  DEV_TOOLS: {
    key: 'dev_tools',
    name: 'Developer Tools',
    description: 'Enable developer debugging tools and overlays',
    enabled: environment.features.enableDevTools,
    category: 'debug',
  },
  
  PERFORMANCE_MONITOR: {
    key: 'performance_monitor',
    name: 'Performance Monitor',
    description: 'Enable real-time performance monitoring overlay',
    enabled: environment.features.enableDevTools,
    category: 'debug',
  },
  
  ERROR_BOUNDARY_OVERLAY: {
    key: 'error_boundary_overlay',
    name: 'Error Boundary Overlay',
    description: 'Show detailed error information in production',
    enabled: environment.features.enableDevTools,
    category: 'debug',
  },
};

// Feature flag manager class
class FeatureFlagManager {
  private overrides: Record<string, boolean> = {};
  private storageKey = 'pip_feature_overrides';
  
  constructor() {
    this.loadOverrides();
  }
  
  private loadOverrides() {
    try {
      const stored = localStorageService.get<Record<string, boolean>>(this.storageKey);
      if (stored) {
        this.overrides = stored;
      }
    } catch (error) {
      console.warn('Failed to load feature flag overrides:', error);
    }
  }
  
  private saveOverrides() {
    try {
      localStorageService.set(this.storageKey, this.overrides);
    } catch (error) {
      console.warn('Failed to save feature flag overrides:', error);
    }
  }
  
  isEnabled(flagKey: string): boolean {
    // Check for local override first
    if (flagKey in this.overrides) {
      return this.overrides[flagKey];
    }
    
    const flag = FEATURE_FLAGS[flagKey.toUpperCase()];
    if (!flag) {
      console.warn(`Feature flag '${flagKey}' not found`);
      return false;
    }
    
    // Check requirements
    if (flag.requirements) {
      const requirementsMet = flag.requirements.every(req => 
        this.isEnabled(req)
      );
      if (!requirementsMet) {
        return false;
      }
    }
    
    // Check conflicts
    if (flag.conflicts) {
      const hasConflicts = flag.conflicts.some(conflict => 
        this.isEnabled(conflict)
      );
      if (hasConflicts) {
        return false;
      }
    }
    
    return flag.enabled;
  }
  
  enable(flagKey: string, persist = true) {
    this.overrides[flagKey.toUpperCase()] = true;
    if (persist) {
      this.saveOverrides();
    }
  }
  
  disable(flagKey: string, persist = true) {
    this.overrides[flagKey.toUpperCase()] = false;
    if (persist) {
      this.saveOverrides();
    }
  }
  
  toggle(flagKey: string, persist = true) {
    const isCurrentlyEnabled = this.isEnabled(flagKey);
    if (isCurrentlyEnabled) {
      this.disable(flagKey, persist);
    } else {
      this.enable(flagKey, persist);
    }
  }
  
  reset(flagKey?: string) {
    if (flagKey) {
      delete this.overrides[flagKey.toUpperCase()];
    } else {
      this.overrides = {};
    }
    this.saveOverrides();
  }
  
  getAllFlags(): FeatureFlag[] {
    return Object.values(FEATURE_FLAGS);
  }
  
  getFlagsByCategory(category: FeatureFlag['category']): FeatureFlag[] {
    return this.getAllFlags().filter(flag => flag.category === category);
  }
  
  getOverrides(): Record<string, boolean> {
    return { ...this.overrides };
  }
}

// Create singleton instance
export const featureFlags = new FeatureFlagManager();

// Convenience functions
export const isFeatureEnabled = (flagKey: string): boolean => {
  return featureFlags.isEnabled(flagKey);
};

export const enableFeature = (flagKey: string, persist = true): void => {
  featureFlags.enable(flagKey, persist);
};

export const disableFeature = (flagKey: string, persist = true): void => {
  featureFlags.disable(flagKey, persist);
};

export const toggleFeature = (flagKey: string, persist = true): void => {
  featureFlags.toggle(flagKey, persist);
};

// React hook for feature flags
export const useFeatureFlag = (flagKey: string) => {
  const isEnabled = featureFlags.isEnabled(flagKey);
  
  return {
    isEnabled,
    enable: () => featureFlags.enable(flagKey),
    disable: () => featureFlags.disable(flagKey),
    toggle: () => featureFlags.toggle(flagKey),
  };
};

// Feature flag categories
export const FEATURE_CATEGORIES = {
  CORE: 'core' as const,
  EXPERIMENTAL: 'experimental' as const,
  PREMIUM: 'premium' as const,
  DEBUG: 'debug' as const,
};