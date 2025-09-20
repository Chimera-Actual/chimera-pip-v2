import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';
import { DEFAULT_AGENTS } from '@/services/agents/agentRegistry';
import { AgentManagement } from './AgentManagement';
import { useAuth } from '@/contexts/AuthContext';
import { listAgents, createAgent, updateAgent, deleteAgent } from '@/services/agents/agentsRepo';
import type { AgentConfig, AgentDefinition } from '@/types/agents';

interface AIAgentSettingsProps {
  config: AgentConfig;
  onSave: (config: AgentConfig) => void;
}

export function AIAgentSettings({ config, onSave }: AIAgentSettingsProps) {
  const { user } = useAuth();
  const [localConfig, setLocalConfig] = useState<AgentConfig>(config);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [userAgents, setUserAgents] = useState<AgentDefinition[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Load user agents on mount
  useEffect(() => {
    if (user?.id) {
      loadUserAgents();
    }
  }, [user?.id]);

  const loadUserAgents = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingAgents(true);
      const agents = await listAgents(user.id);
      setUserAgents(agents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  // Get all available agents (defaults + user agents)
  const allAgents = [...DEFAULT_AGENTS, ...userAgents];

  const handleSave = () => {
    onSave(localConfig);
  };

  const handleCreateAgent = async (agentData: Omit<AgentDefinition, 'id'>) => {
    const newAgent = await createAgent(agentData);
    setUserAgents(prev => [...prev, newAgent]);
  };

  const handleUpdateAgent = async (agent: AgentDefinition) => {
    const updatedAgent = await updateAgent(agent);
    setUserAgents(prev => prev.map(a => a.id === agent.id ? updatedAgent : a));
  };

  const handleDeleteAgent = async (agentId: string) => {
    await deleteAgent(agentId);
    setUserAgents(prev => prev.filter(a => a.id !== agentId));
    
    // If the deleted agent was the default, switch to first available
    if (localConfig.defaultAgentId === agentId && allAgents.length > 0) {
      const firstAgent = allAgents.find(a => a.id !== agentId);
      if (firstAgent) {
        setLocalConfig(prev => ({ ...prev, defaultAgentId: firstAgent.id }));
      }
    }
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

  if (loadingAgents) {
    return <div className="text-center text-pip-text-muted">Loading agents...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Default Agent */}
      <div className="space-y-2">
        <Label htmlFor="default-agent">Default Agent</Label>
        <Select
          value={localConfig.defaultAgentId}
          onValueChange={(value) => setLocalConfig(prev => ({ ...prev, defaultAgentId: value }))}
        >
          <SelectTrigger className="bg-pip-bg-secondary border-pip-border">
            <SelectValue placeholder="Select default agent" />
          </SelectTrigger>
          <SelectContent className="bg-pip-bg-primary border-pip-border z-50">
            {DEFAULT_AGENTS.map((agent) => (
              <SelectItem key={agent.id} value={agent.id} className="text-pip-text-primary hover:bg-pip-bg-secondary">
                <div className="flex items-center gap-2">
                  {agent.icon && React.createElement(agent.icon, { className: "h-4 w-4" })}
                  <span>{agent.name} <span className="text-xs text-pip-text-muted">(Built-in)</span></span>
                </div>
              </SelectItem>
            ))}
            {userAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id} className="text-pip-text-primary hover:bg-pip-bg-secondary">
                <div className="flex items-center gap-2">
                  <span>{agent.name} <span className="text-xs text-pip-text-muted">(Custom)</span></span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Global Webhook URL */}
      <div className="space-y-2">
        <Label htmlFor="webhook-url">Global Webhook URL (Optional)</Label>
        <Input
          id="webhook-url"
          type="url"
          placeholder="https://n8n.example.com/webhook/agent-chat"
          value={localConfig.webhookUrl || ''}
          onChange={(e) => setLocalConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
          className="bg-pip-bg-secondary border-pip-border"
        />
        {localConfig.webhookUrl && !webhookUrlValid && (
          <p className="text-sm text-destructive">Please enter a valid HTTPS URL</p>
        )}
        <p className="text-xs text-pip-text-muted">
          Fallback URL when custom agents don't specify their own webhook
        </p>
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

      <Separator className="bg-pip-border" />

      {/* Agent Management */}
      {user?.id && (
        <AgentManagement
          agents={userAgents}
          onCreateAgent={handleCreateAgent}
          onUpdateAgent={handleUpdateAgent}
          onDeleteAgent={handleDeleteAgent}
          userId={user.id}
        />
      )}

      {/* Save Button */}
      <div className="pt-4 border-t border-pip-border">
        <Button 
          onClick={handleSave}
          disabled={localConfig.webhookUrl && !webhookUrlValid}
          className="w-full"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}