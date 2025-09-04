import { BaseWidget, WidgetType, WidgetDefinition, TabAssignment, WidgetSettings } from '@/types/widgets';

export class WidgetFactory {
  private static widgetDefinitions: Record<WidgetType, WidgetDefinition> = {
    'character-profile': {
      type: 'character-profile',
      title: 'Character Profile',
      description: 'Display vault dweller information, level, and basic stats',
      category: 'system',
      defaultWidgetWidth: 'half',
      resizable: false,
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
      defaultWidgetWidth: 'full',
      resizable: false,
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
      defaultWidgetWidth: 'full',
      resizable: false,
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
      defaultWidgetWidth: 'half',
      resizable: false,
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
      description: 'Real-time vault and wasteland news updates',
      category: 'data',
      defaultWidgetWidth: 'full',
      resizable: false,
      defaultTab: 'DATA',
      defaultSettings: {
        maxItems: 10,
        autoRefresh: true,
        refreshInterval: 60,
        categories: ['security', 'system', 'vault', 'wasteland'],
        showTimestamps: true
      }
    },
    'calendar-mission': {
      type: 'calendar-mission',
      title: 'Mission Calendar',
      description: 'Track missions, appointments, and important wasteland events',
      category: 'productivity',
      defaultWidgetWidth: 'full',
      resizable: false,
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
      defaultWidgetWidth: 'full',
      resizable: false,
      defaultTab: 'DATA',
      defaultSettings: {
        selectedAgentId: undefined,
        fallbackAgentId: undefined,
        instanceOverrides: {
          responseLength: 'medium' as const,
          contextAware: true,
          maxTokens: 1000,
          temperature: 0.7
        },
        conversationSettings: {
          saveHistory: true,
          maxHistoryLength: 50,
          autoSummarize: false
        },
        uiPreferences: {
          showAgentSwitcher: true,
          showTokenUsage: false,
          compactMode: false
        }
      }
    },
    'achievement-gallery': {
      type: 'achievement-gallery',
      title: 'Achievement Gallery',
      description: 'Showcase your wasteland accomplishments and trophies',
      category: 'entertainment',
      defaultWidgetWidth: 'half',
      resizable: false,
      defaultTab: 'STAT',
      defaultSettings: {}
    },
    'file-explorer': {
      type: 'file-explorer',
      title: 'File Explorer',
      description: 'Browse CHIMERA-TEC file system and personal files',
      category: 'productivity',
      defaultWidgetWidth: 'full',
      resizable: false,
      defaultTab: 'DATA',
      defaultSettings: {}
    },
    'secure-vault': {
      type: 'secure-vault',
      title: 'Secure Vault',
      description: 'Protected storage for sensitive information and credentials',
      category: 'productivity',
      defaultWidgetWidth: 'half',
      resizable: false,
      defaultTab: 'DATA',
      defaultSettings: {}
    },
    'audio-player': {
      type: 'audio-player',
      title: 'Audio Player',
      description: 'Play holotapes, radio, and ambient sounds',
      category: 'entertainment',
      defaultWidgetWidth: 'half',
      resizable: false,
      defaultTab: 'RADIO',
      defaultSettings: {}
    },
    'cryptocurrency': {
      type: 'cryptocurrency',
      title: 'Cryptocurrency Tracker',
      description: 'Track cryptocurrency prices and market data',
      category: 'data',
      defaultWidgetWidth: 'half',
      resizable: false,
      defaultTab: 'DATA',
      defaultSettings: {}
    },
    'terminal': {
      type: 'terminal',
      title: 'Terminal',
      description: 'Command-line interface for advanced system operations',
      category: 'system',
      defaultWidgetWidth: 'full',
      resizable: false,
      defaultTab: 'DATA',
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
      archived: false,
      order: 0,
      widgetWidth: definition.defaultWidgetWidth,
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