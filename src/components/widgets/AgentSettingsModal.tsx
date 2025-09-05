import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Settings, 
  Loader2,
  X
} from 'lucide-react';
import { AiAgent } from '@/types/widgets';
import { useAiAgents } from '@/hooks/useAiAgents';
import { useAgentForm } from '@/hooks/useAgentForm';
import { useToast } from '@/hooks/use-toast';

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAgent?: AiAgent | null;
  onSuccess?: () => void;
}

const avatarColors = [
  '#00ff00', '#ff4444', '#4444ff', '#ffaa00', 
  '#ff00ff', '#00ffff', '#88ff88', '#ff8888'
];

export const AgentSettingsModal = ({
  isOpen,
  onClose,
  editingAgent,
  onSuccess
}) => {
  const { toast } = useToast();
  const { createAgent, updateAgent } = useAiAgents();
  const {
    formData,
    isSubmitting,
    setIsSubmitting,
    updateField,
    updateNestedField,
    validateForm,
    resetForm,
    loadAgent
  } = useAgentForm();

  const isEditMode = !!editingAgent;

  // Load agent data when editing
  useEffect(() => {
    if (editingAgent) {
      loadAgent(editingAgent);
    } else {
      resetForm();
    }
  }, [editingAgent, loadAgent, resetForm]);

  const handleSubmit = async () => {
    console.log('handleSubmit called with formData:', formData);
    console.log('isEditMode:', isEditMode, 'editingAgent:', editingAgent);
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let success = false;

      if (isEditMode && editingAgent) {
        console.log('Updating agent with ID:', editingAgent.id);
        success = await updateAgent(editingAgent.id, {
          name: formData.name,
          description: formData.description,
          webhookUrl: formData.webhookUrl,
          systemMessage: formData.systemMessage,
          modelParameters: formData.modelParameters,
          avatarConfig: formData.avatarConfig,
          isDefault: formData.isDefault,
          isShared: formData.isShared
        });
      } else {
        console.log('Creating new agent');
        const newAgent = await createAgent({
          name: formData.name,
          description: formData.description,
          webhookUrl: formData.webhookUrl,
          systemMessage: formData.systemMessage,
          modelParameters: formData.modelParameters,
          avatarConfig: formData.avatarConfig,
          isDefault: formData.isDefault,
          isShared: formData.isShared,
          isActive: true
        });
        success = !!newAgent;
      }

      if (success) {
        toast({
          title: "Success",
          description: `Agent ${isEditMode ? 'updated' : 'created'} successfully.`
        });
        resetForm();
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} agent. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col my-8" viewportAware={false}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isEditMode ? 'Edit Agent' : 'Create New Agent'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-hidden pr-4">
          <div className="space-y-6 pb-6">
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
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="e.g., Technical Assistant"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL *</Label>
                    <Input
                      id="webhook-url"
                      value={formData.webhookUrl}
                      onChange={(e) => updateField('webhookUrl', e.target.value)}
                      placeholder="https://your-n8n-instance.com/webhook/..."
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
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
                    style={{ backgroundColor: formData.avatarConfig.color }}
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
                              formData.avatarConfig.color === color 
                                ? 'border-pip-text-bright' 
                                : 'border-pip-border'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => updateNestedField('avatarConfig', 'color', color)}
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
                  <Label htmlFor="system-message">System Message</Label>
                  <Textarea
                    id="system-message"
                    value={formData.systemMessage}
                    onChange={(e) => updateField('systemMessage', e.target.value)}
                    placeholder="You are a helpful assistant that..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Temperature: {formData.modelParameters.temperature}</Label>
                    <Slider
                      value={[formData.modelParameters.temperature]}
                      onValueChange={([value]) => updateNestedField('modelParameters', 'temperature', value)}
                      min={0}
                      max={2}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Max Tokens: {formData.modelParameters.maxTokens}</Label>
                    <Slider
                      value={[formData.modelParameters.maxTokens || 1000]}
                      onValueChange={([value]) => updateNestedField('modelParameters', 'maxTokens', value)}
                      min={100}
                      max={4000}
                      step={100}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Top P: {formData.modelParameters.topP}</Label>
                    <Slider
                      value={[formData.modelParameters.topP || 1]}
                      onValueChange={([value]) => updateNestedField('modelParameters', 'topP', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Response Length</Label>
                  <Select
                    value={formData.modelParameters.responseLength || 'medium'}
                    onValueChange={(value) => updateNestedField('modelParameters', 'responseLength', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Label htmlFor="is-default">Set as Default Agent</Label>
                    <p className="text-sm text-pip-text-muted">This agent will be selected by default in new widgets</p>
                  </div>
                  <Switch
                    id="is-default"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => updateField('isDefault', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is-shared">Share with Community</Label>
                    <p className="text-sm text-pip-text-muted">Allow other users to see and use this agent</p>
                  </div>
                  <Switch
                    id="is-shared"
                    checked={formData.isShared}
                    onCheckedChange={(checked) => updateField('isShared', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditMode ? 'Update Agent' : 'Create Agent'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};