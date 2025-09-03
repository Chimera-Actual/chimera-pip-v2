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

    const { userId, status, sessionData } = await req.json();

    console.log('Presence update:', { userId, status, sessionData });

    // Update or insert user presence
    const { error } = await supabaseClient
      .from('user_presence')
      .upsert({
        user_id: userId,
        status: status || 'online',
        session_data: sessionData || {},
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating presence:', error);
      throw error;
    }

    // Clean up old presence data (users offline for more than 24 hours)
    const cleanupTime = new Date();
    cleanupTime.setHours(cleanupTime.getHours() - 24);

    const { error: cleanupError } = await supabaseClient
      .from('user_presence')
      .delete()
      .lt('last_seen', cleanupTime.toISOString())
      .eq('status', 'offline');

    if (cleanupError) {
      console.log('Note: Presence cleanup had an issue:', cleanupError.message);
    }

    // Get current online users count for response
    const { data: onlineUsers, error: countError } = await supabaseClient
      .from('user_presence')
      .select('user_id')
      .eq('status', 'online')
      .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

    const onlineCount = onlineUsers?.length || 0;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Presence updated',
        onlineUsers: onlineCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in presence-manager function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});