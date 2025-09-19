import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';
import { DEFAULT_AGENTS } from '@/services/agents/agentRegistry';
import type { AgentConfig } from '@/types/agents';

interface AIAgentSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: AgentConfig;
  onSave: (config: AgentConfig) => void;
}

export function AIAgentSettings({ open, onOpenChange, config, onSave }: AIAgentSettingsProps) {
  const [localConfig, setLocalConfig] = useState<AgentConfig>(config);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  const handleSave = () => {
    onSave(localConfig);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalConfig(config);
    onOpenChange(false);
  };

  const addCustomHeader = () => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      setLocalConfig(prev => ({
        ...prev,
        authHeaderName: newHeaderKey.trim(),
        authHeaderValue: newHeaderValue.trim(),
      }));
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const removeCustomHeader = () => {
    setLocalConfig(prev => ({
      ...prev,
      authHeaderName: undefined,
      authHeaderValue: undefined,
    }));
  };

  const isValidUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const webhookUrlValid = !localConfig.webhookUrl || isValidUrl(localConfig.webhookUrl);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>AI Agent Settings</SheetTitle>
          <SheetDescription>
            Configure the AI agent widget settings
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Default Agent */}
          <div className="space-y-2">
            <Label htmlFor="default-agent">Default Agent</Label>
            <Select
              value={localConfig.defaultAgentId}
              onValueChange={(value) => setLocalConfig(prev => ({ ...prev, defaultAgentId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default agent" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_AGENTS.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      {agent.icon && React.createElement(agent.icon, { className: "h-4 w-4" })}
                      {agent.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://n8n.example.com/webhook/agent-chat"
              value={localConfig.webhookUrl}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
            />
            {!webhookUrlValid && (
              <p className="text-sm text-destructive">Please enter a valid HTTPS URL</p>
            )}
          </div>

          {/* Auth Header */}
          <div className="space-y-4">
            <Label>Authentication Header (Optional)</Label>
            
            {localConfig.authHeaderName && localConfig.authHeaderValue && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{localConfig.authHeaderName}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {localConfig.authHeaderValue}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeCustomHeader}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {(!localConfig.authHeaderName || !localConfig.authHeaderValue) && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Header name (e.g., X-API-Key)"
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                  />
                  <Input
                    placeholder="Header value"
                    type="password"
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomHeader}
                  disabled={!newHeaderKey.trim() || !newHeaderValue.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Header
                </Button>
              </div>
            )}

            {(localConfig.authHeaderName && localConfig.authHeaderValue) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Notice:</strong> Header values are visible in the browser. 
                  Use n8n secrets or server-side validation for sensitive API keys when possible.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!localConfig.webhookUrl || !webhookUrlValid}
          >
            Save Settings
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}