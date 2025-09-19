import { supabase } from '@/lib/supabaseClient';
import type { ChatMessage, AgentDefinition, N8NResponse } from '@/types/agents';
import { z } from 'zod';

// Response validation schemas
const N8NShapeA = z.object({
  reply: z.string(),
  usage: z.object({ 
    prompt: z.number().optional(), 
    completion: z.number().optional() 
  }).optional(),
});

const N8NShapeB = z.object({
  messages: z.array(z.object({ 
    role: z.string(), 
    content: z.string() 
  })),
});

const N8NErrorShape = z.object({
  error: z.string(),
});

export interface SendMessageOptions {
  messages: ChatMessage[];
  agent: AgentDefinition;
  sessionId: string;
  widgetId: string;
  webhookUrl?: string;
  customHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

export interface SendMessageResponse {
  content: string;
  usage?: {
    prompt?: number;
    completion?: number;
  };
}

export class AIAgentService {
  /**
   * Send message via Supabase AI chat edge function (preferred for authenticated users)
   */
  async sendMessageViaSupabase(options: SendMessageOptions): Promise<SendMessageResponse> {
    const { messages, agent, sessionId, widgetId, signal } = options;
    
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        message: lastUserMessage.content,
        agentId: agent.id,
        conversationId: sessionId,
        widgetId: widgetId,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to send message via Supabase');
    }

    if (!data?.response) {
      throw new Error('Invalid response from AI service');
    }

    return {
      content: data.response,
      usage: data.tokenUsage ? {
        prompt: data.tokenUsage.prompt,
        completion: data.tokenUsage.completion,
      } : undefined,
    };
  }

  /**
   * Send message directly to n8n webhook (fallback or custom config)
   */
  async sendMessageViaWebhook(options: SendMessageOptions): Promise<SendMessageResponse> {
    const { messages, agent, sessionId, widgetId, webhookUrl, customHeaders, signal } = options;
    
    if (!webhookUrl) {
      throw new Error('Webhook URL is required');
    }

    const body = {
      sessionId,
      agent: {
        id: agent.id,
        name: agent.name,
      },
      messages: messages.map(({ role, content }) => ({ role, content })),
      meta: {
        widgetId,
        timestamp: new Date().toISOString(),
      },
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Webhook request failed (${response.status}): ${errorText || response.statusText}`);
    }

    const json = await response.json();
    
    // Try to parse different response shapes
    const errorResult = N8NErrorShape.safeParse(json);
    if (errorResult.success) {
      throw new Error(errorResult.data.error);
    }

    const shapeA = N8NShapeA.safeParse(json);
    if (shapeA.success) {
      return {
        content: shapeA.data.reply,
        usage: shapeA.data.usage,
      };
    }

    const shapeB = N8NShapeB.safeParse(json);
    if (shapeB.success) {
      const assistantMessage = shapeB.data.messages
        .reverse()
        .find(m => m.role === 'assistant');
      
      if (assistantMessage?.content) {
        return {
          content: assistantMessage.content,
        };
      }
    }

    // Fallback - try to extract reply from various possible formats
    if (typeof json?.reply === 'string') {
      return { content: json.reply };
    }

    if (typeof json?.response === 'string') {
      return { content: json.response };
    }

    throw new Error('Unexpected response format from webhook');
  }

  /**
   * Main method to send message - tries Supabase first, then webhook
   */
  async sendMessage(options: SendMessageOptions): Promise<SendMessageResponse> {
    // If custom webhook URL is provided, use webhook directly
    if (options.webhookUrl) {
      return this.sendMessageViaWebhook(options);
    }

    // Try Supabase edge function first
    try {
      return await this.sendMessageViaSupabase(options);
    } catch (error) {
      console.warn('Supabase AI chat failed, falling back to webhook:', error);
      
      // If agent has a webhook URL, try that as fallback
      if (options.agent.webhook_url) {
        return this.sendMessageViaWebhook({
          ...options,
          webhookUrl: options.agent.webhook_url,
        });
      }
      
      throw error;
    }
  }
}

export const aiAgentService = new AIAgentService();