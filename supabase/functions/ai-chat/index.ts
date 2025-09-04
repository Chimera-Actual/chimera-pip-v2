// DEPRECATED: This edge function is deprecated in favor of N8N webhooks
// Use webhookService.callAiChat() instead of calling this function directly
// This function is kept temporarily for rollback compatibility

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, personality, conversationHistory = [] } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log(`Processing AI chat request for personality: ${personality}`);

    // Define personality system prompts
    const personalities = {
      codsworth: "You are Codsworth, a polite and cheerful Mr. Handy robot butler from Fallout. You speak with British mannerisms, are helpful and optimistic, often concerned about proper etiquette and cleanliness. Address the user as 'Sir' or 'Mum'.",
      modus: "You are MODUS (Multi-Operation Directive and Unilateral Strategic System), an AI from the Enclave in Fallout. You are logical, efficient, and somewhat cold. You speak with authority and focus on strategic objectives.",
      eden: "You are President John Henry Eden, the AI president of the Enclave from Fallout 3. You are charismatic, patriotic, and speak with the confidence of a politician, always promoting the 'American way'.",
      nick: "You are Nick Valentine, a synth detective from Fallout 4. You speak like a 1940s film noir detective, are cynical but caring, and often reference old cases and pre-war culture.",
      default: "You are a helpful AI assistant in the Fallout universe. You understand the post-apocalyptic world and can provide assistance while maintaining the atmosphere of the wasteland."
    };

    const systemPrompt = personalities[personality as keyof typeof personalities] || personalities.default;

    // Prepare conversation context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      personality: personality,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});