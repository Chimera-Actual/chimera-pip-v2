export { StandardWidgetSettingsModal } from './StandardWidgetSettingsModal';
export { SettingsSection } from './SettingsSection';
export { EnhancedSettingsField } from './EnhancedSettingsField';
export { ImportExportSection } from './ImportExportSection';

export type { 
  StandardWidgetSettingsModalProps 
} from './StandardWidgetSettingsModal';

// Widget settings field types for consistency
export interface WidgetSettingsField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'url' | 'apikey' | 'multiselect';
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
  group?: 'general' | 'display' | 'api' | 'advanced';
}

// Standard settings groups
export const SETTINGS_GROUPS = {
  INSTANCE: 'instance',
  GENERAL: 'general',
  DISPLAY: 'display',
  API: 'api',
  ADVANCED: 'advanced'
} as const;

export type SettingsGroupType = typeof SETTINGS_GROUPS[keyof typeof SETTINGS_GROUPS];