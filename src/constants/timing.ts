// Timing Constants
export const INTERACTION_DELAYS = {
  LONG_PRESS: 500,
  DEBOUNCE_SYNC: 1000,
  DEBOUNCE_SEARCH: 300,
  ANIMATION: 200,
  TOOLTIP_DELAY: 750,
} as const;

export const REFRESH_INTERVALS = {
  SYSTEM_MONITOR: 5000,
  WEATHER_STATION: 30000,
  NEWS_TERMINAL: 60000,
  FAST: 2000,
  NORMAL: 5000,
  SLOW: 10000,
} as const;

export const WEBHOOK_TIMEOUTS = {
  AI_CHAT: 45000,
  NEWS_AGGREGATOR: 30000,
  WEATHER_API: 20000,
  CRYPTO_API: 15000,
  DEFAULT: 30000,
} as const;

export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 2 * 60 * 60 * 1000, // 2 hours
  DAY: 24 * 60 * 60 * 1000, // 24 hours
} as const;