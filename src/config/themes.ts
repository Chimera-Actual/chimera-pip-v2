// Theme Configuration
export const themes = {
  default: 'green',
  
  available: [
    'green',
    'amber', 
    'blue',
    'red',
    'white',
  ] as const,

  settings: {
    enableSystemTheme: true,
    enableAutoSwitch: false,
    persistThemeChoice: true,
  },

  // Theme-specific configurations
  themeConfigs: {
    green: {
      name: 'Terminal Green',
      description: 'Classic Pip-Boy terminal green',
      primaryColor: 'hsl(120, 100%, 50%)',
    },
    amber: {
      name: 'Amber Alert', 
      description: 'Warm amber terminal',
      primaryColor: 'hsl(45, 100%, 50%)',
    },
    blue: {
      name: 'Azure Tech',
      description: 'Cool blue interface',
      primaryColor: 'hsl(220, 100%, 50%)',
    },
    red: {
      name: 'Alert Red',
      description: 'High-alert red theme',
      primaryColor: 'hsl(0, 100%, 50%)',
    },
    white: {
      name: 'Clean White',
      description: 'Minimalist white theme',
      primaryColor: 'hsl(0, 0%, 20%)',
    },
  },
} as const;