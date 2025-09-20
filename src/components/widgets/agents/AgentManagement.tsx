import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Plus, Bot } from 'lucide-react';
import type { AgentDefinition } from '@/types/agents';
import { useToast } from '@/hooks/use-toast';

interface AgentManagementProps {
  agents: AgentDefinition[];
  onCreateAgent: (agent: Omit<AgentDefinition, 'id'>) => Promise<void>;
  onUpdateAgent: (agent: AgentDefinition) => Promise<void>;
  onDeleteAgent: (agentId: string) => Promise<void>;
  userId: string;
}

interface AgentFormData {
  name: string;
  description: string;
  system_prompt: string;
  webhook_url: string;
}

const initialFormData: AgentFormData = {
  name: '',
  description: '',
  system_prompt: '',
  webhook_url: '',
};

export function AgentManagement({ 
  agents, 
  onCreateAgent, 
  onUpdateAgent, 
  onDeleteAgent,
  userId
}: AgentManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentDefinition | null>(null);
  const [formData, setFormData] = useState<AgentFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Agent name is required',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.system_prompt.trim()) {
      toast({
        title: 'Validation Error',
        description: 'System message is required',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.webhook_url.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Webhook URL is required',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const url = new URL(formData.webhook_url);
      if (url.protocol !== 'https:') {
        toast({
          title: 'Validation Error',
          description: 'Webhook URL must use HTTPS',
          variant: 'destructive',
        });
        return false;
      }
    } catch {
      toast({
        title: 'Validation Error',
        description: 'Invalid webhook URL format',
        variant: 'destructive',
      });
      return false;
    }

    // Check for duplicate names (excluding current agent if editing)
    const existingNames = agents
      .filter(agent => !editingAgent || agent.id !== editingAgent.id)
      .map(agent => agent.name.toLowerCase());
    
    if (existingNames.includes(formData.name.toLowerCase())) {
      toast({
        title: 'Validation Error',
        description: 'An agent with this name already exists',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingAgent) {
        // Update existing agent
        await onUpdateAgent({
          ...editingAgent,
          name: formData.name.trim(),
          description: formData.description.trim(),
          system_prompt: formData.system_prompt.trim(),
          webhook_url: formData.webhook_url.trim(),
        });
        toast({
          title: 'Success',
          description: 'Agent updated successfully',
        });
      } else {
        // Create new agent
        await onCreateAgent({
          name: formData.name.trim(),
          description: formData.description.trim(),
          system_prompt: formData.system_prompt.trim(),
          webhook_url: formData.webhook_url.trim(),
          user_id: userId,
        });
        toast({
          title: 'Success',
          description: 'Agent created successfully',
        });
      }
      
      setIsEditing(false);
      setEditingAgent(null);
      setFormData(initialFormData);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save agent',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (agent: AgentDefinition) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description || '',
      system_prompt: agent.system_prompt,
      webhook_url: agent.webhook_url,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingAgent(null);
    setFormData(initialFormData);
  };

  const handleDelete = async (agentId: string) => {
    try {
      await onDeleteAgent(agentId);
      toast({
        title: 'Success',
        description: 'Agent deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-pip-text-bright">
            {editingAgent ? 'Edit Agent' : 'Create New Agent'}
          </h3>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Name *</Label>
            <Input
              id="agent-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Custom Agent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Input
              id="agent-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the agent's purpose"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-message">System Message *</Label>
            <Textarea
              id="system-message"
              value={formData.system_prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
              placeholder="You are a helpful AI assistant..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL *</Label>
            <Input
              id="webhook-url"
              type="url"
              value={formData.webhook_url}
              onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
              placeholder="https://your-n8n.example.com/webhook/agent"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : editingAgent ? 'Update Agent' : 'Create Agent'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-pip-text-bright">Custom Agents</h3>
        <Button onClick={() => setIsEditing(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-8 text-pip-text-muted">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No custom agents yet</p>
          <p className="text-sm">Create your first custom agent to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map(agent => (
            <Card key={agent.id} className="bg-pip-bg-secondary border-pip-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-pip-text-bright">
                    {agent.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(agent)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-pip-bg-primary border-pip-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-pip-text-bright">
                            Delete Agent
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-pip-text-muted">
                            Are you sure you want to delete "{agent.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(agent.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {agent.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-pip-text-muted">{agent.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}