// Environment Configuration for Chimera-PIP 4000 mk2
// Centralized environment variable access with type safety

interface EnvironmentConfig {
  // Supabase Configuration
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // Application Configuration
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
    baseUrl: string;
  };
  
  // Feature Flags
  features: {
    enableAnalytics: boolean;
    enablePWA: boolean;
    enableOfflineMode: boolean;
    enableBiometrics: boolean;
    enableDevTools: boolean;
  };
  
  // API Configuration
  api: {
    timeout: number;
    retryAttempts: number;
    rateLimitWindow: number;
  };
  
  // Storage Configuration
  storage: {
    encryptionEnabled: boolean;
    compressionEnabled: boolean;
    maxCacheSize: number;
  };
}

// Environment variable getters with validation
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not defined`);
  }
  return value;
};

const getBooleanEnvVar = (key: string, defaultValue = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const defaultAppBaseUrl = (() => {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return 'http://localhost:5173';
})();

// Environment configuration object
export const environment: EnvironmentConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL', ''),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),
  },
  
  app: {
    name: 'Chimera-PIP 4000 mk2',
    version: '2.0.0',
    environment: (import.meta.env.MODE as any) || 'development',
    baseUrl: getEnvVar('VITE_APP_BASE_URL', defaultAppBaseUrl),
  },
  
  features: {
    enableAnalytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', true),
    enablePWA: getBooleanEnvVar('VITE_ENABLE_PWA', true),
    enableOfflineMode: getBooleanEnvVar('VITE_ENABLE_OFFLINE', true),
    enableBiometrics: getBooleanEnvVar('VITE_ENABLE_BIOMETRICS', true),
    enableDevTools: getBooleanEnvVar('VITE_ENABLE_DEV_TOOLS', import.meta.env.DEV),
  },
  
  api: {
    timeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
    retryAttempts: getNumberEnvVar('VITE_API_RETRY_ATTEMPTS', 3),
    rateLimitWindow: getNumberEnvVar('VITE_API_RATE_LIMIT_WINDOW', 60000),
  },
  
  storage: {
    encryptionEnabled: getBooleanEnvVar('VITE_STORAGE_ENCRYPTION', false),
    compressionEnabled: getBooleanEnvVar('VITE_STORAGE_COMPRESSION', true),
    maxCacheSize: getNumberEnvVar('VITE_MAX_CACHE_SIZE', 50 * 1024 * 1024), // 50MB
  },
};

// Validation function to check if all required environment variables are set
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required Supabase configuration
  if (!environment.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!environment.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  // Validate URL format
  try {
    new URL(environment.supabase.url);
  } catch {
    if (environment.supabase.url) {
      errors.push('VITE_SUPABASE_URL must be a valid URL');
    }
  }
  
  try {
    new URL(environment.app.baseUrl);
  } catch {
    errors.push('VITE_APP_BASE_URL must be a valid URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Development helpers
export const isDevelopment = environment.app.environment === 'development';
export const isProduction = environment.app.environment === 'production';
export const isStaging = environment.app.environment === 'staging';

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof EnvironmentConfig['features']): boolean => {
  return environment.features[feature];
};

// Export individual config sections for convenience
export const { supabase, app, features, api, storage } = environment;