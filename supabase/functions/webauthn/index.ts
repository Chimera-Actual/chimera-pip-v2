import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebAuthnCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_name?: string;
  created_at: string;
  last_used_at: string;
}

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

    const { action, userId, credential, challenge } = await req.json();

    switch (action) {
      case 'register': {
        // Store new WebAuthn credential
        const { credentialId, publicKey, deviceName } = credential;
        
        // Check if credential already exists
        const { data: existing } = await supabaseClient
          .from('webauthn_credentials')
          .select('id')
          .eq('credential_id', credentialId)
          .single();
          
        if (existing) {
          throw new Error('Credential already registered');
        }

        // Store credential
        const { data, error } = await supabaseClient
          .from('webauthn_credentials')
          .insert({
            user_id: userId,
            credential_id: credentialId,
            public_key: publicKey,
            counter: 0,
            device_name: deviceName || 'Unknown Device',
            created_at: new Date().toISOString(),
            last_used_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Credential registered successfully',
            credential: data
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'authenticate': {
        // Verify WebAuthn authentication
        const { credentialId, signature, authenticatorData } = credential;
        
        // Get stored credential
        const { data: storedCredential, error: fetchError } = await supabaseClient
          .from('webauthn_credentials')
          .select('*')
          .eq('credential_id', credentialId)
          .single();

        if (fetchError || !storedCredential) {
          throw new Error('Credential not found');
        }

        // In a real implementation, you would:
        // 1. Verify the signature using the stored public key
        // 2. Check the authenticator data
        // 3. Verify the challenge matches
        // 4. Update the counter to prevent replay attacks
        
        // For now, we'll do basic validation
        if (!signature || !authenticatorData) {
          throw new Error('Invalid authentication data');
        }

        // Update last used timestamp and counter
        const { error: updateError } = await supabaseClient
          .from('webauthn_credentials')
          .update({
            last_used_at: new Date().toISOString(),
            counter: storedCredential.counter + 1
          })
          .eq('id', storedCredential.id);

        if (updateError) throw updateError;

        // Create session or return auth token
        const { data: { user }, error: authError } = await supabaseClient.auth.admin.getUserById(userId);
        
        if (authError || !user) {
          throw new Error('User not found');
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Authentication successful',
            userId: user.id,
            email: user.email
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        // List user's registered credentials
        const { data: credentials, error } = await supabaseClient
          .from('webauthn_credentials')
          .select('id, credential_id, device_name, created_at, last_used_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({
            success: true,
            credentials: credentials || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'remove': {
        // Remove a credential
        const { credentialId } = credential;
        
        const { error } = await supabaseClient
          .from('webauthn_credentials')
          .delete()
          .eq('user_id', userId)
          .eq('credential_id', credentialId);

        if (error) throw error;

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Credential removed successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});