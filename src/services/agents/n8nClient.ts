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

export interface PostToN8NOptions {
  webhookUrl: string;
  headers?: Record<string, string>;
  body: unknown;
  signal?: AbortSignal;
  timeout?: number;
}

export interface N8NReply {
  assistantText: string;
  usage?: {
    prompt?: number;
    completion?: number;
  };
}

export async function postToN8N({
  webhookUrl,
  headers,
  body,
  signal,
  timeout = 45000, // 45 seconds
}: PostToN8NOptions): Promise<N8NReply> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // If external signal is provided, listen to both
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        ...(headers ?? {}) 
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`n8n HTTP ${response.status}: ${text || response.statusText}`);
    }

    const json = await response.json();
    
    // Check for error response first
    const errorResult = N8NErrorShape.safeParse(json);
    if (errorResult.success) {
      throw new Error(errorResult.data.error);
    }

    // Try Shape A (reply field)
    const shapeA = N8NShapeA.safeParse(json);
    if (shapeA.success) {
      return {
        assistantText: shapeA.data.reply,
        usage: shapeA.data.usage,
      };
    }

    // Try Shape B (messages array)
    const shapeB = N8NShapeB.safeParse(json);
    if (shapeB.success) {
      const assistantMessage = shapeB.data.messages
        .reverse()
        .find(m => m.role === 'assistant');
      
      if (assistantMessage?.content) {
        return {
          assistantText: assistantMessage.content,
        };
      }
    }

    // Fallback - try to extract reply from various possible formats
    if (typeof json?.reply === 'string') {
      return { assistantText: json.reply };
    }

    if (typeof json?.response === 'string') {
      return { assistantText: json.response };
    }

    throw new Error('Unexpected n8n response format');
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
    
    throw new Error('Unknown error occurred');
  }
}