import React from 'react';
import { SettingsModal } from '@/components/ui/SettingsModal';
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
  return (
    <SettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      onSave={onSave}
      onReset={onReset}
      isDirty={isDirty}
      isLoading={isLoading}
    >
      {children}
    </SettingsModal>
  );
};

// Re-export common settings controls for convenience
export { SettingsGroup, SettingsInput, SettingsToggle } from '@/components/ui/SettingsControls';