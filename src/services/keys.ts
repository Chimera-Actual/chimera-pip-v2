// Query key factory for consistent cache management
export const queryKeys = {
  // User-related queries
  profile: (userId: string) => ['profile', userId] as const,
  
  // Tab-related queries
  tabs: (userId: string) => ['tabs', userId] as const,
  tab: (tabId: string) => ['tab', tabId] as const,
  
  // Widget-related queries  
  widgets: (tabAssignment: string, userId: string) => ['widgets', tabAssignment, userId] as const,
  widget: (widgetId: string) => ['widget', widgetId] as const,
  
  // Analytics
  analytics: (userId: string) => ['analytics', userId] as const,
  
  // API keys
  apiKeys: (userId: string) => ['apiKeys', userId] as const,
} as const;