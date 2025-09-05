// Fallback data for when external services are unavailable

export const getFallbackWeatherData = () => ({
  location: 'Commonwealth',
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
  units: 'imperial'
});

export const getFallbackCryptoData = () => [
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
  }
];

export const getFallbackNewsData = (categories: string[], maxItems: number) => {
  const allNews = [
    {
      id: 'fallback-1',
      headline: 'Vault-Tec Security Protocols Updated',
      content: 'New security measures implemented across all Vault-Tec facilities. Personnel advised to update access credentials immediately.',
      category: 'security',
      priority: 'high',
      timestamp: new Date().toISOString(),
      source: 'VAULT-TEC SECURITY'
    },
    {
      id: 'fallback-2',
      headline: 'Radiation Monitoring Systems Online',
      content: 'All environmental sensors report normal radiation levels. Atmospheric conditions remain stable across monitored sectors.',
      category: 'wasteland', 
      priority: 'medium',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      source: 'ENV MONITOR'
    },
    {
      id: 'fallback-3',
      headline: 'System Maintenance Completed',
      content: 'Scheduled maintenance on primary systems has been completed successfully. All systems operating at optimal efficiency.',
      category: 'system',
      priority: 'low', 
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      source: 'SYSTEM CONTROL'
    },
    {
      id: 'fallback-4',
      headline: 'Research Archive Updated',
      content: 'Latest scientific findings have been archived in the central database. Clearance level 3 required for access.',
      category: 'vault',
      priority: 'medium',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      source: 'RESEARCH DIV'
    },
    {
      id: 'fallback-5',
      headline: 'Emergency Drills Scheduled',
      content: 'Quarterly emergency response drills will commence at 0800 hours. All personnel must report to designated stations.',
      category: 'security',
      priority: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'SAFETY DEPT'
    }
  ];

  // Filter by categories if specified
  let filteredNews = allNews;
  if (categories && categories.length > 0) {
    const categoryMap: Record<string, string> = {
      'general': 'wasteland',
      'science': 'vault',
      'politics': 'security', 
      'technology': 'system'
    };

    const falloutCategories = categories.map(cat => categoryMap[cat] || cat);
    filteredNews = allNews.filter(item => 
      falloutCategories.includes(item.category)
    );
  }

  return filteredNews.slice(0, maxItems || 10);
};