// Widget System Constants

export const WIDGET_TYPES = {
  CHARACTER_PROFILE: 'character-profile',
  SPECIAL_STATS: 'special-stats',
  SYSTEM_MONITOR: 'system-monitor',
  WEATHER_STATION: 'weather-station',
  ACHIEVEMENT_GALLERY: 'achievement-gallery',
  FILE_EXPLORER: 'file-explorer',
  SECURE_VAULT: 'secure-vault',
  NEWS_TERMINAL: 'news-terminal',
  AUDIO_PLAYER: 'audio-player',
  CALENDAR_MISSION: 'calendar-mission',
  AI_ORACLE: 'ai-oracle',
  CRYPTOCURRENCY: 'cryptocurrency',
  TERMINAL: 'terminal',
} as const;

export const WIDGET_CATEGORIES = {
  PRODUCTIVITY: 'productivity',
  ENTERTAINMENT: 'entertainment',
  SYSTEM: 'system',
  DATA: 'data',
  COMMUNICATION: 'communication',
} as const;

export const WIDGET_WIDTHS = {
  HALF: 'half',
  FULL: 'full',
} as const;

export const WIDGET_DIMENSIONS = {
  MIN_WIDTH: 250,
  MIN_HEIGHT: 150,
  DEFAULT_WIDTH: 300,
  DEFAULT_HEIGHT: 200,
  GRID_GAP: 24,
} as const;

export const WIDGET_ICONS = {
  [WIDGET_TYPES.CHARACTER_PROFILE]: 'folder',
  [WIDGET_TYPES.SPECIAL_STATS]: 'bar-chart-3',
  [WIDGET_TYPES.SYSTEM_MONITOR]: 'monitor',
  [WIDGET_TYPES.WEATHER_STATION]: 'cloud',
  [WIDGET_TYPES.ACHIEVEMENT_GALLERY]: 'trophy',
  [WIDGET_TYPES.FILE_EXPLORER]: 'folder',
  [WIDGET_TYPES.SECURE_VAULT]: 'shield',
  [WIDGET_TYPES.NEWS_TERMINAL]: 'file-text',
  [WIDGET_TYPES.AUDIO_PLAYER]: 'music',
  [WIDGET_TYPES.CALENDAR_MISSION]: 'calendar',
  [WIDGET_TYPES.AI_ORACLE]: 'message-circle',
  [WIDGET_TYPES.CRYPTOCURRENCY]: 'dollar-sign',
  [WIDGET_TYPES.TERMINAL]: 'terminal',
} as const;

export const WIDGET_SETTINGS_VALIDATION = {
  MAX_TITLE_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 200,
  MIN_REFRESH_INTERVAL: 1000, // 1 second
  MAX_REFRESH_INTERVAL: 3600000, // 1 hour
  MAX_ITEMS_PER_WIDGET: 100,
} as const;

export const WIDGET_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  UPDATING: 'updating',
} as const;