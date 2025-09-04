// N8N Webhook Service for Chimera-PIP 4000 mk2
// Centralized webhook calls to N8N workflows

export interface WebhookResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface WebhookRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class N8NWebhookService {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number = 30000; // 30 seconds
  private readonly defaultRetries: number = 3;
  private readonly defaultRetryDelay: number = 1000; // 1 second

  constructor() {
    this.baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || 'http://localhost:5678';
  }

  private async makeRequest<T>(
    endpoint: string,
    data: any,
    options: WebhookRequestOptions = {}
  ): Promise<WebhookResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay
    } = options;

    let lastError: Error | null = null;

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
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If this is the last attempt, don't wait
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Request failed after retries',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Call AI chat webhook
   */
  async callAiChat(params: {
    message: string;
    personality: string;
    conversationHistory: Array<{ role: string; content: string }>;
  }): Promise<WebhookResponse<{ response: string; personality: string; timestamp: string }>> {
    return this.makeRequest('/webhook/ai-chat', params, { timeout: 45000 });
  }

  /**
   * Call news aggregator webhook
   */
  async callNewsAggregator(params: {
    categories: string[];
    maxItems: number;
  }): Promise<WebhookResponse<Array<{
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
    return this.makeRequest('/webhook/news-aggregator', params);
  }

  /**
   * Call weather API webhook
   */
  async callWeatherApi(params: {
    location: string;
    units?: string;
  }): Promise<WebhookResponse<{
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
    return this.makeRequest('/webhook/weather-api', params);
  }

  /**
   * Call crypto API webhook
   */
  async callCryptoApi(params: {
    symbols: string[];
    currency?: string;
  }): Promise<WebhookResponse<Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
    volume24h: number;
    lastUpdated: string;
  }>>> {
    return this.makeRequest('/webhook/crypto-api', params);
  }

  /**
   * Test webhook connection
   */
  async testConnection(endpoint: string): Promise<WebhookResponse<{ status: string }>> {
    return this.makeRequest(`${endpoint}/test`, {}, { timeout: 10000, retries: 1 });
  }

  /**
   * Generic webhook call for custom endpoints
   */
  async callGeneric<T>(endpoint: string, data: any, options?: WebhookRequestOptions): Promise<WebhookResponse<T>> {
    return this.makeRequest(endpoint, data, options);
  }
}

// Export singleton instance
export const webhookService = new N8NWebhookService();