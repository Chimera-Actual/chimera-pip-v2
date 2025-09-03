import { BaseWidget, WidgetType, WidgetDefinition, TabAssignment, WidgetSettings } from '@/types/widgets';

export class WidgetFactory {
  private static widgetDefinitions: Record<WidgetType, WidgetDefinition> = {
    'character-profile': {
      type: 'character-profile',
      title: 'Character Profile',
      description: 'Display vault dweller information, level, and basic stats',
      category: 'system',
      defaultSize: { width: 2, height: 2 }, // 2×2 grid cells
      minSize: { width: 2, height: 2 },
      maxSize: { width: 4, height: 3 },
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
      title: 'S.P.E.C.I.A.L. Stats',
      description: 'Interactive display of your character\'s S.P.E.C.I.A.L. attributes',
      category: 'system',
      defaultSize: { width: 3, height: 2 }, // 3×2 grid cells - wide for all 7 stats
      minSize: { width: 2, height: 2 },
      maxSize: { width: 4, height: 3 },
      resizable: true,
      defaultTab: 'STAT',
      defaultSettings: {
        showProgressBars: true,
        showTooltips: true,
        allowStatAdjustment: false,
        displayStyle: 'detailed' as const
      }
    },
    'system-monitor': {
      type: 'system-monitor',
      title: 'System Monitor',
      description: 'Real-time monitoring of Pip-Boy system performance and diagnostics',
      category: 'system',
      defaultSize: { width: 2, height: 2 }, // 2×2 grid cells - good for charts
      minSize: { width: 2, height: 1 },
      maxSize: { width: 4, height: 3 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {
        refreshRate: 5000,
        showGraphs: true,
        monitoredMetrics: ['cpu', 'memory', 'network'],
        alertThresholds: { cpu: 80, memory: 85, network: 90 }
      }
    },
    'weather-station': {
      type: 'weather-station',
      title: 'Weather Station',
      description: 'Environmental monitoring including temperature, radiation, and air quality',
      category: 'data',
      defaultSize: { width: 2, height: 1 }, // 2×1 grid cells - compact weather display
      minSize: { width: 2, height: 1 },
      maxSize: { width: 3, height: 2 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {
        temperatureUnit: 'F' as const,
        showRadiation: true,
        showAirQuality: true,
        autoRefresh: true,
        refreshInterval: 300000
      }
    },
    'news-terminal': {
      type: 'news-terminal',
      title: 'News Terminal',
      description: 'Stay updated with the latest wasteland news and bulletins',
      category: 'data',
      defaultSize: { width: 3, height: 2 }, // 3×2 grid cells - wide for news list
      minSize: { width: 2, height: 2 },
      maxSize: { width: 4, height: 3 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {
        maxItems: 10,
        autoRefresh: true,
        refreshInterval: 600000,
        categories: ['general', 'settlements', 'trade'],
        showTimestamps: true
      }
    },
    'calendar-mission': {
      type: 'calendar-mission',
      title: 'Mission Calendar',
      description: 'Track missions, appointments, and important wasteland events',
      category: 'productivity',
      defaultSize: { width: 2, height: 3 }, // 2×3 grid cells - tall for calendar
      minSize: { width: 2, height: 2 },
      maxSize: { width: 3, height: 4 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {
        showCompleted: false,
        maxTasks: 20,
        priorityFilter: ['high', 'medium'],
        showDueDates: true
      }
    },
    'ai-oracle': {
      type: 'ai-oracle',
      title: 'A.I. Oracle',
      description: 'Advanced artificial intelligence assistant for wasteland guidance',
      category: 'productivity',
      defaultSize: { width: 3, height: 2 }, // 3×2 grid cells - wide for chat
      minSize: { width: 2, height: 2 },
      maxSize: { width: 4, height: 3 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {
        personality: 'codsworth' as const,
        autoGreet: true,
        responseSpeed: 'normal' as const,
        showStatus: true
      }
    },
    'achievement-gallery': {
      type: 'achievement-gallery',
      title: 'Achievement Gallery',
      description: 'Showcase your wasteland accomplishments and trophies',
      category: 'entertainment',
      defaultSize: { width: 2, height: 2 }, // 2×2 grid cells - standard
      minSize: { width: 2, height: 2 },
      maxSize: { width: 4, height: 3 },
      resizable: true,
      defaultTab: 'STAT',
      defaultSettings: {}
    },
    'file-explorer': {
      type: 'file-explorer',
      title: 'File Explorer',
      description: 'Browse and manage your Pip-Boy file system',
      category: 'productivity',
      defaultSize: { width: 3, height: 2 }, // 3×2 grid cells - wide for file list
      minSize: { width: 2, height: 2 },
      maxSize: { width: 4, height: 3 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {}
    },
    'secure-vault': {
      type: 'secure-vault',
      title: 'Secure Vault',
      description: 'Protected storage for sensitive information and credentials',
      category: 'productivity',
      defaultSize: { width: 2, height: 2 }, // 2×2 grid cells - secure and compact
      minSize: { width: 2, height: 2 },
      maxSize: { width: 3, height: 3 },
      resizable: true,
      defaultTab: 'DATA',
      defaultSettings: {}
    },
    'audio-player': {
      type: 'audio-player',
      title: 'Audio Player',
      description: 'Play music and audio files from the wasteland radio stations',
      category: 'entertainment',
      defaultSize: { width: 4, height: 1 }, // 4×1 grid cells - wide player controls
      minSize: { width: 3, height: 1 },
      maxSize: { width: 4, height: 2 },
      resizable: true,
      defaultTab: 'RADIO',
      defaultSettings: {}
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
      gridPosition: {
        row: 0,
        col: 0,
        width: definition.defaultSize.width,
        height: definition.defaultSize.height
      },
      size: {
        width: definition.defaultSize.width * 20, // Convert grid cells to pixels
        height: definition.defaultSize.height * 20
      },
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