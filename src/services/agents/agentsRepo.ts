import { supabase } from '@/lib/supabaseClient';
import type { AgentDefinition } from '@/types/agents';

export interface UserAgent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  system_message: string;
  webhook_url: string;
  created_at: string;
  updated_at: string;
}

// Convert Supabase record to AgentDefinition
function mapToAgentDefinition(agent: UserAgent): AgentDefinition {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description || undefined,
    system_prompt: agent.system_message,
    webhook_url: agent.webhook_url,
    user_id: agent.user_id,
  };
}

export async function listAgents(userId: string): Promise<AgentDefinition[]> {
  const { data, error } = await supabase
    .from('user_agents')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }

  return (data || []).map(mapToAgentDefinition);
}

export async function createAgent(
  agent: Omit<AgentDefinition, 'id'>
): Promise<AgentDefinition> {
  const { data, error } = await supabase
    .from('user_agents')
    .insert({
      user_id: agent.user_id!,
      name: agent.name,
      description: agent.description || '',
      system_message: agent.system_prompt,
      webhook_url: agent.webhook_url,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create agent: ${error.message}`);
  }

  return mapToAgentDefinition(data);
}

export async function updateAgent(agent: AgentDefinition): Promise<AgentDefinition> {
  const { data, error } = await supabase
    .from('user_agents')
    .update({
      name: agent.name,
      description: agent.description || '',
      system_message: agent.system_prompt,
      webhook_url: agent.webhook_url,
    })
    .eq('id', agent.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update agent: ${error.message}`);
  }

  return mapToAgentDefinition(data);
}

export async function deleteAgent(agentId: string): Promise<void> {
  const { error } = await supabase
    .from('user_agents')
    .delete()
    .eq('id', agentId);

  if (error) {
    throw new Error(`Failed to delete agent: ${error.message}`);
  }
}