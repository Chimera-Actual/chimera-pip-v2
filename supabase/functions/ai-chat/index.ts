import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  agentId: string;
  conversationId?: string;
  widgetId: string;
}

interface ChatResponse {
  response: string;
  conversationId: string;
  tokenUsage?: number;
  requestCount?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid auth token');
    }

    const { message, agentId, conversationId, widgetId }: ChatRequest = await req.json();

    if (!message || !agentId || !widgetId) {
      throw new Error('Missing required fields: message, agentId, widgetId');
    }

    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or access denied');
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data: existingConv, error: convError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (convError) {
        throw new Error('Conversation not found');
      }
      conversation = existingConv;
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('ai_conversations')
        .insert({
          widget_id: widgetId,
          agent_id: agentId,
          user_id: user.id,
          messages: [],
          metadata: {
            requestCount: 0,
            tokenUsage: 0
          }
        })
        .select()
        .single();

      if (createError) {
        throw new Error('Failed to create conversation');
      }
      conversation = newConv;
    }

    // Prepare messages for the AI webhook
    const messages = conversation.messages || [];
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // Prepare webhook payload
    const webhookPayload = {
      session_id: conversation.id,
      user_id: user.id,
      user_prompt: message,
      system_message: agent.system_prompt,
      temperature: agent.model_parameters?.temperature,
      max_tokens: agent.model_parameters?.maxTokens,
      top_p: agent.model_parameters?.topP,
      response_length: agent.model_parameters?.responseLength
    };

    console.log('Sending to webhook:', agent.webhook_url);
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

    // Call the n8n webhook
    const webhookResponse = await fetch(agent.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      console.error('Webhook error:', webhookResponse.status, await webhookResponse.text());
      throw new Error(`Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
    }

    const aiResponse = await webhookResponse.json();
    console.log('AI Response:', aiResponse);

    // Extract response content - handle different possible response formats
    let responseContent: string;
    let tokenUsage = 0;

    if (typeof aiResponse === 'string') {
      responseContent = aiResponse;
    } else if (Array.isArray(aiResponse) && aiResponse.length > 0) {
      // Handle array format like [{"output": "content"}]
      const firstItem = aiResponse[0];
      if (firstItem && typeof firstItem === 'object' && firstItem.output) {
        responseContent = firstItem.output;
        tokenUsage = firstItem.tokenUsage || 0;
      } else {
        responseContent = JSON.stringify(firstItem);
      }
    } else if (aiResponse.response) {
      responseContent = aiResponse.response;
      tokenUsage = aiResponse.tokenUsage || 0;
    } else if (aiResponse.message) {
      responseContent = aiResponse.message;
      tokenUsage = aiResponse.tokenUsage || 0;
    } else if (aiResponse.content) {
      responseContent = aiResponse.content;
      tokenUsage = aiResponse.tokenUsage || 0;
    } else {
      responseContent = JSON.stringify(aiResponse);
    }

    // Add both messages to conversation history
    const updatedMessages = [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString()
      }
    ];

    // Update conversation metadata
    const currentRequestCount = (conversation.metadata?.requestCount || 0) + 1;
    const currentTokenUsage = (conversation.metadata?.tokenUsage || 0) + tokenUsage;

    // Save updated conversation
    const { error: updateError } = await supabase
      .from('ai_conversations')
      .update({
        messages: updatedMessages,
        metadata: {
          requestCount: currentRequestCount,
          tokenUsage: currentTokenUsage,
          lastAgentUsed: agentId,
          updatedAt: new Date().toISOString()
        }
      })
      .eq('id', conversation.id);

    if (updateError) {
      console.error('Failed to update conversation:', updateError);
      // Don't throw here - we got the AI response, just log the error
    }

    const response: ChatResponse = {
      response: responseContent,
      conversationId: conversation.id,
      tokenUsage: currentTokenUsage,
      requestCount: currentRequestCount
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});