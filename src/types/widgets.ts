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
  | 'ai-oracle';

export type TabAssignment = 'STAT' | 'INV' | 'DATA' | 'MAP' | 'RADIO';

export interface BaseWidget {
  id: string;
  type: WidgetType;
  title: string;
  collapsed: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  tabAssignment: TabAssignment;
  settings: Record<string, any>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetDefinition {
  type: WidgetType;
  title: string;
  description: string;
  category: 'productivity' | 'entertainment' | 'system' | 'data';
  defaultSize: { width: number; height: number };
  defaultSettings: Record<string, any>;
  minSize: { width: number; height: number };
  maxSize?: { width: number; height: number };
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
  personality: 'codsworth' | 'nick-valentine' | 'curie' | 'dogmeat';
  autoGreet: boolean;
  responseSpeed: 'fast' | 'normal' | 'slow';
  showStatus: boolean;
}