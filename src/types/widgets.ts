// Widget System Type Definitions for Chimera-PIP 4000 mk 2

export type WidgetType = 
  | 'character-profile'
  | 'special-stats' 
  | 'system-monitor'
  | 'weather-station'
  | 'achievement-gallery'
  | 'file-explorer'
  | 'secure-vault'
  | 'news-terminal'
  | 'audio-player'
  | 'calendar-mission'
  | 'ai-oracle'
  | 'cryptocurrency'
  | 'terminal';

export type WidgetWidth = 'half' | 'full';

export type TabAssignment = 'STAT' | 'INV' | 'DATA' | 'MAP' | 'RADIO';

export interface BaseWidget {
  id: string;
  type: WidgetType;
  title: string;
  name: string;
  customIcon?: string; // Custom icon override for this widget instance
  collapsed: boolean;
  archived: boolean;
  order: number;
  widgetWidth: WidgetWidth;
  tabAssignment: TabAssignment;
  settings: WidgetSettings;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database interfaces for type safety
export interface WidgetConfigDB {
  title?: string;
  customIcon?: string; // Custom icon for this widget instance
  settings?: Record<string, any>;
}

export interface SizeDB {
  width: number;
  height: number;
}

export interface WidgetDefinition {
  type: WidgetType;
  title: string;
  description: string;
  category: 'productivity' | 'entertainment' | 'system' | 'data';
  defaultWidgetWidth: WidgetWidth;
  defaultSettings: Record<string, any>;
  resizable: boolean;
  defaultTab: TabAssignment;
}

// Widget-specific settings interfaces
export interface CharacterProfileSettings {
  showLevel: boolean;
  showKarma: boolean;
  showVaultNumber: boolean;
  showLastLogin: boolean;
  showExperience: boolean;
}

export interface SpecialStatsSettings {
  showProgressBars: boolean;
  showTooltips: boolean;
  allowStatAdjustment: boolean;
  displayStyle: 'compact' | 'detailed' | 'minimal';
}

export interface SystemMonitorSettings {
  refreshRate: number;
  showGraphs: boolean;
  monitoredMetrics: ('cpu' | 'memory' | 'network' | 'storage')[];
  alertThresholds: Record<string, number>;
}

export interface WeatherStationSettings {
  temperatureUnit: 'F' | 'C';
  showRadiation: boolean;
  showAirQuality: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  location: string;
}

export interface NewsTerminalSettings {
  maxItems: number;
  autoRefresh: boolean;
  refreshInterval: number;
  categories: string[];
  showTimestamps: boolean;
}

export interface CalendarMissionSettings {
  showCompleted: boolean;
  maxTasks: number;
  priorityFilter: string[];
  showDueDates: boolean;
}

export interface AiOracleSettings {
  selectedAgentId?: string;
  fallbackAgentId?: string;
  instanceOverrides?: {
    responseLength?: 'short' | 'medium' | 'long';
    contextAware?: boolean;
    maxTokens?: number;
    temperature?: number;
  };
  conversationSettings?: {
    saveHistory: boolean;
    maxHistoryLength: number;
    autoSummarize: boolean;
  };
  uiPreferences?: {
    showAgentSwitcher: boolean;
    showTokenUsage: boolean;
    compactMode: boolean;
  };
}

// AI Agent interfaces for the multi-agent system
export interface AiAgent {
  id: string;
  userId: string;
  name: string;
  description?: string;
  webhookUrl: string;
  systemMessage?: string;
  modelParameters: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    responseLength?: 'short' | 'medium' | 'long';
  };
  avatarConfig: {
    icon: string;
    color: string;
  };
  isDefault: boolean;
  isShared: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiConversation {
  id: string;
  widgetId: string;
  agentId: string;
  userId: string;
  messages: Array<{
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  metadata: {
    tokenUsage?: number;
    requestCount?: number;
    lastAgentUsed?: string;
    conversationTitle?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CryptocurrencySettings {
  symbols: string[];
  currency: string;
  refreshInterval: number;
  showMarketCap: boolean;
  showVolume: boolean;
}

export type WidgetSettings = 
  | CharacterProfileSettings
  | SpecialStatsSettings
  | SystemMonitorSettings
  | WeatherStationSettings
  | NewsTerminalSettings
  | CalendarMissionSettings
  | AiOracleSettings
  | CryptocurrencySettings
  | Record<string, any>; // For widgets without specific settings