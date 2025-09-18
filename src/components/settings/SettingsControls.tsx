import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type {
  SettingsToggleProps,
  SettingsSelectProps,
  SettingsSliderProps,
  SettingsInputProps
} from '@/types/settings';

// Base settings control wrapper
interface SettingsControlWrapperProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const SettingsControlWrapper: React.FC<SettingsControlWrapperProps> = ({
  label,
  description,
  children,
  className
}) => (
  <div className={cn("space-y-3", className)}>
    <div className="space-y-1">
      <Label className="text-sm font-pip-mono text-pip-text-secondary font-medium">
        {label}
      </Label>
      {description && (
        <p className="text-xs text-pip-text-muted font-pip-mono leading-relaxed">
          {description}
        </p>
      )}
    </div>
    <div className="pl-0">
      {children}
    </div>
  </div>
);

// Toggle/Switch Control
export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  value,
  onChange,
  disabled = false,
  className
}) => (
  <SettingsControlWrapper
    label={label}
    description={description}
    className={className}
  >
    <div className="flex items-center space-x-3">
      <Switch
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-[state=checked]:bg-primary/30 data-[state=checked]:border-primary"
      />
      <span className="text-xs font-pip-mono text-pip-text-secondary">
        {value ? 'ENABLED' : 'DISABLED'}
      </span>
    </div>
  </SettingsControlWrapper>
);

// Select/Dropdown Control
export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  label,
  description,
  value,
  onChange,
  options,
  disabled = false,
  className
}) => (
  <SettingsControlWrapper
    label={label}
    description={description}
    className={className}
  >
    <Select
      value={String(value)}
      onValueChange={(val) => onChange(val)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full bg-pip-bg-secondary/50 border-pip-border font-pip-mono text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-pip-bg-primary border-pip-border">
        {options.map((option) => (
          <SelectItem
            key={String(option.value)}
            value={String(option.value)}
            className="font-pip-mono text-xs hover:bg-pip-bg-secondary/50"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </SettingsControlWrapper>
);

// Slider Control
export const SettingsSlider: React.FC<SettingsSliderProps> = ({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  showValue = true,
  disabled = false,
  className
}) => (
  <SettingsControlWrapper
    label={label}
    description={description}
    className={className}
  >
    <div className="space-y-3">
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      
      {showValue && (
        <div className="flex justify-between text-xs font-pip-mono text-pip-text-muted">
          <span>{min}{unit}</span>
          <span className="text-pip-text-secondary font-semibold">
            {value}{unit}
          </span>
          <span>{max}{unit}</span>
        </div>
      )}
    </div>
  </SettingsControlWrapper>
);

// Input Control
export const SettingsInput: React.FC<SettingsInputProps> = ({
  label,
  description,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  className
}) => (
  <SettingsControlWrapper
    label={label}
    description={description}
    className={className}
  >
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="bg-pip-bg-secondary/50 border-pip-border font-pip-mono text-xs"
    />
  </SettingsControlWrapper>
);

// Settings Group Container for organizing related controls
interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  description,
  children,
  className
}) => (
  <div className={cn("space-y-4", className)}>
    {title && (
      <div className="space-y-1">
        <h4 className="text-sm font-pip-mono font-semibold text-pip-text-secondary uppercase tracking-wide">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-pip-text-muted font-pip-mono">
            {description}
          </p>
        )}
      </div>
    )}
    <div className="space-y-6 pl-0">
      {children}
    </div>
  </div>
);