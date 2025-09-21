import React, { useState } from 'react';
import { SettingsSheet } from '@/components/common/SettingsSheet';
import { SettingsGroup, SettingsInput } from '@/components/ui/SettingsControls';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: Date;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const addApiKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: ApiKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: newKeyName,
      key: 'ak_' + Math.random().toString(36).substr(2, 20),
      created: new Date(),
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
  };

  const removeApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    setShowKeys(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SettingsSheet
      open={isOpen}
      onOpenChange={onClose}
      title="API Keys"
      description="Manage your service integration keys and tokens"
    >
      <SettingsGroup title="Create New API Key" description="Generate a new API key for service integration">
        <div className="flex gap-2">
          <SettingsInput
            label=""
            value={newKeyName}
            onChange={setNewKeyName}
            placeholder="Enter key name (e.g., 'Weather Service')"
          />
          <Button onClick={addApiKey} disabled={!newKeyName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Key
          </Button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Existing API Keys" description="Manage your current API keys">
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-pip-text-muted">
            <p>No API keys configured</p>
            <p className="text-sm">Create your first API key above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between p-3 bg-pip-surface rounded border border-pip-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-pip-text-bright">{apiKey.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-pip-text-muted">
                      {showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {showKeys[apiKey.id] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-pip-text-muted mt-1">
                    Created: {apiKey.created.toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeApiKey(apiKey.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </SettingsGroup>
    </SettingsSheet>
  );
};