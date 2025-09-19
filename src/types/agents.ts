export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  ts: number; // epoch milliseconds
  status?: 'ok' | 'pending' | 'error';
}

export interface AgentDefinition {
  id: string;
  name: string;
  description?: string;
  icon?: React.ComponentType<any>; // Lucide icon component
  webhook_url?: string;
  system_prompt?: string;
}

export interface AgentConfig {
  defaultAgentId: string;
  webhookUrl: string;
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