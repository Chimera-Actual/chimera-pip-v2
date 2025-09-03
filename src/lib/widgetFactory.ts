import { BaseWidget, WidgetType, WidgetDefinition, TabAssignment, WidgetSettings } from '@/types/widgets';

export class WidgetFactory {
  private static widgetDefinitions: Record<WidgetType, WidgetDefinition> = {
    'character-profile': {
      type: 'character-profile',
      title: 'Character Profile',
      description: 'Display vault dweller information including level, karma, and experience',
      category: 'productivity',
      defaultSize: { width: 400, height: 300 },
      minSize: { width: 300, height: 200 },
      resizable: true,
      defaultTab: 'STAT',
      defaultSettings: {
        showLevel: true,
        showKarma: true,
        showVaultNumber: true,
        showLastLogin: false,
        showExperience: true
      }
    },
    'special-stats': {
      type: 'special-stats',
      title: 'S.P.E.C.I.A.L.',
      description: 'Interactive display of your character attributes',
      category: 'productivity',
      defaultSize: { width: 350, height: 400 },
      minSize: { width: 280, height: 300 },
      resizable: true,
      defaultTab: 'STAT',
      defaultSettings: {
        showProgressBars: true,
        showTooltips: true,
        allowStatAdjustment: false,
        displayStyle: 'detailed'
      }
    },
    'system-monitor': {
      type: 'system-monitor',
      title: 'System Monitor',
      description: 'Real-time system performance metrics and status',
      category: 'system',
      defaultSize: { width: 300, height: 250 },
      minSize: { width: 250, height: 180 },
      resizable: true,
      defaultTab: 'STAT',
      defaultSettings: {
        refreshRate: 5000,
        showGraphs: true,
        monitoredMetrics: ['cpu', 'memory', 'network', 'storage'],
        alertThresholds: { cpu: 80, memory: 85, network: 90, storage: 90 }
      }
    },
    'weather-station': {
      type: 'weather-station',
      title: 'Environmental Monitor',
      description: 'Environmental data including temperature, humidity, and radiation levels',
      category: 'data',
      defaultSize: { width: 400, height: 200 },
      minSize: { width: 300, height: 150 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {
        temperatureUnit: 'F',
        showRadiation: true,
        showAirQuality: true,
        autoRefresh: true,
        refreshInterval: 30000
      }
    },
    'news-terminal': {
      type: 'news-terminal',
      title: 'News Terminal',
      description: 'Latest news updates and communications feed',
      category: 'data',
      defaultSize: { width: 450, height: 350 },
      minSize: { width: 320, height: 250 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {
        maxItems: 5,
        autoRefresh: true,
        refreshInterval: 60000,
        categories: ['tech', 'science', 'general'],
        showTimestamps: true
      }
    },
    'calendar-mission': {
      type: 'calendar-mission',
      title: 'Mission Control',
      description: 'Task management and mission scheduling interface',
      category: 'productivity',
      defaultSize: { width: 350, height: 300 },
      minSize: { width: 280, height: 200 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {
        showCompleted: false,
        maxTasks: 10,
        priorityFilter: ['high', 'medium', 'low'],
        showDueDates: true
      }
    },
    'ai-oracle': {
      type: 'ai-oracle',
      title: 'AI Oracle',
      description: 'Intelligent assistant interface and interaction panel',
      category: 'entertainment',
      defaultSize: { width: 350, height: 300 },
      minSize: { width: 280, height: 200 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {
        personality: 'codsworth',
        autoGreet: true,
        responseSpeed: 'normal',
        showStatus: true
      }
    },
    'achievement-gallery': {
      type: 'achievement-gallery',
      title: 'Achievement Gallery',
      description: 'Display unlocked achievements and progress tracking',
      category: 'entertainment',
      defaultSize: { width: 400, height: 300 },
      minSize: { width: 300, height: 200 },
      resizable: true,
      defaultTab: 'STAT',
      defaultSettings: {
        showProgress: true,
        displayMode: 'grid',
        hideUnlocked: false
      }
    },
    'file-explorer': {
      type: 'file-explorer',
      title: 'File Explorer',
      description: 'Browse and manage files and documents',
      category: 'productivity',
      defaultSize: { width: 400, height: 350 },
      minSize: { width: 300, height: 250 },
      resizable: true,
      defaultTab: 'INV',
      defaultSettings: {
        viewMode: 'list',
        showHidden: false,
        sortBy: 'name'
      }
    },
    'secure-vault': {
      type: 'secure-vault',
      title: 'Secure Vault',
      description: 'Encrypted storage for sensitive information',
      category: 'system',
      defaultSize: { width: 350, height: 280 },
      minSize: { width: 280, height: 200 },
      resizable: true,
      defaultTab: 'INV',
      defaultSettings: {
        autoLock: true,
        lockTimeout: 300000,
        showPasswordStrength: true
      }
    },
    'audio-player': {
      type: 'audio-player',
      title: 'Audio Player',
      description: 'Music and audio playback interface',
      category: 'entertainment',
      defaultSize: { width: 350, height: 200 },
      minSize: { width: 250, height: 150 },
      resizable: true,
      defaultTab: 'RADIO',
      defaultSettings: {
        showVisualizer: true,
        autoplay: false,
        repeat: false,
        shuffle: false
      }
    }
  };

  static createWidget(
    type: WidgetType, 
    userId: string, 
    tabAssignment?: TabAssignment,
    overrides?: Partial<BaseWidget>
  ): BaseWidget {
    const definition = this.widgetDefinitions[type];
    if (!definition) {
      throw new Error(`Unknown widget type: ${type}`);
    }

    return {
      id: crypto.randomUUID(),
      type,
      title: definition.title,
      collapsed: false,
      order: 0,
      size: definition.defaultSize,
      tabAssignment: tabAssignment || definition.defaultTab,
      settings: { ...definition.defaultSettings } as WidgetSettings,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static getDefinition(type: WidgetType): WidgetDefinition {
    const definition = this.widgetDefinitions[type];
    if (!definition) {
      throw new Error(`Unknown widget type: ${type}`);
    }
    return definition;
  }

  static getAllDefinitions(): WidgetDefinition[] {
    return Object.values(this.widgetDefinitions);
  }

  static getDefinitionsByCategory(category: 'productivity' | 'entertainment' | 'system' | 'data'): WidgetDefinition[] {
    return Object.values(this.widgetDefinitions).filter(def => def.category === category);
  }

  static getDefinitionsByTab(tab: TabAssignment): WidgetDefinition[] {
    return Object.values(this.widgetDefinitions).filter(def => def.defaultTab === tab);
  }
}