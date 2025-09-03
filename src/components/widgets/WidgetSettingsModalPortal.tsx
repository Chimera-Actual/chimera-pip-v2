import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Save, RotateCcw, AlertCircle, Download, Upload, Copy, Eye, EyeOff, Zap } from 'lucide-react';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { cn } from '@/lib/utils';

interface WidgetSettingsModalProps<T = any> {
  widgetId: string;
  widgetType: string;
  widgetTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: T) => void;
}

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

interface SettingsFieldProps {
  fieldKey: string;
  fieldSchema: WidgetSettingsField;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onTestConnection: (fieldKey: string, endpoint: string) => void;
}

const SettingsField: React.FC<SettingsFieldProps> = ({
  fieldKey,
  fieldSchema,
  value,
  error,
  onChange,
  onTestConnection
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const renderField = () => {
    switch (fieldSchema.type) {
      case 'string':
        return (
          <input
            type="text"
            className={cn(
              "w-full px-3 py-2 rounded-md border bg-pip-bg-secondary/50 text-pip-text-bright border-pip-border",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "placeholder:text-pip-text-muted font-pip-mono text-sm",
              error && "border-destructive focus:ring-destructive"
            )}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={fieldSchema.placeholder}
            required={fieldSchema.required}
          />
        );

      case 'url':
        return (
          <div className="flex gap-2">
            <input
              type="url"
              className={cn(
                "flex-1 px-3 py-2 rounded-md border bg-pip-bg-secondary/50 text-pip-text-bright border-pip-border",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "placeholder:text-pip-text-muted font-pip-mono text-sm",
                error && "border-destructive focus:ring-destructive"
              )}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={fieldSchema.placeholder}
              required={fieldSchema.required}
            />
            {value && (
              <button
                type="button"
                className="px-3 py-2 bg-primary/20 text-primary border border-primary/30 rounded-md hover:bg-primary/30 transition-colors text-sm flex items-center gap-1"
                onClick={() => onTestConnection(fieldKey, value)}
              >
                <Zap className="w-3 h-3" />
                Test
              </button>
            )}
          </div>
        );

      case 'apikey':
        return (
          <div className="flex gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              className={cn(
                "flex-1 px-3 py-2 rounded-md border bg-pip-bg-secondary/50 text-pip-text-bright border-pip-border",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "placeholder:text-pip-text-muted font-pip-mono text-sm",
                error && "border-destructive focus:ring-destructive"
              )}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={fieldSchema.placeholder || "Enter API key..."}
              required={fieldSchema.required}
            />
            <button
              type="button"
              className="px-3 py-2 bg-pip-bg-tertiary text-pip-text-secondary border border-pip-border rounded-md hover:bg-pip-bg-secondary transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            className={cn(
              "w-full px-3 py-2 rounded-md border bg-pip-bg-secondary/50 text-pip-text-bright border-pip-border",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "placeholder:text-pip-text-muted font-pip-mono text-sm resize-vertical",
              error && "border-destructive focus:ring-destructive"
            )}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={fieldSchema.placeholder}
            required={fieldSchema.required}
            rows={4}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className={cn(
              "w-full px-3 py-2 rounded-md border bg-pip-bg-secondary/50 text-pip-text-bright border-pip-border",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "font-pip-mono text-sm",
              error && "border-destructive focus:ring-destructive"
            )}
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={fieldSchema.validation?.min}
            max={fieldSchema.validation?.max}
            required={fieldSchema.required}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div className="relative">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
              />
              <div className={cn(
                "w-12 h-6 rounded-full border transition-all duration-200",
                value 
                  ? "bg-primary/20 border-primary" 
                  : "bg-pip-bg-secondary border-pip-border"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full transition-all duration-200 border",
                  value 
                    ? "translate-x-6 bg-primary border-primary shadow-[0_0_8px_currentColor]" 
                    : "translate-x-0 bg-pip-text-muted border-pip-border"
                )} />
              </div>
            </div>
            <span className="text-sm text-pip-text-secondary font-pip-mono uppercase tracking-wide">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            className={cn(
              "w-full px-3 py-2 rounded-md border bg-pip-bg-secondary/50 text-pip-text-bright border-pip-border",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "font-pip-mono text-sm",
              error && "border-destructive focus:ring-destructive"
            )}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={fieldSchema.required}
          >
            <option value="">Select an option...</option>
            {fieldSchema.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="max-h-48 overflow-y-auto p-3 bg-pip-bg-tertiary/30 border border-pip-border rounded-md space-y-2">
            {fieldSchema.options?.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-primary/10 p-1 rounded">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: any) => v !== option.value);
                    onChange(newValues);
                  }}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 h-4 border rounded flex items-center justify-center text-xs",
                  (value || []).includes(option.value)
                    ? "bg-primary border-primary text-pip-bg-primary"
                    : "border-pip-border"
                )}>
                  {(value || []).includes(option.value) && '✓'}
                </div>
                <span className="text-sm text-pip-text-bright">{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
            Unsupported field type: {fieldSchema.type}
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-2", error && "space-y-3")}>
      <label className="flex items-center gap-1 text-sm font-semibold text-primary uppercase tracking-wide pip-text-glow">
        {fieldSchema.label}
        {fieldSchema.required && <span className="text-destructive">*</span>}
      </label>
      
      {fieldSchema.description && (
        <p className="text-xs text-pip-text-muted leading-relaxed font-pip-mono">
          {fieldSchema.description}
        </p>
      )}
      
      {renderField()}
      
      {error && (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
};

export const WidgetSettingsModal = <T extends Record<string, any>>({
  widgetId,
  widgetType,
  widgetTitle,
  isOpen,
  onClose,
  onSettingsChange
}: WidgetSettingsModalProps<T>) => {
  const {
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
  } = useWidgetSettings<T>(widgetId, widgetType);

  const [activeGroup, setActiveGroup] = useState<string>('general');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  const handleSave = async () => {
    if (await saveSettings()) {
      onSettingsChange?.(settings);
      onClose();
    }
  };

  const handleTestConnection = async (fieldKey: string, endpoint: string) => {
    try {
      const response = await fetch(endpoint, { method: 'HEAD' });
      if (response.ok) {
        alert('Connection successful!');
      } else {
        alert('Connection failed: ' + response.status);
      }
    } catch (error) {
      alert('Connection failed: ' + error);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group settings by their group property
  const groupedSettings = schema ? Object.entries(schema.settingsSchema).reduce(
    (groups, [key, fieldSchema]) => {
      const group = fieldSchema.group || 'general';
      if (!groups[group]) groups[group] = [];
      groups[group].push([key, fieldSchema]);
      return groups;
    },
    {} as Record<string, Array<[string, any]>>
  ) : {};

  const availableGroups = Object.keys(groupedSettings);
  const filteredGroups = showAdvanced 
    ? availableGroups 
    : availableGroups.filter(g => g !== 'advanced');

  const tabLabels = {
    general: 'GENERAL',
    display: 'DISPLAY', 
    api: 'API',
    advanced: 'ADVANCED'
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal - Centered with responsive width */}
      <div className="relative w-full max-w-[800px] max-h-[85vh] md:w-[800px] rounded-lg bg-pip-bg-primary/95 border-2 border-primary/30 flex flex-col backdrop-blur-md shadow-2xl shadow-primary/20 pip-glow pip-border-glow animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary pip-glow" />
            <h3 className="text-lg font-bold text-primary uppercase tracking-wide pip-text-glow font-pip-display">
              {widgetTitle} - Settings
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1 text-xs bg-pip-bg-secondary text-pip-text-bright border border-pip-border rounded hover:bg-pip-bg-tertiary transition-colors uppercase tracking-wide font-pip-mono"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Basic' : 'Advanced'}
            </button>
            <button 
              className="p-2 text-destructive hover:bg-destructive/20 border border-destructive/30 rounded transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {filteredGroups.length > 1 && (
          <div className="flex border-b border-pip-border bg-pip-bg-secondary/30">
            {filteredGroups.map((group) => (
              <button
                key={group}
                className={cn(
                  "px-4 py-3 text-sm font-pip-mono uppercase tracking-wide transition-colors border-b-2",
                  activeGroup === group
                    ? "text-primary border-primary bg-primary/10 pip-text-glow"
                    : "text-pip-text-secondary border-transparent hover:text-pip-text-bright hover:bg-pip-bg-tertiary/50"
                )}
                onClick={() => setActiveGroup(group)}
              >
                {tabLabels[group as keyof typeof tabLabels] || group}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-primary">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin pip-glow" />
              <span className="text-sm font-pip-mono uppercase tracking-wide pip-text-glow">
                Loading Settings...
              </span>
            </div>
          ) : (
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
              <div className="space-y-6">
                {groupedSettings[activeGroup]?.map(([key, fieldSchema]) => (
                  <SettingsField
                    key={key}
                    fieldKey={key}
                    fieldSchema={fieldSchema}
                    value={settingsOverrides[key] ?? settings[key]}
                    error={errors[key]}
                    onChange={(value) => updateSetting(key, value)}
                    onTestConnection={handleTestConnection}
                  />
                ))}
                
                {!groupedSettings[activeGroup]?.length && (
                  <div className="text-center py-8 text-pip-text-muted font-pip-mono">
                    No settings available for this category
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed button bar */}
        <div className="flex items-center justify-between p-5 border-t border-pip-border bg-pip-bg-secondary/30">
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm bg-pip-bg-tertiary text-pip-text-secondary border border-pip-border rounded hover:bg-pip-bg-secondary transition-colors font-pip-mono uppercase tracking-wide"
              onClick={resetToDefaults}
              disabled={isLoading}
            >
              Reset
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm bg-pip-bg-tertiary text-pip-text-secondary border border-pip-border rounded hover:bg-pip-bg-secondary transition-colors font-pip-mono uppercase tracking-wide"
              onClick={onClose}
            >
              Cancel
            </button>
            
            <button
              className={cn(
                "px-6 py-2 text-sm rounded font-pip-mono uppercase tracking-wide transition-colors",
                isDirty
                  ? "bg-primary text-pip-bg-primary border border-primary hover:bg-primary/80 pip-glow shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                  : "bg-pip-bg-tertiary text-pip-text-muted border border-pip-border cursor-not-allowed"
              )}
              onClick={handleSave}
              disabled={!isDirty || isLoading}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};