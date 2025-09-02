// Enhanced Tab Management Type Definitions for Chimera-PIP 4000 mk 2

export interface TabConfiguration {
  id: string;
  name: string;
  icon: string; // Icon name or custom icon path
  description: string;
  color?: string; // Optional accent color
  position: number; // Tab order
  isDefault: boolean; // Core Pip-Boy tabs (STAT, INV, DATA, MAP, RADIO)
  isCustom: boolean; // User-created tabs
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetTag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  isDefault: boolean;
  isCustom: boolean;
  userId?: string;
  usageCount: number;
  createdAt: Date;
}

export interface WidgetCatalogItem {
  id: string;
  widgetType: string;
  name: string;
  description: string;
  icon: string;
  tags: string[]; // Array of tag IDs
  category: 'productivity' | 'entertainment' | 'system' | 'communication' | 'custom';
  featured: boolean;
  isDefault: boolean;
  previewImage?: string;
  defaultSettings: Record<string, any>;
  requiredPermissions?: string[];
}

export interface TabManagerState {
  tabs: TabConfiguration[];
  activeTab: string;
  reorderMode: boolean;
  editingTab: string | null;
}

export interface TagManagerState {
  tags: WidgetTag[];
  selectedTags: string[];
  isLoading: boolean;
  error: string | null;
}

export interface WidgetCatalogState {
  widgets: WidgetCatalogItem[];
  filteredWidgets: WidgetCatalogItem[];
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'name' | 'category' | 'popular';
  viewMode: 'grid' | 'list';
}