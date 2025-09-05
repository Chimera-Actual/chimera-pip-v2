import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  TestTube, 
  Star, 
  Brain, 
  Settings, 
  Loader2
} from 'lucide-react';
import { AiAgent, AiOracleSettings, BaseWidget } from '@/types/widgets';
import { useAiAgents } from '@/hooks/useAiAgents';
import { useToast } from '@/hooks/use-toast';
import { AgentSettingsModal } from './AgentSettingsModal';

interface AiOracleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: BaseWidget;
  settings: AiOracleSettings;
  onSettingsChange: (settings: Partial<AiOracleSettings>) => void;
}


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
    deleteAgent,
    setDefaultAgent,
    testAgent
  } = useAiAgents();

  const [activeTab, setActiveTab] = useState('agents');
  const [editingAgent, setEditingAgent] = useState<AiAgent | null>(null);
  const [testingAgent, setTestingAgent] = useState<string | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);


  const handleDeleteAgent = useCallback(async (agent: AiAgent) => {
    await deleteAgent(agent.id);
  }, [deleteAgent]);

  const handleTestAgent = useCallback(async (agent: AiAgent) => {
    setTestingAgent(agent.id);
    const success = await testAgent(agent.webhookUrl);
    setTestingAgent(null);
  }, [testAgent]);

  const handleEditAgent = useCallback((agent: AiAgent) => {
    setEditingAgent(agent);
    setShowAgentModal(true);
  }, []);

  const handleSetDefault = useCallback(async (agent: AiAgent) => {
    await setDefaultAgent(agent.id);
  }, [setDefaultAgent]);

  const handleAddAgent = useCallback(() => {
    setEditingAgent(null);
    setShowAgentModal(true);
  }, []);

  const handleAgentModalClose = useCallback(() => {
    setShowAgentModal(false);
    setEditingAgent(null);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Oracle Configuration
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
            <TabsTrigger value="widget">Widget Settings</TabsTrigger>
          </TabsList>

          {/* Agents Management Tab */}
          <TabsContent value="agents" className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-semibold">AI Agents</h3>
              <Button onClick={handleAddAgent} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {agentsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-pip-text-muted mx-auto mb-4" />
                    <p className="text-pip-text-muted">No AI agents configured</p>
                    <p className="text-sm text-pip-text-muted mt-2">Click "Add Agent" to create your first AI agent</p>
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
                              <Settings className="h-4 w-4" />
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


          {/* Widget Settings Tab */}
          <TabsContent value="widget" className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
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

        {/* Agent Settings Modal */}
        <AgentSettingsModal
          isOpen={showAgentModal}
          onClose={handleAgentModalClose}
          editingAgent={editingAgent}
          onSuccess={handleAgentModalClose}
        />
      </DialogContent>
    </Dialog>
  );
};