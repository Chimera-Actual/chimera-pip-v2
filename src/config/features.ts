// Feature Flags Configuration
export const features = {
  // Widget features
  widgets: {
    enableDragAndDrop: true,
    enableResizing: true,
    enableCustomization: true,
    maxWidgetsPerTab: 12,
    enableWidgetSharing: false,
  },

  // Authentication features
  auth: {
    enableBiometric: true,
    enablePatternLogin: true,
    enablePinLogin: true,
    enableSocialLogin: false,
    requireEmailVerification: false,
  },

  // Performance features
  performance: {
    enableLazyLoading: true,
    enableVirtualization: true,
    enableImageOptimization: true,
    enableServiceWorker: true,
  },

  // Advanced features
  advanced: {
    enableBulkOperations: true,
    enableAnalytics: true,
    enableAdvancedGrid: true,
    enableAiIntegration: true,
  },

  // Experimental features
  experimental: {
    enableWebRTC: false,
    enableOfflineSync: false,
    enableAdvancedAnimations: true,
  },
} as const;