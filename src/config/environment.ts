// Environment Configuration
export const environment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // API Configuration
  api: {
    supabaseUrl: 'https://gfvhmzhwiwiehucoseld.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmdmhtemh3aXdpZWh1Y29zZWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MjM5ODUsImV4cCI6MjA3MjM5OTk4NX0.QQr_oAZyF4WB-0QZSnZ75RF2_ZLo7X1lJD5XagsCPCw',
    webhookBaseUrl: 'http://localhost:5678',
  },

  // Monitoring
  monitoring: {
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableAnalytics: !process.env.NODE_ENV || process.env.NODE_ENV === 'production',
  },

  // Debug Settings
  debug: {
    enableConsoleDebug: process.env.NODE_ENV === 'development',
    enableNetworkLogging: process.env.NODE_ENV === 'development',
    enableStateLogging: false,
  },
} as const;