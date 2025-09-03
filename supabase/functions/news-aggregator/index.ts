import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const newsApiKey = Deno.env.get('NEWS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categories = ['general'], maxItems = 10, country = 'us' } = await req.json();
    
    console.log(`Fetching news for categories: ${categories.join(', ')}`);

    const newsItems = [];

    // Fetch news from NewsAPI for each category
    for (const category of categories) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=${Math.ceil(maxItems / categories.length)}&apiKey=${newsApiKey}`
        );

        if (response.ok) {
          const data = await response.json();
          
          const formattedArticles = data.articles.map((article: any) => ({
            id: `${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            headline: article.title,
            content: article.description || article.content?.substring(0, 200) + '...' || 'No content available',
            category: mapCategoryToFallout(category),
            priority: determinePriority(article.title, article.description),
            timestamp: new Date(article.publishedAt),
            source: article.source.name,
            url: article.url,
            imageUrl: article.urlToImage
          }));

          newsItems.push(...formattedArticles);
        }
      } catch (error) {
        console.error(`Error fetching ${category} news:`, error);
      }
    }

    // Sort by timestamp (newest first) and limit results
    const sortedNews = newsItems
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxItems);

    console.log(`Successfully fetched ${sortedNews.length} news items`);

    return new Response(JSON.stringify({ 
      news: sortedNews,
      lastUpdated: new Date().toISOString(),
      totalItems: sortedNews.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in news-aggregator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mapCategoryToFallout(category: string): 'wasteland' | 'vault' | 'security' | 'system' {
  switch (category) {
    case 'general':
    case 'entertainment':
      return 'wasteland';
    case 'science':
    case 'technology':
      return 'vault';
    case 'politics':
    case 'health':
      return 'security';
    default:
      return 'system';
  }
}

function determinePriority(title: string, description: string): 'low' | 'medium' | 'high' | 'critical' {
  const text = (title + ' ' + (description || '')).toLowerCase();
  
  if (text.includes('breaking') || text.includes('urgent') || text.includes('emergency')) {
    return 'critical';
  } else if (text.includes('alert') || text.includes('warning') || text.includes('crisis')) {
    return 'high';
  } else if (text.includes('important') || text.includes('major')) {
    return 'medium';
  }
  
  return 'low';
}