import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { handleApiError } from './errorHandler';
import type { ApiResponse } from './types';

export type WebAuthnAction = 'register' | 'authenticate' | 'list' | 'remove';

interface BaseWebAuthnPayload {
  userId: string;
  email?: string;
}

interface RegisterCredentialPayload extends BaseWebAuthnPayload {
  credential: {
    credentialId: string;
    publicKey: string;
    deviceName?: string;
  };
}

interface AuthenticateCredentialPayload extends BaseWebAuthnPayload {
  credential: {
    credentialId: string;
    signature: string;
    authenticatorData: string;
  };
  challenge: string;
}

interface RemoveCredentialPayload extends BaseWebAuthnPayload {
  credential: {
    credentialId: string;
  };
}

export type WebAuthnRequestPayload =
  | ({ action: 'register' } & RegisterCredentialPayload)
  | ({ action: 'authenticate' } & AuthenticateCredentialPayload)
  | ({ action: 'list' } & BaseWebAuthnPayload)
  | ({ action: 'remove' } & RemoveCredentialPayload);

export interface WebAuthnFunctionResponse {
  success: boolean;
  message?: string;
  error?: string;
  email?: string;
  userId?: string;
  credential?: Record<string, unknown> | null;
  credentials?: Array<Record<string, unknown>>;
}

const missingConfigMessage = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Supabase configuration is missing. Please verify your environment variables.';
  }

  return null;
};

class WebAuthnService {
  private readonly functionName = 'webauthn';

  private createErrorResponse(message: string): ApiResponse<WebAuthnFunctionResponse> {
    return {
      data: null as WebAuthnFunctionResponse,
      error: message,
      success: false,
      timestamp: new Date().toISOString(),
    };
  }

  private handleMissingConfiguration(message: string): ApiResponse<WebAuthnFunctionResponse> {
    toast({
      title: 'Configuration Error',
      description: message,
      variant: 'destructive',
    });

    return this.createErrorResponse(message);
  }

  private async invoke(
    payload: WebAuthnRequestPayload
  ): Promise<ApiResponse<WebAuthnFunctionResponse>> {
    const configError = missingConfigMessage();
    if (configError) {
      return this.handleMissingConfiguration(configError);
    }

    if (!supabase?.functions) {
      return this.handleMissingConfiguration('Supabase client is not initialized.');
    }

    try {
      const { data, error } = await supabase.functions.invoke<WebAuthnFunctionResponse>(
        this.functionName,
        { body: payload }
      );

      if (error) {
        const message = error.message || 'Failed to contact the WebAuthn service.';
        return this.createErrorResponse(message);
      }

      if (!data) {
        return this.createErrorResponse('Empty response received from the WebAuthn service.');
      }

      if (!data.success) {
        return {
          data,
          error: data.error || data.message || 'WebAuthn operation failed.',
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        data,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const result = handleApiError<WebAuthnFunctionResponse>(error);

      if (result.error) {
        toast({
          title: 'Biometric Service Error',
          description: result.error,
          variant: 'destructive',
        });
      }

      return result;
    }
  }

  async register(
    payload: RegisterCredentialPayload
  ): Promise<ApiResponse<WebAuthnFunctionResponse>> {
    return this.invoke({ action: 'register', ...payload });
  }

  async authenticate(
    payload: AuthenticateCredentialPayload
  ): Promise<ApiResponse<WebAuthnFunctionResponse>> {
    return this.invoke({ action: 'authenticate', ...payload });
  }

  async list(
    payload: BaseWebAuthnPayload
  ): Promise<ApiResponse<WebAuthnFunctionResponse>> {
    return this.invoke({ action: 'list', ...payload });
  }

  async remove(
    payload: RemoveCredentialPayload
  ): Promise<ApiResponse<WebAuthnFunctionResponse>> {
    return this.invoke({ action: 'remove', ...payload });
  }
}

export const webauthnService = new WebAuthnService();

export type {
  RegisterCredentialPayload as WebAuthnRegisterPayload,
  AuthenticateCredentialPayload as WebAuthnAuthenticatePayload,
  RemoveCredentialPayload as WebAuthnRemovePayload,
  BaseWebAuthnPayload,
};
