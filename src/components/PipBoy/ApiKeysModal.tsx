import React from 'react';
import { BaseSettingsModal } from '@/components/ui/BaseSettingsModal';
import { Key } from 'lucide-react';
import { ApiKeyManager } from './ApiKeyManager';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose }) => {
  return (
    <BaseSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title="EXTERNAL SERVICE KEYS"
      description="MANAGE API KEYS FOR THIRD-PARTY INTEGRATIONS"
      size="large"
      showSaveButton={false}
      showResetButton={false}
    >
      <div className="space-y-4">
        <div className="flex items-center mb-6">
          <Key className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright pip-text-glow">
            API KEY MANAGEMENT
          </h3>
        </div>
        
        <div className="pl-7">
          <ApiKeyManager />
        </div>
      </div>
    </BaseSettingsModal>
  );
};