// Configuration Module for Chimera-PIP 4000 mk2

export { 
  environment,
  validateEnvironment,
  isDevelopment,
  isProduction,
  isStaging,
  isFeatureEnabled as isEnvFeatureEnabled,
  supabase,
  app,
  features,
  api,
  storage,
} from './environment';

export {
  FEATURE_FLAGS,
  featureFlags,
  isFeatureEnabled,
  enableFeature,
  disableFeature,
  toggleFeature,
  useFeatureFlag,
  FEATURE_CATEGORIES,
} from './features';
export type { FeatureFlag } from './features';

export {
  AVAILABLE_THEMES,
  themeManager,
  getCurrentTheme,
  setTheme,
  toggleThemeMode,
  getAvailableThemes,
  useTheme,
} from './themes';
export type { ThemeColors, PipTheme } from './themes';