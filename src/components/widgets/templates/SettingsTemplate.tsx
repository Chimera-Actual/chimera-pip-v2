import React from 'react';
import { SettingsSheet } from '@/components/common/SettingsSheet';
import { SettingsGroup, SettingsInput, SettingsToggle } from '@/components/ui/SettingsControls';

interface SettingsTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onSave?: () => void;
  onReset?: () => void;
  isDirty?: boolean;
  isLoading?: boolean;
}

export const SettingsTemplate: React.FC<SettingsTemplateProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSave,
  onReset,
  isDirty = false,
  isLoading = false,
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <SettingsSheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      onCancel={onClose}
      title={title}
      description={description}
      onSave={onSave}
      onReset={onReset}
      isDirty={isDirty}
      isSaving={isLoading}
    >
      {children}
    </SettingsSheet>
  );
};

// Re-export common settings controls for convenience
export { SettingsGroup, SettingsInput, SettingsToggle } from '@/components/ui/SettingsControls';
