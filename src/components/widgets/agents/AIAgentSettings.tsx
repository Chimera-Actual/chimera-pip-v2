import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';
import type { AgentDefinition, AgentWidgetConfig } from '@/types/agents';
import { DEFAULT_AGENTS } from '@/services/agents/agentRegistry';

interface AIAgentSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: AgentWidgetConfig;
  onSave: (config: AgentWidgetConfig) => void;
}

export function AIAgentSettings({ 
  open, 
  onOpenChange, 
  config, 
  onSave 
}: AIAgentSettingsProps) {
  const [localConfig, setLocalConfig] = useState<AgentWidgetConfig>(config);
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
        customHeaders: {
          ...prev.customHeaders,
          [newHeaderKey.trim()]: newHeaderValue.trim(),
        },
      }));
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const removeCustomHeader = (key: string) => {
    setLocalConfig(prev => {
      const { [key]: removed, ...rest } = prev.customHeaders || {};
      return { ...prev, customHeaders: rest };
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const webhookUrlValid = !localConfig.customWebhookUrl || isValidUrl(localConfig.customWebhookUrl);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>AI Agent Settings</SheetTitle>
          <SheetDescription>
            Configure webhook endpoints and agent preferences for this widget.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Default Agent */}
          <div className="space-y-2">
            <Label htmlFor="default-agent">Default Agent</Label>
            <Select
              value={localConfig.defaultAgentId || DEFAULT_AGENTS[0].id}
              onValueChange={(value) => 
                setLocalConfig(prev => ({ ...prev, defaultAgentId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default agent" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_AGENTS.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Custom Webhook URL (Optional)</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-n8n-instance.com/webhook/ai-chat"
              value={localConfig.customWebhookUrl || ''}
              onChange={(e) => 
                setLocalConfig(prev => ({ ...prev, customWebhookUrl: e.target.value }))
              }
              className={!webhookUrlValid ? 'border-destructive' : ''}
            />
            {!webhookUrlValid && (
              <p className="text-sm text-destructive">
                Webhook URL must be a valid HTTPS URL
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Leave empty to use the default Supabase AI service
            </p>
          </div>

          {/* Custom Headers */}
          <div className="space-y-4">
            <div>
              <Label>Custom Headers</Label>
              <p className="text-sm text-muted-foreground">
                Add authentication or custom headers for your webhook
              </p>
            </div>

            {/* Security Warning */}
            {(localConfig.customHeaders && Object.keys(localConfig.customHeaders).length > 0) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Custom headers are visible in the browser. Use n8n credential nodes 
                  for sensitive authentication when possible.
                </AlertDescription>
              </Alert>
            )}

            {/* Existing Headers */}
            {localConfig.customHeaders && Object.entries(localConfig.customHeaders).length > 0 && (
              <div className="space-y-2">
                {Object.entries(localConfig.customHeaders).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                    <Badge variant="outline" className="font-mono text-xs">
                      {key}
                    </Badge>
                    <span className="flex-1 text-sm font-mono truncate">{value}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomHeader(key)}
                      className="h-6 w-6 p-0 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Header */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Header name (e.g., X-API-Key)"
                  value={newHeaderKey}
                  onChange={(e) => setNewHeaderKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Header value"
                  value={newHeaderValue}
                  onChange={(e) => setNewHeaderValue(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomHeader}
                  disabled={!newHeaderKey.trim() || !newHeaderValue.trim()}
                  className="h-10 w-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!webhookUrlValid}
          >
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
