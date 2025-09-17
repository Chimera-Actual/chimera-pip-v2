import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiKeyRequest {
  action: 'create' | 'update' | 'delete' | 'list' | 'get' | 'test';
  keyId?: string;
  serviceName?: string;
  keyName?: string;
  apiUrl?: string;
  apiKey?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user from the authorization header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { action, keyId, serviceName, keyName, apiUrl, apiKey, metadata }: ApiKeyRequest = await req.json();

    switch (action) {
      case 'list': {
        const { data: apiKeys, error } = await supabaseClient
          .from('user_api_keys')
          .select('id, service_name, key_name, api_url, is_active, created_at, updated_at, last_used_at, key_metadata')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error listing API keys:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to list API keys' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(
          JSON.stringify({ data: apiKeys }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'create': {
        if (!serviceName || !keyName || !apiUrl || !apiKey) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Simple encryption (in production, use proper encryption)
        const encryptedKey = btoa(apiKey);

        const { data: newKey, error } = await supabaseClient
          .from('user_api_keys')
          .insert([
            {
              user_id: user.id,
              service_name: serviceName,
              key_name: keyName,
              api_url: apiUrl,
              encrypted_key: encryptedKey,
              key_metadata: metadata || {},
            },
          ])
          .select('id, service_name, key_name, api_url, is_active, created_at, updated_at, last_used_at, key_metadata')
          .single();

        if (error) {
          console.error('Error creating API key:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create API key' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Log security event
        await supabaseClient.from('security_events').insert([
          {
            user_id: user.id,
            event_type: 'api_key_created',
            event_data: {
              service_name: serviceName,
              key_name: keyName,
              timestamp: new Date().toISOString(),
            },
          },
        ]);

        return new Response(
          JSON.stringify({ data: newKey }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'update': {
        if (!keyId) {
          return new Response(
            JSON.stringify({ error: 'Key ID is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const updateData: any = {};
        if (keyName !== undefined) updateData.key_name = keyName;
        if (apiUrl !== undefined) updateData.api_url = apiUrl;
        if (apiKey !== undefined) updateData.encrypted_key = btoa(apiKey);
        if (metadata !== undefined) updateData.key_metadata = metadata;

        const { data: updatedKey, error } = await supabaseClient
          .from('user_api_keys')
          .update(updateData)
          .eq('id', keyId)
          .eq('user_id', user.id)
          .select('id, service_name, key_name, api_url, is_active, created_at, updated_at, last_used_at, key_metadata')
          .single();

        if (error) {
          console.error('Error updating API key:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update API key' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Log security event
        await supabaseClient.from('security_events').insert([
          {
            user_id: user.id,
            event_type: 'api_key_updated',
            event_data: {
              key_id: keyId,
              timestamp: new Date().toISOString(),
            },
          },
        ]);

        return new Response(
          JSON.stringify({ data: updatedKey }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'delete': {
        if (!keyId) {
          return new Response(
            JSON.stringify({ error: 'Key ID is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { error } = await supabaseClient
          .from('user_api_keys')
          .delete()
          .eq('id', keyId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting API key:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to delete API key' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Log security event
        await supabaseClient.from('security_events').insert([
          {
            user_id: user.id,
            event_type: 'api_key_deleted',
            event_data: {
              key_id: keyId,
              timestamp: new Date().toISOString(),
            },
          },
        ]);

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'get': {
        if (!keyId) {
          return new Response(
            JSON.stringify({ error: 'Key ID is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const { data: apiKeyData, error } = await supabaseClient
          .from('user_api_keys')
          .select('encrypted_key, api_url, service_name, key_name')
          .eq('id', keyId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error || !apiKeyData) {
          return new Response(
            JSON.stringify({ error: 'API key not found' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Update last_used_at
        await supabaseClient
          .from('user_api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', keyId);

        // Decrypt the key (simple decryption)
        const decryptedKey = atob(apiKeyData.encrypted_key);

        // Log security event
        await supabaseClient.from('security_events').insert([
          {
            user_id: user.id,
            event_type: 'api_key_accessed',
            event_data: {
              key_id: keyId,
              service_name: apiKeyData.service_name,
              timestamp: new Date().toISOString(),
            },
          },
        ]);

        return new Response(
          JSON.stringify({
            data: {
              apiKey: decryptedKey,
              apiUrl: apiKeyData.api_url,
              serviceName: apiKeyData.service_name,
              keyName: apiKeyData.key_name,
            },
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'test': {
        if (!apiUrl || !apiKey) {
          return new Response(
            JSON.stringify({ error: 'API URL and key are required for testing' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        try {
          // Basic connectivity test
          const testResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });

          const isValid = testResponse.ok || testResponse.status === 401; // 401 might mean valid endpoint but wrong key

          return new Response(
            JSON.stringify({
              valid: isValid,
              status: testResponse.status,
              statusText: testResponse.statusText,
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } catch (error) {
          console.error('Error testing API key:', error);
          return new Response(
            JSON.stringify({
              valid: false,
              error: 'Connection failed',
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('Error in api-key-manager function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});