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

    const { userId, includeAnalytics = false } = await req.json();

    console.log('Generating backup for user:', userId);

    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Error fetching user profile: ${profileError.message}`);
    }

    // Get user widgets
    const { data: userWidgets, error: widgetsError } = await supabaseSupabaseClient
      .from('user_widgets')
      .select('*')
      .eq('user_id', userId);

    if (widgetsError) {
      throw new Error(`Error fetching widgets: ${widgetsError.message}`);
    }

    // Get user tabs
    const { data: userTabs, error: tabsError } = await supabaseClient
      .from('user_tabs')
      .select('*')
      .eq('user_id', userId);

    if (tabsError) {
      throw new Error(`Error fetching tabs: ${tabsError.message}`);
    }

    // Get user achievements
    const { data: achievements, error: achievementsError } = await supabaseClient
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (achievementsError) {
      throw new Error(`Error fetching achievements: ${achievementsError.message}`);
    }

    // Get widget settings
    const { data: widgetSettings, error: settingsError } = await supabaseClient
      .from('widget_instance_settings')
      .select('*')
      .eq('user_id', userId);

    if (settingsError) {
      throw new Error(`Error fetching widget settings: ${settingsError.message}`);
    }

    let analyticsData = null;
    if (includeAnalytics) {
      const { data: analytics, error: analyticsError } = await supabaseClient
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (!analyticsError) {
        analyticsData = analytics;
      }
    }

    // Create backup object
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      userId: userId,
      data: {
        profile: userProfile,
        widgets: userWidgets,
        tabs: userTabs,
        achievements: achievements,
        widgetSettings: widgetSettings,
        ...(analyticsData && { analytics: analyticsData })
      }
    };

    console.log('Backup generated successfully for user:', userId);

    return new Response(
      JSON.stringify({
        success: true,
        backup: backup,
        size: JSON.stringify(backup).length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="chimera-pip-backup-${userId}-${Date.now()}.json"`
        }
      }
    );
  } catch (error) {
    console.error('Error in backup-generator function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});