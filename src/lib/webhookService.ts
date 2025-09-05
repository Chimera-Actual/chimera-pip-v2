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
   * Call news aggregator webhook with fallback mock data
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
    try {
      const response = await this.makeRequest('/webhook/news-aggregator', params);
      
      // If webhook fails, return mock data instead of failing
      if (!response.success) {
        return this.getMockNewsData(params);
      }
      
      return response as WebhookResponse<Array<{
        id: string;
        headline: string;
        content: string;
        category: string;
        priority: string;
        timestamp: string;
        source: string;
        url?: string;
        imageUrl?: string;
      }>>;
    } catch (error) {
      // Return fallback mock data if webhook service is unavailable
      return this.getMockNewsData(params);
    }
  }

  /**
   * Generate mock news data as fallback
   */
  private getMockNewsData(params: { categories: string[]; maxItems: number }): WebhookResponse<Array<{
    id: string;
    headline: string;
    content: string;
    category: string;
    priority: string;
    timestamp: string;
    source: string;
    url?: string;
    imageUrl?: string;
  }>> {
    const mockNews = [
      {
        id: 'mock-1',
        headline: 'Vault-Tec Security System Update',
        content: 'New security protocols have been implemented across all Vault-Tec facilities. Please update your access codes.',
        category: 'security',
        priority: 'high',
        timestamp: new Date().toISOString(),
        source: 'VAULT-TEC CENTRAL'
      },
      {
        id: 'mock-2', 
        headline: 'Radiation Levels Stable',
        content: 'Current radiation readings within acceptable parameters. All sectors reporting normal atmospheric conditions.',
        category: 'wasteland',
        priority: 'medium',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        source: 'ENVIRONMENTAL MONITOR'
      },
      {
        id: 'mock-3',
        headline: 'System Diagnostics Complete',
        content: 'Daily system diagnostics have completed successfully. All primary systems operating at optimal efficiency.',
        category: 'system',
        priority: 'low',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        source: 'SYSTEM CONTROL'
      },
      {
        id: 'mock-4',
        headline: 'Research Data Archived',
        content: 'Latest research findings have been archived in the central database. Access level 3 clearance required.',
        category: 'vault',
        priority: 'medium',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        source: 'RESEARCH DIVISION'
      }
    ];

    // Filter by categories if specified
    let filteredNews = mockNews;
    if (params.categories && params.categories.length > 0) {
      const categoryMap: Record<string, string> = {
        'general': 'wasteland',
        'science': 'vault', 
        'politics': 'security',
        'technology': 'system'
      };
      
      const falloutCategories = params.categories.map(cat => categoryMap[cat] || cat);
      filteredNews = mockNews.filter(item => 
        falloutCategories.includes(item.category)
      );
    }

    // Limit results
    const limitedNews = filteredNews.slice(0, params.maxItems || 10);

    return {
      success: true,
      data: limitedNews,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Call weather API webhook with fallback data
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
    try {
      const response = await this.makeRequest('/webhook/weather-api', params);
      if (!response.success) {
        return this.getMockWeatherData(params);
      }
      return response as WebhookResponse<{
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
      }>;
    } catch (error) {
      return this.getMockWeatherData(params);
    }
  }

  /**
   * Generate mock weather data as fallback
   */
  private getMockWeatherData(params: { location: string; units?: string }): WebhookResponse<{
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
  }> {
    return {
      success: true,
      data: {
        location: params.location || 'Commonwealth',
        country: 'Post-War USA',
        temperature: 72,
        feelsLike: 75,
        humidity: 45,
        pressure: 1013,
        windSpeed: 8,
        windDirection: 180,
        visibility: 10,
        uvIndex: 3,
        description: 'Clear Skies',
        icon: 'clear-day',
        radiation: 'Low',
        airQuality: 'Acceptable',
        lastUpdated: new Date().toISOString(),
        units: params.units || 'imperial'
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Call crypto API webhook with fallback data
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
    try {
      const response = await this.makeRequest('/webhook/crypto-api', params);
      if (!response.success) {
        return this.getMockCryptoData(params);
      }
      return response as WebhookResponse<Array<{
        symbol: string;
        name: string;
        price: number;
        change24h: number;
        marketCap: number;
        volume24h: number;
        lastUpdated: string;
      }>>;
    } catch (error) {
      return this.getMockCryptoData(params);
    }
  }

  /**
   * Generate mock crypto data as fallback
   */
  private getMockCryptoData(params: { symbols: string[]; currency?: string }): WebhookResponse<Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
    volume24h: number;
    lastUpdated: string;
  }>> {
    const mockCrypto = [
      {
        symbol: 'CAPS',
        name: 'Bottle Caps',
        price: 1.00,
        change24h: 2.5,
        marketCap: 1000000,
        volume24h: 50000,
        lastUpdated: new Date().toISOString()
      },
      {
        symbol: 'SCRAP',
        name: 'Scrap Metal', 
        price: 0.75,
        change24h: -1.2,
        marketCap: 750000,
        volume24h: 25000,
        lastUpdated: new Date().toISOString()
      },
      {
        symbol: 'STIM',
        name: 'Stimpaks',
        price: 25.00,
        change24h: 5.8,
        marketCap: 2500000,
        volume24h: 10000,
        lastUpdated: new Date().toISOString()
      },
      {
        symbol: 'RAD',
        name: 'RadAway',
        price: 18.50,
        change24h: 3.2,
        marketCap: 1850000,
        volume24h: 15000,
        lastUpdated: new Date().toISOString()
      }
    ];

    // Filter by requested symbols if specified
    let filteredCrypto = mockCrypto;
    if (params.symbols && params.symbols.length > 0) {
      filteredCrypto = mockCrypto.filter(item =>
        params.symbols.includes(item.symbol.toLowerCase()) ||
        params.symbols.includes(item.symbol.toUpperCase())
      );
    }

    return {
      success: true,
      data: filteredCrypto,
      timestamp: new Date().toISOString(),
    };
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