// Database Configuration
export const database = {
  // Connection settings
  maxRetries: 3,
  retryDelay: 1000,
  connectionTimeout: 30000,
  
  // Query settings
  defaultPageSize: 25,
  maxPageSize: 100,
  
  // Cache settings
  enableQueryCache: true,
  cacheTimeout: 300000, // 5 minutes
  
  // Table names
  tables: {
    users: 'users',
    widgets: 'widgets',
    widgetInstances: 'widget_instances',
    widgetSettings: 'widget_instance_settings',
    aiConversations: 'ai_conversations',
    auditLogs: 'audit_logs',
  },
  
  // Realtime settings
  realtime: {
    enablePresence: true,
    presenceTimeout: 60000, // 1 minute
  },
} as const;