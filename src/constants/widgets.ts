// Widget-specific Constants
export const WIDGET_CATEGORIES = {
  PRODUCTIVITY: 'productivity',
  ENTERTAINMENT: 'entertainment',
  SYSTEM: 'system',
  DATA: 'data',
  COMMUNICATION: 'communication',
} as const;

export const WIDGET_DIMENSIONS = {
  MIN_WIDTH: 250,
  MIN_HEIGHT: 150,
  DEFAULT_WIDTH: 300,
  DEFAULT_HEIGHT: 200,
  GRID_GAP: 24,
} as const;

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

export const WIDGET_SIZE_LIMITS = {
  MIN_INSTANCES: 0,
  MAX_INSTANCES: 20,
  MAX_PER_TAB: 12,
} as const;