// Application Constants for Chimera-PIP 4000 mk2

// Interaction Delays (ms)
export const INTERACTION_DELAYS = {
  LONG_PRESS: 500,
  DEBOUNCE_SYNC: 1000,
  DEBOUNCE_SEARCH: 300,
  ANIMATION: 200,
  TOOLTIP_DELAY: 750,
} as const;

// Widget Dimensions
export const WIDGET_DIMENSIONS = {
  MIN_WIDTH: 250,
  MIN_HEIGHT: 150,
  DEFAULT_WIDTH: 300,
  DEFAULT_HEIGHT: 200,
  GRID_GAP: 24,
} as const;

// Grid System Configuration
export const GRID_SYSTEM = {
  COLUMNS: 12,
  MIN_WIDGET_WIDTH: 1,
  MAX_WIDGET_WIDTH: 12,
  MIN_WIDGET_HEIGHT: 1,
  MAX_WIDGET_HEIGHT: 4,
  DEFAULT_WIDGET_WIDTH: 6,
  DEFAULT_WIDGET_HEIGHT: 1,
  CELL_HEIGHT: 200,
  GAP: 24,
} as const;

// Widget Size Presets
export const WIDGET_SIZE_PRESETS = {
  SMALL: { width: 3, height: 1 },
  MEDIUM: { width: 6, height: 1 },
  LARGE: { width: 12, height: 1 },
  TALL: { width: 6, height: 2 },
  SQUARE: { width: 4, height: 2 },
  WIDE: { width: 8, height: 1 },
} as const;

// System Monitor Thresholds
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

// Refresh Intervals (ms)
export const REFRESH_INTERVALS = {
  SYSTEM_MONITOR: 5000,
  WEATHER_STATION: 30000,
  NEWS_TERMINAL: 60000,
  FAST: 2000,
  NORMAL: 5000,
  SLOW: 10000,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1200,
  MIN_TOUCH_TARGET: 44,
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
} as const;

// Color Theme Names
export const THEME_NAMES = {
  GREEN: 'green',
  AMBER: 'amber',
  BLUE: 'blue',
  RED: 'red',
  WHITE: 'white',
} as const;

// Widget Categories
export const WIDGET_CATEGORIES = {
  PRODUCTIVITY: 'productivity',
  ENTERTAINMENT: 'entertainment',
  SYSTEM: 'system',
  DATA: 'data',
  COMMUNICATION: 'communication',
} as const;

// Tab Assignments
export const TAB_ASSIGNMENTS = {
  STAT: 'STAT',
  INV: 'INV',
  DATA: 'DATA',
  MAP: 'MAP',
  RADIO: 'RADIO',
} as const;

// Error Messages
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

// Webhook Timeouts (ms)
export const WEBHOOK_TIMEOUTS = {
  AI_CHAT: 45000,
  NEWS_AGGREGATOR: 30000,
  WEATHER_API: 20000,
  CRYPTO_API: 15000,
  DEFAULT: 30000,
} as const;

// Success Messages  
export const SUCCESS_MESSAGES = {
  WIDGET_ADDED: 'Widget added successfully',
  WIDGET_REMOVED: 'Widget removed successfully',
  WIDGET_UPDATED: 'Widget updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// Modal Sizing Constants
export const MODAL_SIZES = {
  SETTINGS_MODAL: 'max-w-4xl h-[85vh] md:h-[80vh]',
  WIDGET_SETTINGS_MODAL: 'max-w-4xl h-[85vh] md:h-[80vh]',
  CATALOG_MODAL: 'max-w-6xl h-[90vh]',
} as const;