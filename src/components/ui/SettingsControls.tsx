import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  description,
  children,
}) => (
  <div className="space-y-4">
    {title && (
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-pip-text-bright">{title}</h4>
        {description && (
          <p className="text-xs text-pip-text-muted">{description}</p>
        )}
      </div>
    )}
    <div className="space-y-3 pl-0">
      {children}
    </div>
  </div>
);

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}) => (
  <div className="flex items-center justify-between space-x-4">
    <div className="space-y-1 flex-1">
      <Label className="text-sm text-pip-text-bright">{label}</Label>
      {description && (
        <p className="text-xs text-pip-text-muted">{description}</p>
      )}
    </div>
    <Switch 
      checked={checked} 
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  </div>
);

interface SettingsInputProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
}

export const SettingsInput: React.FC<SettingsInputProps> = ({
  label,
  description,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
}) => (
  <div className="space-y-2">
    <Label className="text-sm text-pip-text-bright">{label}</Label>
    {description && (
      <p className="text-xs text-pip-text-muted">{description}</p>
    )}
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="bg-pip-background border-pip-border"
    />
  </div>
);

interface SettingsSelectProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  label,
  description,
  value,
  onChange,
  options,
  disabled,
}) => (
  <div className="space-y-2">
    <Label className="text-sm text-pip-text-bright">{label}</Label>
    {description && (
      <p className="text-xs text-pip-text-muted">{description}</p>
    )}
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="bg-pip-background border-pip-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface SettingsSliderProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  unit?: string;
}

export const SettingsSlider: React.FC<SettingsSliderProps> = ({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  showValue = true,
  unit = '',
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label className="text-sm text-pip-text-bright">{label}</Label>
      {showValue && (
        <span className="text-xs text-pip-text-muted">
          {value}{unit}
        </span>
      )}
    </div>
    {description && (
      <p className="text-xs text-pip-text-muted">{description}</p>
    )}
    <Slider
      value={[value]}
      onValueChange={(values) => onChange(values[0])}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className="w-full"
    />
  </div>
);