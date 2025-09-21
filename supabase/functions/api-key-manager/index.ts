import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aesGcmEncrypt, aesGcmDecrypt, isLegacyEncryption, migrateLegacyKey } from "../_shared/crypto.ts";
import { rateLimit, createRateLimitHeaders, createRateLimitResponse } from "../_shared/rateLimit.ts";
import { createSecureResponse } from "../_shared/headers.ts";
import { withCORS, createCORSPreflightResponse } from "../_shared/cors.ts";

interface ApiKeyRequest {
  action: 'create' | 'update' | 'delete' | 'list' | 'get' | 'test';
  keyId?: string;
  serviceName?: string;
  keyName?: string;
  apiUrl?: string;
  apiKey?: string;
  metadata?: Record<string, any>;
}

interface StoredApiKey {
  id: string;
  service_name: string;
  key_name: string;
  api_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  key_metadata: Record<string, any>;
  // New encrypted fields
  alg?: string;
  salt?: string;
  iv?: string;
  encrypted_key: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return withCORS(createCORSPreflightResponse(req), req);
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown';
    const rateLimitResult = await rateLimit(`api-key-manager:${clientIp}`, 10, 60);
    
    if (!rateLimitResult.allowed) {
      const response = createRateLimitResponse(rateLimitResult.resetTime);
      return withCORS(response, req);
    }

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
      const response = createSecureResponse({ error: 'Unauthorized' }, { status: 401 });
      return withCORS(response, req);
    }

    // Get encryption secret
    const encryptionSecret = Deno.env.get('API_KEY_KDF_SECRET');
    if (!encryptionSecret) {
      console.error('API_KEY_KDF_SECRET not configured');
      const response = createSecureResponse({ error: 'Server configuration error' }, { status: 500 });
      return withCORS(response, req);
    }

    const { action, keyId, serviceName, keyName, apiUrl, apiKey, metadata }: ApiKeyRequest = await req.json();

    // Add rate limit headers to all responses
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult, 10);

    switch (action) {
      case 'list': {
        const { data: apiKeys, error } = await supabaseClient
          .from('user_api_keys')
          .select('id, service_name, key_name, api_url, is_active, created_at, updated_at, last_used_at, key_metadata')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error listing API keys:', error);
          const response = createSecureResponse({ error: 'Failed to list API keys' }, { 
            status: 500, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
        }

        const response = createSecureResponse({ data: apiKeys }, { headers: rateLimitHeaders });
        return withCORS(response, req);
      }

      case 'create': {
        if (!keyName || !apiKey) {
          const response = createSecureResponse({ error: 'Key name and API key are required' }, { 
            status: 400, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
        }

        // Encrypt API key with AES-GCM
        const encryptedBundle = await aesGcmEncrypt(new TextEncoder().encode(apiKey), encryptionSecret);

        const { data: newKey, error } = await supabaseClient
          .from('user_api_keys')
          .insert([
            {
              user_id: user.id,
              service_name: serviceName || 'Custom',
              key_name: keyName,
              api_url: apiUrl || '',
              alg: encryptedBundle.alg,
              salt: encryptedBundle.salt,
              iv: encryptedBundle.iv,
              encrypted_key: encryptedBundle.ct,
              key_metadata: metadata || {},
            },
          ])
          .select('id, service_name, key_name, api_url, is_active, created_at, updated_at, last_used_at, key_metadata')
          .single();

        if (error) {
          console.error('Error creating API key:', error);
          const response = createSecureResponse({ error: 'Failed to create API key' }, { 
            status: 500, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
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

        const response = createSecureResponse({ data: newKey }, { headers: rateLimitHeaders });
        return withCORS(response, req);
      }

      case 'update': {
        if (!keyId) {
          const response = createSecureResponse({ error: 'Key ID is required' }, { 
            status: 400, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
        }

        const updateData: any = {};
        if (keyName !== undefined) updateData.key_name = keyName;
        if (apiUrl !== undefined) updateData.api_url = apiUrl;
        if (metadata !== undefined) updateData.key_metadata = metadata;

        // If updating the API key itself, encrypt it
        if (apiKey !== undefined) {
          const encryptedBundle = await aesGcmEncrypt(new TextEncoder().encode(apiKey), encryptionSecret);
          updateData.alg = encryptedBundle.alg;
          updateData.salt = encryptedBundle.salt;
          updateData.iv = encryptedBundle.iv;
          updateData.encrypted_key = encryptedBundle.ct;
        }

        const { data: updatedKey, error } = await supabaseClient
          .from('user_api_keys')
          .update(updateData)
          .eq('id', keyId)
          .eq('user_id', user.id)
          .select('id, service_name, key_name, api_url, is_active, created_at, updated_at, last_used_at, key_metadata')
          .single();

        if (error) {
          console.error('Error updating API key:', error);
          const response = createSecureResponse({ error: 'Failed to update API key' }, { 
            status: 500, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
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

        const response = createSecureResponse({ data: updatedKey }, { headers: rateLimitHeaders });
        return withCORS(response, req);
      }

      case 'delete': {
        if (!keyId) {
          const response = createSecureResponse({ error: 'Key ID is required' }, { 
            status: 400, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
        }

        const { error } = await supabaseClient
          .from('user_api_keys')
          .delete()
          .eq('id', keyId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting API key:', error);
          const response = createSecureResponse({ error: 'Failed to delete API key' }, { 
            status: 500, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
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

        const response = createSecureResponse({ success: true }, { headers: rateLimitHeaders });
        return withCORS(response, req);
      }

      case 'get': {
        if (!keyId) {
          const response = createSecureResponse({ error: 'Key ID is required' }, { 
            status: 400, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
        }

        const { data: apiKeyData, error } = await supabaseClient
          .from('user_api_keys')
          .select('encrypted_key, api_url, service_name, key_name, alg, salt, iv')
          .eq('id', keyId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error || !apiKeyData) {
          const response = createSecureResponse({ error: 'API key not found' }, { 
            status: 404, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
        }

        let decryptedKey: string;

        try {
          // Check if this is a legacy key or new encrypted key
          if (isLegacyEncryption(apiKeyData)) {
            console.log('Migrating legacy API key to AES-GCM');
            
            // Decrypt legacy base64 key and re-encrypt with AES-GCM
            const encryptedBundle = await migrateLegacyKey(apiKeyData.encrypted_key, encryptionSecret);
            decryptedKey = atob(apiKeyData.encrypted_key); // For immediate return
            
            // Update the record with new encryption
            await supabaseClient
              .from('user_api_keys')
              .update({
                alg: encryptedBundle.alg,
                salt: encryptedBundle.salt,
                iv: encryptedBundle.iv,
                encrypted_key: encryptedBundle.ct,
              })
              .eq('id', keyId);
            
            console.log('Successfully migrated legacy API key');
          } else {
            // Use new AES-GCM decryption
            decryptedKey = await aesGcmDecrypt(
              { salt: apiKeyData.salt!, iv: apiKeyData.iv!, ct: apiKeyData.encrypted_key },
              encryptionSecret
            );
          }
        } catch (error) {
          console.error('Error decrypting API key:', error);
          const response = createSecureResponse({ error: 'Failed to decrypt API key' }, { 
            status: 500, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
        }

        // Update last_used_at
        await supabaseClient
          .from('user_api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', keyId);

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

        const response = createSecureResponse({
          data: {
            apiKey: decryptedKey,
            apiUrl: apiKeyData.api_url,
            serviceName: apiKeyData.service_name,
            keyName: apiKeyData.key_name,
          },
        }, { headers: rateLimitHeaders });
        return withCORS(response, req);
      }

      case 'test': {
        if (!apiUrl || !apiKey) {
          const response = createSecureResponse({ error: 'API URL and key are required for testing' }, { 
            status: 400, 
            headers: rateLimitHeaders 
          });
          return withCORS(response, req);
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

          const response = createSecureResponse({
            valid: isValid,
            status: testResponse.status,
            statusText: testResponse.statusText,
          }, { headers: rateLimitHeaders });
          return withCORS(response, req);
        } catch (error) {
          console.error('Error testing API key:', error);
          const response = createSecureResponse({
            valid: false,
            error: 'Connection failed',
          }, { headers: rateLimitHeaders });
          return withCORS(response, req);
        }
      }

      default:
        const response = createSecureResponse({ error: 'Invalid action' }, { 
          status: 400, 
          headers: rateLimitHeaders 
        });
        return withCORS(response, req);
    }
  } catch (error) {
    console.error('Error in api-key-manager function:', error);
    const response = createSecureResponse({ error: 'Internal server error' }, { status: 500 });
    return withCORS(response, req);
  }
});