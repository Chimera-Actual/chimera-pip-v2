// API Constants

export const API_TIMEOUTS = {
  SHORT: 5000,    // 5 seconds
  MEDIUM: 15000,  // 15 seconds
  LONG: 30000,    // 30 seconds
  VERY_LONG: 60000, // 1 minute
} as const;

export const WEBHOOK_TIMEOUTS = {
  AI_CHAT: 45000,
  NEWS_AGGREGATOR: 30000,
  WEATHER_API: 20000,
  CRYPTO_API: 15000,
  DEFAULT: 30000,
} as const;

export const RETRY_CONFIG = {
  DEFAULT_RETRIES: 3,
  DEFAULT_RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 10000,
  EXPONENTIAL_BASE: 1.5,
  RATE_LIMIT_BASE: 2,
  RATE_LIMIT_MAX_DELAY: 60000,
} as const;

export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  SHORT_TTL: 1 * 60 * 1000,   // 1 minute
  MEDIUM_TTL: 15 * 60 * 1000, // 15 minutes
  LONG_TTL: 60 * 60 * 1000,   // 1 hour
  VERY_LONG_TTL: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const SUPABASE_TABLES = {
  USERS: 'users',
  USER_WIDGETS: 'user_widgets',
  USER_TABS: 'user_tabs',
  USER_ACTIVITIES: 'user_activities',
  USER_ACHIEVEMENTS: 'user_achievements',
  USER_ANALYTICS: 'user_analytics',
  USER_PRESENCE: 'user_presence',
  AI_AGENTS: 'ai_agents',
  AI_CONVERSATIONS: 'ai_conversations',
  WIDGET_CATALOG: 'widget_catalog',
  WIDGET_SETTINGS_SCHEMAS: 'widget_settings_schemas',
  WIDGET_INSTANCE_SETTINGS: 'widget_instance_settings',
  WIDGET_TAGS: 'widget_tags',
  WIDGET_TAG_ASSOCIATIONS: 'widget_tag_associations',
  AUDIT_LOGS: 'audit_logs',
  SECURITY_EVENTS: 'security_events',
} as const;

export const REALTIME_EVENTS = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  ALL: '*',
} as const;

export const REQUEST_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
  X_REQUEST_ID: 'X-Request-ID',
  X_CLIENT_VERSION: 'X-Client-Version',
} as const;