import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from 'lodash';
import { reportError } from '@/lib/errorReporting';
import { INTERACTION_DELAYS, ERROR_MESSAGES } from '@/lib/constants';
import { useIntelligentSync } from './useIntelligentSync';

// Fallback schemas for common widget types
const getFallbackSchema = <T extends Record<string, any>>(widgetType: string): WidgetSettingsSchema<T> => {
  const commonSchema = {
    title: { type: 'string' as const, label: 'Title', required: true, group: 'general' as const },
    refreshInterval: { type: 'number' as const, label: 'Refresh Interval (minutes)', validation: { min: 1, max: 60 }, group: 'general' as const },
  };

  const fallbacks: Record<string, any> = {
    weather: {
      ...commonSchema,
      location: { type: 'string' as const, label: 'Location', required: true, placeholder: 'Enter city name', group: 'general' as const },
      units: { type: 'select' as const, label: 'Units', options: [{ value: 'metric', label: 'Celsius' }, { value: 'imperial', label: 'Fahrenheit' }], group: 'display' as const },
    },
    terminal: {
      ...commonSchema,
      prompt: { type: 'string' as const, label: 'Prompt', placeholder: '$ ', group: 'display' as const },
      theme: { type: 'select' as const, label: 'Terminal Theme', options: [{ value: 'green', label: 'Green' }, { value: 'amber', label: 'Amber' }], group: 'display' as const },
    },
    default: commonSchema
  };

  const schema = fallbacks[widgetType] || fallbacks.default;
  const defaultSettings: Record<string, any> = Object.keys(schema).reduce((acc, key) => {
    acc[key] = schema[key].type === 'boolean' ? false : schema[key].type === 'number' ? 5 : '';
    return acc;
  }, {});

  return {
    widgetType,
    schemaVersion: 1,
    defaultSettings: defaultSettings as T,
    settingsSchema: schema as Record<keyof T, WidgetSettingsField>
  };
};

interface WidgetSettingsField {
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

interface WidgetSettingsSchema<T = Record<string, any>> {
  widgetType: string;
  schemaVersion: number;
  defaultSettings: T;
  settingsSchema: Record<keyof T, WidgetSettingsField>;
}

interface WidgetInstanceSettings {
  id: string;
  widgetId: string;
  userId: string;
  widgetType: string;
  settingsOverrides: Record<string, any>;
  settingsMerged: Record<string, any>;
  lastValidatedAt?: string;
  validationErrors?: Record<string, string>;
}

interface UseWidgetSettingsReturn<T> {
  settings: T;
  settingsOverrides: Partial<T>;
  schema: WidgetSettingsSchema<T> | null;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
  updateSetting: (key: keyof T, value: any) => void;
  resetToDefaults: () => Promise<void>;
  saveSettings: () => Promise<boolean>;
  validateSettings: () => boolean;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

export function useWidgetSettings<T extends Record<string, any>>(
  widgetId: string,
  widgetType: string
): UseWidgetSettingsReturn<T> {
  const { user } = useAuth();
  const [schema, setSchema] = useState<WidgetSettingsSchema<T> | null>(null);
  const [settings, setSettings] = useState<T>({} as T);
  const [settingsOverrides, setSettingsOverrides] = useState<Partial<T>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Intelligent sync for widget settings
  const { sync: syncSettings, initializeSync } = useIntelligentSync(
    'widget_instance_settings', 
    widgetId, 
    {
      delay: INTERACTION_DELAYS.DEBOUNCE_SYNC,
      compareDepth: true
    }
  );

  // Load settings schema and instance data
  useEffect(() => {
    const loadWidgetSettings = async () => {
      if (!widgetId || !user || !widgetType) return;
      
      setIsLoading(true);
      try {
        // Load settings schema for widget type
        const { data: schemaData, error: schemaError } = await supabase
          .from('widget_settings_schemas')
          .select('*')
          .eq('widget_type', widgetType)
          .single();

        // Handle schema loading with fallback to defaults
        let parsedSchema: WidgetSettingsSchema<T>;
        
        if (schemaError || !schemaData) {
          console.warn('Schema load error, using fallback:', schemaError);
          // Fallback schema for common widget types
          const fallbackSchemas = getFallbackSchema<T>(widgetType);
          parsedSchema = fallbackSchemas;
        } else {
          parsedSchema = {
            widgetType: schemaData.widget_type,
            schemaVersion: schemaData.schema_version,
            defaultSettings: schemaData.default_settings as T,
            settingsSchema: schemaData.settings_schema as Record<keyof T, WidgetSettingsField>
          };
        }
        
        setSchema(parsedSchema);
        
        // Load instance settings or create with defaults
        const { data: instanceData } = await supabase
          .from('widget_instance_settings')
          .select('*')
          .eq('widget_id', widgetId)
          .eq('user_id', user.id)
          .single();

        if (instanceData) {
          setSettings(instanceData.settings_merged as T);
          setSettingsOverrides(instanceData.settings_overrides as Partial<T>);
          
          // Initialize intelligent sync with current data
          initializeSync({
            widget_config: { settings: instanceData.settings_merged as T, collapsed: false },
            settings_overrides: instanceData.settings_overrides as Partial<T>,
            settings_merged: instanceData.settings_merged as T
          });
        } else {
          // Create new instance with defaults
          const defaultSettings = parsedSchema.defaultSettings;
          setSettings(defaultSettings);
          setSettingsOverrides({});
          
          // Initialize sync for new widget
          initializeSync({
            widget_config: { settings: defaultSettings, collapsed: false },
            settings_overrides: {},
            settings_merged: defaultSettings
          });
          
          await supabase
            .from('widget_instance_settings')
            .insert({
              widget_id: widgetId,
              user_id: user.id,
              widget_type: widgetType,
              settings_overrides: {},
              settings_merged: defaultSettings
            });
        }
      } catch (error) {
        console.error('Failed to load widget settings:', error);
        reportError(
          'Widget settings load failed',
          {
            widgetId,
            userId: user.id,
            component: 'useWidgetSettings',
            action: 'loadWidgetSettings'
          },
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadWidgetSettings();
  }, [widgetId, widgetType, user]);

  const updateSetting = useCallback((key: keyof T, value: any) => {
    const newOverrides = { ...settingsOverrides, [key]: value };
    const newSettings = { ...settings, [key]: value };
    
    setSettingsOverrides(newOverrides);
    setSettings(newSettings);
    setIsDirty(true);
    
    // Intelligent sync - only syncs if data actually changed
    syncSettings({
      widget_config: { settings: newSettings, collapsed: false },
      settings_overrides: newOverrides,
      settings_merged: newSettings
    });
    
    // Clear validation error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key as string];
      return newErrors;
    });
  }, [settingsOverrides, settings, syncSettings]);

  const validateSettings = useCallback(() => {
    if (!schema) return false;
    
    const validationErrors: Record<string, string> = {};
    
    Object.entries(schema.settingsSchema).forEach(([fieldKey, fieldSchema]) => {
      const value = settings[fieldKey];
      
      // Required field validation
      if (fieldSchema.required && (value === undefined || value === null || value === '')) {
        validationErrors[fieldKey] = `${fieldSchema.label} is required`;
        return;
      }
      
      // Type-specific validation
      if (value !== undefined && value !== null && value !== '') {
        switch (fieldSchema.type) {
          case 'url':
            try {
              new URL(value);
            } catch {
              validationErrors[fieldKey] = 'Must be a valid URL';
            }
            break;
          case 'number':
            const numValue = Number(value);
            if (isNaN(numValue)) {
              validationErrors[fieldKey] = 'Must be a valid number';
            } else {
              if (fieldSchema.validation?.min !== undefined && numValue < fieldSchema.validation.min) {
                validationErrors[fieldKey] = `Must be at least ${fieldSchema.validation.min}`;
              }
              if (fieldSchema.validation?.max !== undefined && numValue > fieldSchema.validation.max) {
                validationErrors[fieldKey] = `Must be at most ${fieldSchema.validation.max}`;
              }
            }
            break;
        }
      }
    });
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [settings, schema]);

  const saveSettings = useCallback(async () => {
    if (!validateSettings()) return false;
    
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('widget_instance_settings')
        .upsert({
          widget_id: widgetId,
          user_id: user.id,
          widget_type: widgetType,
          settings_overrides: settingsOverrides,
          settings_merged: settings,
          last_validated_at: new Date().toISOString(),
          validation_errors: null,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      reportError(
        'Widget settings save failed',
        {
          widgetId,
          userId: user.id,
          component: 'useWidgetSettings',
          action: 'saveSettings'
        },
        error
      );
      return false;
    }
  }, [widgetId, user, widgetType, settings, settingsOverrides, validateSettings]);

  const resetToDefaults = useCallback(async () => {
    if (schema) {
      setSettings(schema.defaultSettings);
      setSettingsOverrides({});
      setIsDirty(true);
      setErrors({});
    }
  }, [schema]);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settingsOverrides, null, 2);
  }, [settingsOverrides]);

  const importSettings = useCallback((settingsJson: string) => {
    try {
      const imported = JSON.parse(settingsJson);
      if (schema) {
        const merged = { ...schema.defaultSettings, ...imported };
        setSettings(merged);
        setSettingsOverrides(imported);
        setIsDirty(true);
        setErrors({});
      }
      return true;
    } catch {
      return false;
    }
  }, [schema]);

  return {
    settings,
    settingsOverrides,
    schema,
    isLoading,
    errors,
    isDirty,
    updateSetting,
    resetToDefaults,
    saveSettings,
    validateSettings,
    exportSettings,
    importSettings
  };
}