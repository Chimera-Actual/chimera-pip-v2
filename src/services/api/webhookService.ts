import { ApiResponse, WebhookConfig, RequestConfig } from './types';
import { createApiError, handleApiError, apiErrorHandler } from './errorHandler';
import { apiCache } from './cache';

class WebhookService {
  private readonly defaultTimeout = 30000;
  private readonly defaultRetries = 3;
  private readonly defaultRetryDelay = 1000;

  async call<T>(
    config: WebhookConfig,
    data: any,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = config.timeout || this.defaultTimeout,
      retries = config.retries || this.defaultRetries,
      retryDelay = config.retryDelay || this.defaultRetryDelay,
      headers = {},
      signal,
    } = options;

    let lastError: any = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller if not provided
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const requestSignal = signal || controller.signal;

        const response = await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
            ...headers,
          },
          body: JSON.stringify(data),
          signal: requestSignal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw createApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            { url: config.url, responseText: errorText }
          );
        }

        const result = await response.json();

        return {
          data: result as T,
          success: true,
          error: null,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        lastError = error;
        clearTimeout(timeoutId!);
        
        // Handle AbortError
        if (error instanceof Error && error.name === 'AbortError') {
          return handleApiError<T>(createApiError('Request timeout', 'TIMEOUT'));
        }

        // Convert to ApiError if not already
        const apiError = error instanceof Error && 'code' in error 
          ? error as any 
          : createApiError(
              error instanceof Error ? error.message : 'Request failed',
              'WEBHOOK_ERROR',
              { url: config.url, attempt: attempt + 1 }
            );

        // Check if we should retry
        if (attempt < retries && apiErrorHandler.shouldRetry(apiError, attempt, retries)) {
          const delay = apiErrorHandler.getRetryDelay(apiError, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If this is the last attempt, break out of the loop
        break;
      }
    }

    return handleApiError<T>(lastError);
  }

  // Specialized webhook calls
  async callAiChat(params: {
    message: string;
    agentId: string;
    conversationId?: string;
    widgetId?: string;
  }): Promise<ApiResponse<{ 
    response: string; 
    tokenUsage?: number;
    requestCount?: number;
  }>> {
    const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || 'http://localhost:5678';
    
    return this.call({
      url: `${baseUrl}/webhook/ai-chat`,
      timeout: 45000,
    }, params);
  }

  async callNewsAggregator(params: {
    categories: string[];
    maxItems: number;
  }): Promise<ApiResponse<Array<{
    id: string;
    headline: string;
    content: string;
    category: string;
    priority: string;
    timestamp: string;
    source: string;
    url?: string;
    imageUrl?: string;
  }>>> {
    const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || 'http://localhost:5678';
    
    return this.call({
      url: `${baseUrl}/webhook/news-aggregator`,
    }, params);
  }

  async callWeatherApi(params: {
    location: string;
    units?: string;
  }): Promise<ApiResponse<{
    location: string;
    country: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
    description: string;
    icon: string;
    radiation: string;
    airQuality: string;
    lastUpdated: string;
    units: string;
  }>> {
    const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || 'http://localhost:5678';
    
    return this.call({
      url: `${baseUrl}/webhook/weather-api`,
    }, params);
  }

  async callCryptoApi(params: {
    symbols: string[];
    currency?: string;
  }): Promise<ApiResponse<Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
    volume24h: number;
    lastUpdated: string;
  }>>> {
    const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || 'http://localhost:5678';
    
    return this.call({
      url: `${baseUrl}/webhook/crypto-api`,
    }, params);
  }

  async testConnection(endpoint: string): Promise<ApiResponse<{ status: string }>> {
    return this.call({
      url: endpoint,
      timeout: 10000,
      retries: 1,
    }, { test: true });
  }
}

export const webhookService = new WebhookService();