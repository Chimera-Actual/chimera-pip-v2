import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, eventName, eventProperties, sessionId } = await req.json();

    console.log('Analytics event:', { userId, eventName, eventProperties, sessionId });

    // Track analytics event
    const { error } = await supabaseClient
      .from('user_analytics')
      .insert({
        user_id: userId,
        event_name: eventName,
        event_properties: eventProperties || {},
        session_id: sessionId
      });

    if (error) {
      console.error('Error tracking analytics:', error);
      throw error;
    }

    // Aggregate daily statistics for performance
    const today = new Date().toISOString().split('T')[0];
    
    // Update user activity summary (could be used for insights)
    const { error: aggregateError } = await supabaseClient
      .rpc('increment_daily_activity', {
        p_user_id: userId,
        p_date: today,
        p_event_name: eventName
      })
      .single();

    if (aggregateError) {
      console.log('Note: Daily activity aggregate not updated (function may not exist yet)');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Analytics event tracked' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in analytics-tracker function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});