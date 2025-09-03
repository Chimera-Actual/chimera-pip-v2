import { memo, useState, useEffect } from 'react';
import { BaseWidget, NewsTerminalSettings } from '@/types/widgets';
import { WidgetContainer } from './WidgetContainer';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Radio, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NewsTerminalWidgetProps {
  widget: BaseWidget;
}

interface NewsItem {
  id: string;
  headline: string;
  content: string;
  category: 'wasteland' | 'vault' | 'security' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string;
  url?: string;
  imageUrl?: string;
}

// Fetch real news data from API
const fetchNewsData = async (categories: string[], maxItems: number): Promise<NewsItem[]> => {
  const { data, error } = await supabase.functions.invoke('news-aggregator', {
    body: { categories, maxItems, country: 'us' }
  });

  if (error) {
    console.error('News API error:', error);
    throw new Error('Failed to fetch news data');
  }

  return data.news.map((item: any) => ({
    ...item,
    timestamp: new Date(item.timestamp)
  }));
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'security': return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'system': return 'bg-pip-accent/20 text-pip-accent border-pip-accent/30';
    case 'vault': return 'bg-pip-primary/20 text-pip-primary border-pip-primary/30';
    case 'wasteland': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-pip-text-muted/20 text-pip-text-muted border-pip-text-muted/30';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical': return <AlertTriangle className="h-3 w-3 text-destructive" />;
    case 'high': return <AlertTriangle className="h-3 w-3 text-orange-400" />;
    case 'medium': return <Radio className="h-3 w-3 text-pip-accent" />;
    default: return <Radio className="h-3 w-3 text-pip-text-muted" />;
  }
};

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffHours >= 1) {
    return `${diffHours}h ago`;
  } else if (diffMins >= 1) {
    return `${diffMins}m ago`;
  } else {
    return 'Just now';
  }
};

export const NewsTerminalWidget: React.FC<NewsTerminalWidgetProps> = memo(({ widget }) => {
  const { settings, setSettings, collapsed, setCollapsed, isLoading: hookLoading, error: hookError } = useWidgetState(
    widget.id,
    widget.settings as NewsTerminalSettings
  );

  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    if (!settings?.categories || settings.categories.length === 0) {
      setError('No news categories selected in widget settings');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Map fallout categories to real news categories
      const realCategories = settings.categories.map(cat => {
        switch(cat) {
          case 'wasteland': return 'general';
          case 'vault': return 'science';
          case 'security': return 'politics';
          case 'system': return 'technology';
          default: return 'general';
        }
      });

      const data = await fetchNewsData(realCategories, settings.maxItems || 10);
      setNewsItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchNews();
  }, [settings?.categories, settings?.maxItems]);

  // Auto-refresh logic
  useEffect(() => {
    if (!settings?.autoRefresh || !settings?.refreshInterval) return;

    const interval = setInterval(fetchNews, settings.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [settings?.autoRefresh, settings?.refreshInterval]);

  if (isLoading && newsItems.length === 0) {
    return (
      <WidgetContainer
        widgetId={widget.id}
        widgetType={widget.type}
        title={widget.title}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onSettingsChange={() => {}}
        onDelete={() => {}}
        isLoading={true}
      >
        <div />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer
      widgetId={widget.id}
      widgetType={widget.type}
      title={widget.title}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      onSettingsChange={() => {}}
      onDelete={() => {}}
      error={error || hookError}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-pip-text-muted flex items-center gap-1">
            <Radio className="h-3 w-3" />
            TERMINAL ACTIVE
          </span>
          {settings?.autoRefresh && (
            <span className="text-pip-accent animate-pulse">
              AUTO-REFRESH: {settings.refreshInterval}s
            </span>
          )}
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-3">
            {newsItems.map((item) => (
              <Card key={item.id} className="border-pip-border bg-pip-bg-secondary/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(item.priority)}
                      <Badge 
                        variant="outline" 
                        className={`${getCategoryColor(item.category)} text-xs font-mono`}
                      >
                        {item.category.toUpperCase()}
                      </Badge>
                    </div>
                    {settings?.showTimestamps && (
                      <div className="flex items-center gap-1 text-xs text-pip-text-muted">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(item.timestamp)}
                      </div>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-semibold text-pip-text mb-1 font-mono">
                    {item.headline}
                  </h4>
                  
                  <p className="text-xs text-pip-text-secondary leading-relaxed mb-2">
                    {item.content}
                  </p>
                  
                  <div className="text-xs text-pip-text-muted font-mono">
                    SOURCE: {item.source}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center text-xs text-pip-text-muted pt-2 border-t border-pip-border">
          <span>{newsItems.length} messages</span>
          <span className="animate-pulse">● LIVE</span>
        </div>
      </div>
    </WidgetContainer>
  );
});

NewsTerminalWidget.displayName = 'NewsTerminalWidget';