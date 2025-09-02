import React, { useState } from 'react';
import { Settings, X, Save, RotateCcw, AlertCircle, AlertTriangle, Download, Upload, Copy, Eye, EyeOff, Zap } from 'lucide-react';
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
              "w-full px-3 py-2 rounded-md border border-muted-foreground/20 bg-background/50 text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "placeholder:text-muted-foreground font-mono text-sm",
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
                "flex-1 px-3 py-2 rounded-md border border-muted-foreground/20 bg-background/50 text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "placeholder:text-muted-foreground font-mono text-sm",
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
                "flex-1 px-3 py-2 rounded-md border border-muted-foreground/20 bg-background/50 text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "placeholder:text-muted-foreground font-mono text-sm",
                error && "border-destructive focus:ring-destructive"
              )}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={fieldSchema.placeholder || "Enter API key..."}
              required={fieldSchema.required}
            />
            <button
              type="button"
              className="px-3 py-2 bg-muted/50 text-muted-foreground border border-muted-foreground/20 rounded-md hover:bg-muted transition-colors"
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
              "w-full px-3 py-2 rounded-md border border-muted-foreground/20 bg-background/50 text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "placeholder:text-muted-foreground font-mono text-sm resize-vertical",
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
              "w-full px-3 py-2 rounded-md border border-muted-foreground/20 bg-background/50 text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "font-mono text-sm",
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
                  : "bg-background/50 border-muted-foreground/20"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full transition-all duration-200 border",
                  value 
                    ? "translate-x-6 bg-primary border-primary shadow-[0_0_8px_currentColor]" 
                    : "translate-x-0 bg-muted-foreground/50 border-muted-foreground/20"
                )} />
              </div>
            </div>
            <span className="text-sm text-muted-foreground uppercase tracking-wide">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            className={cn(
              "w-full px-3 py-2 rounded-md border border-muted-foreground/20 bg-background/50 text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "font-mono text-sm",
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
          <div className="max-h-48 overflow-y-auto p-3 bg-background/30 border border-muted-foreground/20 rounded-md space-y-2">
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
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}>
                  {(value || []).includes(option.value) && '✓'}
                </div>
                <span className="text-sm text-foreground">{option.label}</span>
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
      <label className="flex items-center gap-1 text-sm font-semibold text-primary uppercase tracking-wide">
        {fieldSchema.label}
        {fieldSchema.required && <span className="text-destructive">*</span>}
      </label>
      
      {fieldSchema.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">
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

interface ImportExportPanelProps {
  onExport: () => string;
  onImport: (settingsJson: string) => boolean;
  onClose: () => void;
}

const ImportExportPanel: React.FC<ImportExportPanelProps> = ({
  onExport,
  onImport,
  onClose
}) => {
  const [importText, setImportText] = useState('');
  const [exportText, setExportText] = useState('');

  const handleExport = () => {
    const exported = onExport();
    setExportText(exported);
  };

  const handleImport = () => {
    if (onImport(importText)) {
      alert('Settings imported successfully!');
      onClose();
    } else {
      alert('Failed to import settings. Please check the JSON format.');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-base font-semibold text-primary uppercase tracking-wide">Export Settings</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Export current settings to share or backup
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="px-3 py-2 bg-secondary text-secondary-foreground border border-secondary/30 rounded-md hover:bg-secondary/80 transition-colors text-sm flex items-center gap-2"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Generate Export
          </button>
        </div>
        {exportText && (
          <div className="space-y-2">
            <textarea
              className="w-full px-3 py-2 rounded-md border border-muted-foreground/20 bg-background/50 text-foreground font-mono text-xs resize-vertical"
              value={exportText}
              readOnly
              rows={8}
            />
            <button 
              className="px-3 py-2 bg-secondary text-secondary-foreground border border-secondary/30 rounded-md hover:bg-secondary/80 transition-colors text-sm flex items-center gap-2"
              onClick={() => copyToClipboard(exportText)}
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-base font-semibold text-primary uppercase tracking-wide">Import Settings</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Paste exported settings JSON to restore configuration
          </p>
        </div>
        <textarea
          className="w-full px-3 py-2 rounded-md border border-muted-foreground/20 bg-background/50 text-foreground font-mono text-xs resize-vertical"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste exported settings JSON here..."
          rows={8}
        />
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground border border-primary/30 rounded-md hover:bg-primary/80 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
            onClick={handleImport}
            disabled={!importText.trim()}
          >
            <Upload className="w-4 h-4" />
            Import Settings
          </button>
        </div>
      </div>
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

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal - Centered with fixed responsive width */}
      <div className="relative w-full max-w-4xl max-h-[85vh] md:max-w-[800px] rounded-lg bg-background/95 border-2 border-primary/30 flex flex-col backdrop-blur-md shadow-2xl shadow-primary/20 pip-glow pip-border-glow">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary pip-glow" />
            <h3 className="text-lg font-bold text-primary uppercase tracking-wide pip-text-glow">
              {widgetTitle} - Settings
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1 text-xs bg-secondary text-secondary-foreground border border-secondary/30 rounded hover:bg-secondary/80 transition-colors uppercase tracking-wide"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Basic' : 'Advanced'}
            </button>
            <button 
              className="px-3 py-1 text-xs bg-secondary text-secondary-foreground border border-secondary/30 rounded hover:bg-secondary/80 transition-colors uppercase tracking-wide"
              onClick={() => setShowImportExport(!showImportExport)}
            >
              Import/Export
            </button>
            <button 
              className="p-2 text-destructive hover:bg-destructive/20 border border-destructive/30 rounded transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-primary">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-sm uppercase tracking-wide">Loading settings...</span>
            </div>
          ) : showImportExport ? (
            <ImportExportPanel
              onExport={exportSettings}
              onImport={importSettings}
              onClose={() => setShowImportExport(false)}
            />
          ) : (
            <div className="h-full flex flex-col">
              {/* Group Navigation */}
              {filteredGroups.length > 1 && (
                <div className="flex border-b border-primary/20 bg-background/40">
                  {filteredGroups.map(groupId => (
                    <button
                      key={groupId}
                      className={cn(
                        "px-5 py-3 text-sm font-medium transition-all uppercase tracking-wide",
                        activeGroup === groupId
                          ? "text-primary border-b-2 border-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                      onClick={() => setActiveGroup(groupId)}
                    >
                      {groupId}
                    </button>
                  ))}
                </div>
              )}

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredGroups.map(groupId => (
                  <div 
                    key={groupId} 
                    className={cn(
                      "space-y-6",
                      activeGroup === groupId ? "block" : "hidden"
                    )}
                  >
                    {groupedSettings[groupId]?.map(([fieldKey, fieldSchema]) => (
                      <SettingsField
                        key={fieldKey}
                        fieldKey={fieldKey}
                        fieldSchema={fieldSchema}
                        value={settings[fieldKey]}
                        error={errors[fieldKey]}
                        onChange={(value) => updateSetting(fieldKey as keyof T, value)}
                        onTestConnection={handleTestConnection}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-primary/20 bg-background/40">
          <div className="flex items-center gap-4 text-xs">
            {isDirty && (
              <div className="flex items-center gap-1 text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span className="uppercase tracking-wide">Unsaved changes</span>
              </div>
            )}
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span className="uppercase tracking-wide">{Object.keys(errors).length} error(s)</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 bg-secondary text-secondary-foreground border border-secondary/30 rounded hover:bg-secondary/80 transition-colors text-sm flex items-center gap-2 uppercase tracking-wide"
              onClick={resetToDefaults}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button 
              className="px-4 py-2 bg-secondary text-secondary-foreground border border-secondary/30 rounded hover:bg-secondary/80 transition-colors text-sm uppercase tracking-wide"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground border border-primary/30 rounded hover:bg-primary/80 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 uppercase tracking-wide"
              onClick={handleSave}
              disabled={Object.keys(errors).length > 0}
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};