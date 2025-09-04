// Consolidated Constants Export

export * from './widgets';
export * from './ui';
export * from './api';

// Legacy constants (kept for backward compatibility)
export const TAB_ASSIGNMENTS = {
  STAT: 'STAT',
  INV: 'INV',
  DATA: 'DATA',
  MAP: 'MAP',
  RADIO: 'RADIO',
} as const;

export const THEME_NAMES = {
  GREEN: 'green',
  AMBER: 'amber',
  BLUE: 'blue',
  RED: 'red',
  WHITE: 'white',
} as const;

export const REFRESH_INTERVALS = {
  SYSTEM_MONITOR: 5000,
  WEATHER_STATION: 30000,
  NEWS_TERMINAL: 60000,
  FAST: 2000,
  NORMAL: 5000,
  SLOW: 10000,
} as const;

export const SYSTEM_THRESHOLDS = {
  CPU_WARNING: 70,
  CPU_CRITICAL: 90,
  MEMORY_WARNING: 80,
  MEMORY_CRITICAL: 95,
  NETWORK_WARNING: 75,
  NETWORK_CRITICAL: 90,
  STORAGE_WARNING: 85,
  STORAGE_CRITICAL: 95,
} as const;

export const ERROR_MESSAGES = {
  WIDGET_SYNC_FAILED: 'Failed to save widget settings',
  WIDGET_LOAD_FAILED: 'Failed to load widgets',
  WIDGET_ADD_FAILED: 'Failed to add widget',
  WIDGET_DELETE_FAILED: 'Failed to remove widget',
  NETWORK_ERROR: 'Network connection error',
  PERMISSION_DENIED: 'Permission denied',
  WEBHOOK_TIMEOUT: 'N8N webhook request timed out',
  WEBHOOK_FAILED: 'N8N webhook request failed',
  WEBHOOK_NOT_CONFIGURED: 'N8N webhook not configured',
} as const;

export const SUCCESS_MESSAGES = {
  WIDGET_ADDED: 'Widget added successfully',
  WIDGET_REMOVED: 'Widget removed successfully',
  WIDGET_UPDATED: 'Widget updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;