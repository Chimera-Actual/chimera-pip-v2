import React from 'react';
import { Key } from 'lucide-react';
import { UniversalSettingsTemplate } from '@/components/settings/UniversalSettingsTemplate';
import { ApiKeyManager } from './ApiKeyManager';
import type { SettingsSection } from '@/types/settings';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose }) => {
  const sections: SettingsSection[] = [
    {
      id: 'api-keys',
      title: 'API Key Management',
      description: 'Manage external service integrations and authentication',
      icon: Key,
      order: 1,
      content: <ApiKeyManager />
    }
  ];

  return (
    <UniversalSettingsTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="EXTERNAL SERVICE KEYS"
      description="MANAGE API KEYS FOR THIRD-PARTY INTEGRATIONS"
      sections={sections}
      size="large"
      showSaveButton={false}
      showResetButton={false}
    />
  );
};