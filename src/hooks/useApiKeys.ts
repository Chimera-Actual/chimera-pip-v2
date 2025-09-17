import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ApiKeyData {
  apiKey: string;
  apiUrl: string;
  serviceName: string;
  keyName: string;
}

export interface ApiKey {
  id: string;
  service_name: string;
  key_name: string;
  api_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  key_metadata: Record<string, any>;
}

export function useApiKeys() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getApiKey = useCallback(async (keyId: string): Promise<ApiKeyData | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('api-key-manager', {
        body: { action: 'get', keyId },
      });

      if (error) {
        console.error('Error getting API key:', error);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getApiKeysByService = useCallback(async (serviceName: string): Promise<ApiKey[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('api-key-manager', {
        body: { action: 'list' },
      });

      if (error) {
        console.error('Error listing API keys:', error);
        return [];
      }

      return data.data.filter((key: ApiKey) => 
        key.service_name.toLowerCase() === serviceName.toLowerCase() && key.is_active
      );
    } catch (error) {
      console.error('Error listing API keys:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const listApiKeys = useCallback(async (): Promise<ApiKey[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('api-key-manager', {
        body: { action: 'list' },
      });

      if (error) {
        console.error('Error listing API keys:', error);
        return [];
      }

      return data.data || [];
    } catch (error) {
      console.error('Error listing API keys:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const testApiKey = useCallback(async (apiUrl: string, apiKey: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('api-key-manager', {
        body: { action: 'test', apiUrl, apiKey },
      });

      if (error) {
        console.error('Error testing API key:', error);
        return false;
      }

      return data.valid;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }, []);

  return {
    loading,
    getApiKey,
    getApiKeysByService,
    listApiKeys,
    testApiKey,
  };
}