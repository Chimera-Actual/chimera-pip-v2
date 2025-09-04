import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  TestTube, 
  Star, 
  Brain, 
  Settings, 
  Loader2,
  Check,
  X,
  AlertTriangle,
  Palette
} from 'lucide-react';
import { AiAgent, AiOracleSettings, BaseWidget } from '@/types/widgets';
import { useAiAgents } from '@/hooks/useAiAgents';
import { useToast } from '@/hooks/use-toast';

interface AiOracleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: BaseWidget;
  settings: AiOracleSettings;
  onSettingsChange: (settings: Partial<AiOracleSettings>) => void;
}

interface AgentFormData {
  name: string;
  description: string;
  webhookUrl: string;
  systemPrompt: string;
  modelParameters: AiAgent['modelParameters'];
  avatarConfig: {
    icon: string;
    color: string;
  };
  isDefault: boolean;
  isShared: boolean;
}

const defaultAgentForm: AgentFormData = {
  name: '',
  description: '',
  webhookUrl: '',
  systemPrompt: '',
  modelParameters: {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0
  },
  avatarConfig: {
    icon: 'brain',
    color: '#00ff00'
  },
  isDefault: false,
  isShared: false
};

const avatarColors = [
  '#00ff00', '#ff4444', '#4444ff', '#ffaa00', 
  '#ff00ff', '#00ffff', '#88ff88', '#ff8888'
];

const avatarIcons = [
  'brain', 'bot', 'zap', 'star', 'heart', 'shield', 'crown', 'diamond'
];

export const AiOracleSettingsModal: React.FC<AiOracleSettingsModalProps> = ({
  isOpen,
  onClose,
  widget,
  settings,
  onSettingsChange
}) => {
  const { toast } = useToast();
  const {
    agents,
    loading: agentsLoading,
    createAgent,
    updateAgent,
    deleteAgent,
    setDefaultAgent,
    testAgent
  } = useAiAgents();

  const [activeTab, setActiveTab] = useState('agents');
  const [editingAgent, setEditingAgent] = useState<AiAgent | null>(null);
  const [agentForm, setAgentForm] = useState<AgentFormData>(defaultAgentForm);
  const [isCreating, setIsCreating] = useState(false);
  const [testingAgent, setTestingAgent] = useState<string | null>(null);

  const handleCreateAgent = useCallback(async () => {
    if (!agentForm.name.trim() || !agentForm.webhookUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Agent name and webhook URL are required.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const newAgent = await createAgent({
        name: agentForm.name,
        description: agentForm.description,
        webhookUrl: agentForm.webhookUrl,
        systemPrompt: agentForm.systemPrompt,
        modelParameters: agentForm.modelParameters,
        avatarConfig: agentForm.avatarConfig,
        isDefault: agentForm.isDefault,
        isShared: agentForm.isShared,
        isActive: true
      });

      if (newAgent) {
        setAgentForm(defaultAgentForm);
        toast({
          title: "Success",
          description: `Agent "${agentForm.name}" created successfully.`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  }, [agentForm, createAgent, toast]);

  const handleUpdateAgent = useCallback(async () => {
    if (!editingAgent) return;

    const success = await updateAgent(editingAgent.id, {
      name: agentForm.name,
      description: agentForm.description,
      webhookUrl: agentForm.webhookUrl,
      systemPrompt: agentForm.systemPrompt,
      modelParameters: agentForm.modelParameters,
      avatarConfig: agentForm.avatarConfig,
      isDefault: agentForm.isDefault,
      isShared: agentForm.isShared
    });

    if (success) {
      setEditingAgent(null);
      setAgentForm(defaultAgentForm);
    }
  }, [editingAgent, agentForm, updateAgent]);

  const handleDeleteAgent = useCallback(async (agent: AiAgent) => {
    const success = await deleteAgent(agent.id);
    if (success && editingAgent?.id === agent.id) {
      setEditingAgent(null);
      setAgentForm(defaultAgentForm);
    }
  }, [deleteAgent, editingAgent]);

  const handleTestAgent = useCallback(async (agent: AiAgent) => {
    setTestingAgent(agent.id);
    const success = await testAgent(agent.webhookUrl);
    setTestingAgent(null);
  }, [testAgent]);

  const handleEditAgent = useCallback((agent: AiAgent) => {
    setEditingAgent(agent);
    setAgentForm({
      name: agent.name,
      description: agent.description || '',
      webhookUrl: agent.webhookUrl,
      systemPrompt: agent.systemPrompt || '',
      modelParameters: agent.modelParameters,
      avatarConfig: agent.avatarConfig,
      isDefault: agent.isDefault,
      isShared: agent.isShared
    });
    setActiveTab('create');
  }, []);

  const handleSetDefault = useCallback(async (agent: AiAgent) => {
    await setDefaultAgent(agent.id);
  }, [setDefaultAgent]);

  const resetForm = () => {
    setEditingAgent(null);
    setAgentForm(defaultAgentForm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Oracle Configuration
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
            <TabsTrigger value="create">
              {editingAgent ? 'Edit Agent' : 'Create Agent'}
            </TabsTrigger>
            <TabsTrigger value="widget">Widget Settings</TabsTrigger>
          </TabsList>

          {/* Agents Management Tab */}
          <TabsContent value="agents" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {agentsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-pip-text-muted mx-auto mb-4" />
                    <p className="text-pip-text-muted">No AI agents configured</p>
                    <Button 
                      onClick={() => setActiveTab('create')} 
                      className="mt-4"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Agent
                    </Button>
                  </div>
                ) : (
                  agents.map((agent) => (
                    <Card key={agent.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: agent.avatarConfig.color }}
                            >
                              <Brain className="h-5 w-5 text-pip-text-bright" />
                            </div>
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {agent.name}
                                {agent.isDefault && (
                                  <Badge variant="secondary">
                                    <Star className="h-3 w-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                                {agent.isShared && (
                                  <Badge variant="outline">Shared</Badge>
                                )}
                              </CardTitle>
                              {agent.description && (
                                <p className="text-sm text-pip-text-muted">
                                  {agent.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTestAgent(agent)}
                              disabled={testingAgent === agent.id}
                            >
                              {testingAgent === agent.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <TestTube className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {!agent.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefault(agent)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAgent(agent)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAgent(agent)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-pip-text-muted">Temperature:</span>
                            <span className="ml-2">{agent.modelParameters.temperature}</span>
                          </div>
                          <div>
                            <span className="text-pip-text-muted">Max Tokens:</span>
                            <span className="ml-2">{agent.modelParameters.maxTokens}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Create/Edit Agent Tab */}
          <TabsContent value="create" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {editingAgent ? 'Edit Agent' : 'Create New Agent'}
                  </h3>
                  {editingAgent && (
                    <Button variant="outline" size="sm" onClick={resetForm}>
                      Cancel Edit
                    </Button>
                  )}
                </div>

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="agent-name">Agent Name *</Label>
                        <Input
                          id="agent-name"
                          value={agentForm.name}
                          onChange={(e) => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Technical Assistant"
                        />
                      </div>
                      <div>
                        <Label htmlFor="webhook-url">Webhook URL *</Label>
                        <Input
                          id="webhook-url"
                          value={agentForm.webhookUrl}
                          onChange={(e) => setAgentForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                          placeholder="https://your-n8n-instance.com/webhook/..."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={agentForm.description}
                        onChange={(e) => setAgentForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What is this agent's purpose or specialty?"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Avatar Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Avatar & Appearance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: agentForm.avatarConfig.color }}
                      >
                        <Brain className="h-8 w-8 text-pip-text-bright" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label>Color</Label>
                          <div className="flex gap-2 mt-2">
                            {avatarColors.map((color) => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded-full border-2 ${
                                  agentForm.avatarConfig.color === color 
                                    ? 'border-pip-text-bright' 
                                    : 'border-pip-border'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setAgentForm(prev => ({
                                  ...prev,
                                  avatarConfig: { ...prev.avatarConfig, color }
                                }))}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="system-prompt">System Prompt</Label>
                      <Textarea
                        id="system-prompt"
                        value={agentForm.systemPrompt}
                        onChange={(e) => setAgentForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                        placeholder="You are a helpful assistant that..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Temperature: {agentForm.modelParameters.temperature}</Label>
                        <Slider
                          value={[agentForm.modelParameters.temperature]}
                          onValueChange={([value]) => setAgentForm(prev => ({
                            ...prev,
                            modelParameters: { ...prev.modelParameters, temperature: value }
                          }))}
                          max={2}
                          min={0}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="max-tokens">Max Tokens</Label>
                        <Input
                          id="max-tokens"
                          type="number"
                          value={agentForm.modelParameters.maxTokens}
                          onChange={(e) => setAgentForm(prev => ({
                            ...prev,
                            modelParameters: { ...prev.modelParameters, maxTokens: parseInt(e.target.value) || 1000 }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label>Top P: {agentForm.modelParameters.topP}</Label>
                        <Slider
                          value={[agentForm.modelParameters.topP]}
                          onValueChange={([value]) => setAgentForm(prev => ({
                            ...prev,
                            modelParameters: { ...prev.modelParameters, topP: value }
                          }))}
                          max={1}
                          min={0}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Set as Default Agent</Label>
                        <p className="text-sm text-pip-text-muted">This agent will be selected by default for new widgets</p>
                      </div>
                      <Switch
                        checked={agentForm.isDefault}
                        onCheckedChange={(checked) => setAgentForm(prev => ({ ...prev, isDefault: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Share with Others</Label>
                        <p className="text-sm text-pip-text-muted">Allow other users to use this agent</p>
                      </div>
                      <Switch
                        checked={agentForm.isShared}
                        onCheckedChange={(checked) => setAgentForm(prev => ({ ...prev, isShared: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}
                    disabled={isCreating}
                  >
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingAgent ? 'Update Agent' : 'Create Agent'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Widget Settings Tab */}
          <TabsContent value="widget" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Widget Instance Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Default Agent for this Widget</Label>
                      <Select 
                        value={settings.selectedAgentId || ''} 
                        onValueChange={(value) => onSettingsChange({ selectedAgentId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: agent.avatarConfig.color }}
                                />
                                {agent.name}
                                {agent.isDefault && <Badge variant="secondary" className="ml-2">Default</Badge>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>UI Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Agent Switcher</Label>
                        <p className="text-sm text-pip-text-muted">Display dropdown to switch between agents</p>
                      </div>
                      <Switch
                        checked={settings.uiPreferences?.showAgentSwitcher !== false}
                        onCheckedChange={(checked) => onSettingsChange({
                          uiPreferences: { ...settings.uiPreferences, showAgentSwitcher: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Token Usage</Label>
                        <p className="text-sm text-pip-text-muted">Display token consumption information</p>
                      </div>
                      <Switch
                        checked={settings.uiPreferences?.showTokenUsage === true}
                        onCheckedChange={(checked) => onSettingsChange({
                          uiPreferences: { ...settings.uiPreferences, showTokenUsage: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compact Mode</Label>
                        <p className="text-sm text-pip-text-muted">Use smaller UI elements and reduced spacing</p>
                      </div>
                      <Switch
                        checked={settings.uiPreferences?.compactMode === true}
                        onCheckedChange={(checked) => onSettingsChange({
                          uiPreferences: { ...settings.uiPreferences, compactMode: checked }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversation Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Save Conversation History</Label>
                        <p className="text-sm text-pip-text-muted">Persist conversations between sessions</p>
                      </div>
                      <Switch
                        checked={settings.conversationSettings?.saveHistory !== false}
                        onCheckedChange={(checked) => onSettingsChange({
                          conversationSettings: { ...settings.conversationSettings, saveHistory: checked }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="max-history">Max History Length</Label>
                      <Input
                        id="max-history"
                        type="number"
                        value={settings.conversationSettings?.maxHistoryLength || 100}
                        onChange={(e) => onSettingsChange({
                          conversationSettings: { 
                            ...settings.conversationSettings, 
                            maxHistoryLength: parseInt(e.target.value) || 100 
                          }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};