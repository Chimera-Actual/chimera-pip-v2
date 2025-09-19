export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  status?: 'ok' | 'pending' | 'error';
}

export interface AgentDefinition {
  id: string;
  name: string;
  description?: string;
  icon?: string; // lucide icon name
  webhook_url?: string;
  system_prompt?: string;
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