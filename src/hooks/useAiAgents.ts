import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AiAgent } from '@/types/widgets';
import { useToast } from '@/hooks/use-toast';

interface UseAiAgentsReturn {
  agents: AiAgent[];
  loading: boolean;
  error: string | null;
  createAgent: (agent: Omit<AiAgent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<AiAgent | null>;
  updateAgent: (id: string, updates: Partial<AiAgent>) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  setDefaultAgent: (id: string) => Promise<boolean>;
  testAgent: (webhookUrl: string, testMessage?: string) => Promise<boolean>;
  getDefaultAgent: () => AiAgent | null;
  refreshAgents: () => Promise<void>;
}

export const useAiAgents = (): UseAiAgentsReturn => {
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const formattedAgents: AiAgent[] = data?.map(agent => ({
        id: agent.id,
        userId: agent.user_id,
        name: agent.name,
        description: agent.description,
        webhookUrl: agent.webhook_url,
        systemPrompt: agent.system_prompt,
        modelParameters: agent.model_parameters as AiAgent['modelParameters'],
        avatarConfig: agent.avatar_config as AiAgent['avatarConfig'],
        isDefault: agent.is_default,
        isShared: agent.is_shared,
        isActive: agent.is_active,
        createdAt: new Date(agent.created_at),
        updatedAt: new Date(agent.updated_at)
      })) || [];

      setAgents(formattedAgents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
      setError(errorMessage);
      console.error('Error fetching AI agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAgent = useCallback(async (agentData: Omit<AiAgent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<AiAgent | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_agents')
        .insert({
          user_id: user.id,
          name: agentData.name,
          description: agentData.description,
          webhook_url: agentData.webhookUrl,
          system_prompt: agentData.systemPrompt,
          model_parameters: agentData.modelParameters,
          avatar_config: agentData.avatarConfig,
          is_default: agentData.isDefault,
          is_shared: agentData.isShared,
          is_active: agentData.isActive
        })
        .select()
        .single();

      if (error) throw error;

      const newAgent: AiAgent = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        webhookUrl: data.webhook_url,
        systemPrompt: data.system_prompt,
        modelParameters: data.model_parameters as AiAgent['modelParameters'],
        avatarConfig: data.avatar_config as AiAgent['avatarConfig'],
        isDefault: data.is_default,
        isShared: data.is_shared,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      await refreshAgents();
      toast({
        title: "Agent Created",
        description: `${agentData.name} has been created successfully.`,
      });

      return newAgent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agent';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const updateAgent = useCallback(async (id: string, updates: Partial<AiAgent>): Promise<boolean> => {
    try {
      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.webhookUrl !== undefined) updateData.webhook_url = updates.webhookUrl;
      if (updates.systemPrompt !== undefined) updateData.system_prompt = updates.systemPrompt;
      if (updates.modelParameters !== undefined) updateData.model_parameters = updates.modelParameters;
      if (updates.avatarConfig !== undefined) updateData.avatar_config = updates.avatarConfig;
      if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;
      if (updates.isShared !== undefined) updateData.is_shared = updates.isShared;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await supabase
        .from('ai_agents')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await refreshAgents();
      toast({
        title: "Agent Updated",
        description: "Agent has been updated successfully.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const deleteAgent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refreshAgents();
      toast({
        title: "Agent Deleted",
        description: "Agent has been deleted successfully.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const setDefaultAgent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, remove default status from all user agents
      const { error: clearError } = await supabase
        .from('ai_agents')
        .update({ is_default: false })
        .eq('user_id', user.id);

      if (clearError) throw clearError;

      // Then set the selected agent as default
      const { error: setError } = await supabase
        .from('ai_agents')
        .update({ is_default: true })
        .eq('id', id);

      if (setError) throw setError;

      await refreshAgents();
      toast({
        title: "Default Agent Set",
        description: "Default agent has been updated.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default agent';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const testAgent = useCallback(async (webhookUrl: string, testMessage = "Hello, this is a test message."): Promise<boolean> => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          test: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook test failed: ${response.status} ${response.statusText}`);
      }

      toast({
        title: "Agent Test Successful",
        description: "The agent webhook is responding correctly.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Agent test failed';
      toast({
        title: "Agent Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const getDefaultAgent = useCallback((): AiAgent | null => {
    return agents.find(agent => agent.isDefault) || agents[0] || null;
  }, [agents]);

  const refreshAgents = useCallback(async () => {
    await fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    loading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    setDefaultAgent,
    testAgent,
    getDefaultAgent,
    refreshAgents
  };
};