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

    const { eventType, userId, eventData, ipAddress, userAgent } = await req.json();

    console.log('Security event:', { eventType, userId, eventData });

    // Log security event to database
    const { error } = await supabaseClient
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (error) {
      console.error('Error logging security event:', error);
      throw error;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      'multiple_failed_logins',
      'password_breach_attempt',
      'unusual_login_location',
      'rate_limit_exceeded'
    ];

    if (suspiciousPatterns.includes(eventType)) {
      // Could implement additional security measures here
      // like sending alerts, temporary account locks, etc.
      console.log('Suspicious activity detected:', eventType);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Security event logged' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in security-monitor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});