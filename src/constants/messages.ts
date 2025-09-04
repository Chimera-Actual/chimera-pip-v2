// Message Constants
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
  AUTH_FAILED: 'Authentication failed',
  VALIDATION_FAILED: 'Validation failed',
  SERVER_ERROR: 'Server error occurred',
} as const;

export const SUCCESS_MESSAGES = {
  WIDGET_ADDED: 'Widget added successfully',
  WIDGET_REMOVED: 'Widget removed successfully',
  WIDGET_UPDATED: 'Widget updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  AUTH_SUCCESS: 'Authentication successful',
  DATA_SAVED: 'Data saved successfully',
  SYNC_COMPLETE: 'Synchronization complete',
} as const;

export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  SYNCING: 'Syncing...',
  PROCESSING: 'Processing...',
  CONNECTING: 'Connecting...',
  FETCHING_DATA: 'Fetching data...',
} as const;

export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'You have unsaved changes',
  DATA_OUTDATED: 'Data may be outdated',
  CONNECTION_SLOW: 'Connection is slow',
  STORAGE_FULL: 'Storage is nearly full',
  RATE_LIMITED: 'Rate limit exceeded',
} as const;