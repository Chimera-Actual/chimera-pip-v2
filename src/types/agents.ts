export type ChatRole = 'user' | 'assistant' | 'system';
export type AgentId = string;

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  ts: number; // epoch milliseconds
  status?: 'ok' | 'pending' | 'error';
}

export interface AgentDefinition {
  id: AgentId;
  name: string;
  description?: string;
  system_prompt: string;
  webhook_url: string;
  icon?: React.ComponentType<any>; // Lucide icon component
  user_id?: string; // For custom user agents
}

export interface AgentConfig {
  defaultAgentId: AgentId;
  webhookUrl?: string; // Global fallback (optional)
  authHeaderName?: string;
  authHeaderValue?: string;
}

export interface AgentWidgetConfig {
  defaultAgentId?: string;
  customWebhookUrl?: string;
  customHeaders?: Record<string, string>;
}

export interface N8NResponse {
  reply?: string;
  messages?: Array<{ role: string; content: string }>;
  usage?: {
    prompt?: number;
    completion?: number;
  };
  error?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}