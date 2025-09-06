import React, { useState, useEffect } from 'react';
import { BaseSettingsModal } from '@/components/ui/BaseSettingsModal';
import { IconPicker } from './IconPicker';
import { Settings, AlertCircle, AlertTriangle, Download, Upload, Copy, Eye, EyeOff, Zap } from 'lucide-react';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { useWidgets } from '@/contexts/WidgetContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { webhookService } from '@/lib/webhookService';
import { AiOracleSettingsModal } from './AiOracleSettingsModal';
import { useWidgetState } from '@/hooks/useWidgetState';
import { StandardWidgetSettingsModal } from './templates/StandardWidgetSettingsModal';

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
  value: string | number | boolean | string[] | undefined;
  error?: string;
  onChange: (value: string | number | boolean | string[]) => void;
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
            value={typeof value === 'string' ? value : ''}
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
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={fieldSchema.placeholder}
              required={fieldSchema.required}
            />
            {value && typeof value === 'string' && (
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
              value={typeof value === 'string' ? value : ''}
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
            value={typeof value === 'string' ? value : ''}
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
            value={typeof value === 'number' ? value : ''}
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
                checked={Boolean(value)}
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
            value={typeof value === 'string' ? value : ''}
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
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div className="max-h-48 overflow-y-auto p-3 bg-background/30 border border-muted-foreground/20 rounded-md space-y-2">
            {fieldSchema.options?.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-primary/10 p-1 rounded">
                <input
                  type="checkbox"
                  checked={arrayValue.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = arrayValue;
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: string) => v !== option.value);
                    onChange(newValues);
                  }}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 h-4 border rounded flex items-center justify-center text-xs",
                  arrayValue.includes(option.value)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}>
                  {arrayValue.includes(option.value) && '✓'}
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
  // Special case: Use AiOracleSettingsModal for ai-oracle widgets
  if (widgetType === 'ai-oracle') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { settings: currentSettings } = useWidgetState(widgetId, {});
    
    return (
      <AiOracleSettingsModal
        isOpen={isOpen}
        onClose={onClose}
        widget={{ 
          id: widgetId, 
          type: widgetType as 'ai-oracle', 
          title: widgetTitle,
          settings: currentSettings
        } as any}
        settings={currentSettings as any}
        onSettingsChange={(newSettings: any) => {
          onSettingsChange?.(newSettings);
        }}
      />
    );
  }

  // For all other widgets, use the new StandardWidgetSettingsModal
  return (
    <StandardWidgetSettingsModal
      widgetId={widgetId}
      widgetType={widgetType}
      widgetTitle={widgetTitle}
      isOpen={isOpen}
      onClose={onClose}
      onSettingsChange={onSettingsChange}
    />
  );
};