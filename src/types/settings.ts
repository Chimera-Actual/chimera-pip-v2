// Universal Settings System Types

import React from 'react';

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  content: React.ReactNode;
  order?: number;
}

export interface SettingsGroup {
  id: string;
  title: string;
  description?: string;
  sections: SettingsSection[];
  collapsed?: boolean;
}

export interface UniversalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  sections: SettingsSection[];
  onSave?: () => void;
  onReset?: () => void;
  isDirty?: boolean;
  isLoading?: boolean;
  size?: 'default' | 'large' | 'full';
  showSaveButton?: boolean;
  showResetButton?: boolean;
  className?: string;
}

export interface SettingsControlProps {
  label: string;
  description?: string;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  className?: string;
}

export interface SettingsToggleProps extends SettingsControlProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export interface SettingsSelectProps extends SettingsControlProps {
  options: Array<{ value: string | number; label: string }>;
  value: string | number;
  onChange: (value: string | number) => void;
}

export interface SettingsSliderProps extends SettingsControlProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  showValue?: boolean;
}

export interface SettingsInputProps extends SettingsControlProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}