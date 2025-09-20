import { supabase } from '@/integrations/supabase/client';

/**
 * Retrieves Google Maps API key from Supabase using the api-key-manager edge function
 * @returns Promise<string> The decrypted Google Maps API key
 * @throws Error if the API key is not found or cannot be retrieved
 */
export async function getGoogleMapsKey(): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('api-key-manager', {
      body: { service: 'Google Maps' }
    });

    if (error) {
      throw new Error(`Failed to get API key: ${error.message}`);
    }

    if (!data?.api_key) {
      throw new Error('Google Maps API key not configured');
    }

    return data.api_key;
  } catch (error) {
    console.error('Error retrieving Google Maps API key:', error);
    throw new Error('Google Maps API key not configured');
  }
}