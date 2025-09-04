// Webhook API Service - Centralized webhook management
import { ApiResponse, ApiRequestOptions } from './types';
import { errorHandler } from './errorHandler';

class WebhookApiService {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number = 30000;
  private readonly defaultRetries: number = 3;
  private readonly defaultRetryDelay: number = 1000;

  constructor() {
    // Use full URL instead of VITE_ env vars as per instructions
    this.baseUrl = 'http://localhost:5678';
  }

  private async makeRequest<T>(
    endpoint: string,
    data: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay
    } = options;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw errorHandler.createApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
        }

        const result = await response.json();

        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        if (attempt === retries) {
          return errorHandler.handleApiError(error, { endpoint, data });
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    return errorHandler.handleApiError(new Error('Max retries exceeded'), { endpoint, data });
  }

  // AI Chat API
  async callAiChat(params: {
    message: string;
    personality: string;
    conversationHistory: Array<{ role: string; content: string }>;
  }) {
    return this.makeRequest('/webhook/ai-chat', params, { timeout: 45000 });
  }

  // News Aggregator API
  async callNewsAggregator(params: {
    categories: string[];
    maxItems: number;
  }) {
    return this.makeRequest('/webhook/news-aggregator', params);
  }

  // Weather API
  async callWeatherApi(params: {
    location: string;
    units?: string;
  }) {
    return this.makeRequest('/webhook/weather-api', params);
  }

  // Crypto API
  async callCryptoApi(params: {
    symbols: string[];
    currency?: string;
  }) {
    return this.makeRequest('/webhook/crypto-api', params);
  }

  // Generic webhook call
  async callGeneric<T>(endpoint: string, data: any, options?: ApiRequestOptions) {
    return this.makeRequest<T>(endpoint, data, options);
  }

  // Test connection
  async testConnection(endpoint: string) {
    return this.makeRequest(`${endpoint}/test`, {}, { timeout: 10000, retries: 1 });
  }
}

export const webhookApi = new WebhookApiService();