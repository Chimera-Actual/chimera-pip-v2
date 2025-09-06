import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { webhookService } from '@/lib/webhookService';
import { 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Zap, 
  CheckCircle,
  Info,
  Copy,
  RefreshCw
} from 'lucide-react';

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

interface EnhancedSettingsFieldProps {
  fieldKey: string;
  fieldSchema: WidgetSettingsField;
  value: string | number | boolean | string[] | undefined;
  error?: string;
  onChange: (value: string | number | boolean | string[]) => void;
}

export const EnhancedSettingsField: React.FC<EnhancedSettingsFieldProps> = ({
  fieldKey,
  fieldSchema,
  value,
  error,
  onChange
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestConnection = async (endpoint: string) => {
    if (!endpoint) return;
    
    setTestingConnection(true);
    setTestResult(null);
    
    try {
      const response = await webhookService.testConnection(endpoint);
      setTestResult(response.success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setTestingConnection(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const renderField = () => {
    switch (fieldSchema.type) {
      case 'string':
        return (
          <div className="space-y-2">
            <Input
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={fieldSchema.placeholder}
              required={fieldSchema.required}
              className={cn(
                "bg-pip-bg-secondary/50 border-pip-border focus:border-primary font-pip-mono",
                error && "border-destructive focus:border-destructive"
              )}
            />
            {typeof value === 'string' && value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(value)}
                className="text-xs font-pip-mono"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            )}
          </div>
        );

      case 'url':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="url"
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={fieldSchema.placeholder}
                required={fieldSchema.required}
                className={cn(
                  "bg-pip-bg-secondary/50 border-pip-border focus:border-primary font-pip-mono flex-1",
                  error && "border-destructive focus:border-destructive"
                )}
              />
              {value && typeof value === 'string' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(value)}
                  disabled={testingConnection}
                  className={cn(
                    "font-pip-mono text-xs min-w-[80px]",
                    testResult === 'success' && "border-green-500 text-green-500",
                    testResult === 'error' && "border-destructive text-destructive"
                  )}
                >
                  {testingConnection ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Testing...
                    </>
                  ) : testResult === 'success' ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      OK
                    </>
                  ) : testResult === 'error' ? (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 mr-1" />
                      Test
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        );

      case 'apikey':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={fieldSchema.placeholder || "Enter API key..."}
                required={fieldSchema.required}
                className={cn(
                  "bg-pip-bg-secondary/50 border-pip-border focus:border-primary font-pip-mono flex-1",
                  error && "border-destructive focus:border-destructive"
                )}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="font-pip-mono text-xs"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            {typeof value === 'string' && value && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-pip-mono">
                  {value.length} characters
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(value)}
                  className="text-xs font-pip-mono"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={fieldSchema.placeholder}
            required={fieldSchema.required}
            className={cn(
              "bg-pip-bg-secondary/50 border-pip-border focus:border-primary font-pip-mono min-h-[100px] resize-vertical",
              error && "border-destructive focus:border-destructive"
            )}
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={typeof value === 'number' ? value : ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={fieldSchema.validation?.min}
            max={fieldSchema.validation?.max}
            required={fieldSchema.required}
            className={cn(
              "bg-pip-bg-secondary/50 border-pip-border focus:border-primary font-pip-mono",
              error && "border-destructive focus:border-destructive"
            )}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => onChange(checked)}
              className="data-[state=checked]:bg-primary"
            />
            <Label className="text-sm font-pip-mono uppercase tracking-wide">
              {value ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select
            value={typeof value === 'string' ? value : ''}
            onValueChange={(newValue) => onChange(newValue)}
          >
            <SelectTrigger className={cn(
              "bg-pip-bg-secondary/50 border-pip-border focus:border-primary font-pip-mono",
              error && "border-destructive"
            )}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema.options?.map(option => (
                <SelectItem key={option.value} value={option.value} className="font-pip-mono">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div className="max-h-48 overflow-y-auto p-3 bg-pip-bg-secondary/30 border border-pip-border rounded-md space-y-2 pip-scrollbar">
            {fieldSchema.options?.map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 p-2 rounded transition-colors">
                <div className="relative">
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
                    "w-4 h-4 border rounded flex items-center justify-center text-xs font-bold transition-all",
                    arrayValue.includes(option.value)
                      ? "bg-primary border-primary text-primary-foreground pip-glow"
                      : "border-pip-border hover:border-primary"
                  )}>
                    {arrayValue.includes(option.value) && '✓'}
                  </div>
                </div>
                <span className="text-sm font-pip-mono text-pip-text">{option.label}</span>
              </label>
            ))}
            {arrayValue.length > 0 && (
              <div className="pt-2 border-t border-pip-border/30">
                <Badge variant="secondary" className="text-xs font-pip-mono">
                  {arrayValue.length} selected
                </Badge>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm font-pip-mono">
            Unsupported field type: {fieldSchema.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Field Label */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-semibold text-primary uppercase tracking-wide font-pip-mono">
          {fieldSchema.label}
          {fieldSchema.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {fieldSchema.description && (
          <div className="group relative">
            <Info className="h-3 w-3 text-pip-text-muted cursor-help" />
            <div className="absolute left-0 top-5 hidden group-hover:block z-50 max-w-xs p-2 bg-pip-bg-primary border border-pip-border rounded-md shadow-lg">
              <p className="text-xs text-pip-text-muted font-pip-mono leading-relaxed">
                {fieldSchema.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Field Input */}
      {renderField()}

      {/* Field Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive font-pip-mono">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};