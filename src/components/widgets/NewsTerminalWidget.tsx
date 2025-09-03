import { memo, useState, useEffect } from 'react';
import { BaseWidget, NewsTerminalSettings } from '@/types/widgets';
import { WidgetContainer } from './WidgetContainer';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Radio, AlertTriangle } from 'lucide-react';

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
}

const mockNewsItems: NewsItem[] = [
  {
    id: '1',
    headline: 'Vault Security Status: All Clear',
    content: 'All vault systems operating within normal parameters. No security breaches detected in the last 24 hours.',
    category: 'security',
    priority: 'low',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    source: 'VAULT-SEC'
  },
  {
    id: '2',
    headline: 'Water Purification System Maintenance',
    content: 'Scheduled maintenance on water purification systems completed successfully. Water quality remains excellent.',
    category: 'system',
    priority: 'medium',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    source: 'MAINT-SYS'
  },
  {
    id: '3',
    headline: 'New Wasteland Radio Transmission Detected',
    content: 'Long-range communications detected from settlement Delta-7. Signal strength increasing.',
    category: 'wasteland',
    priority: 'medium',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    source: 'COMM-NET'
  },
  {
    id: '4',
    headline: 'Power Grid Optimization Complete',
    content: 'Fusion reactor efficiency increased by 3.2%. Estimated power surplus for next 47 years.',
    category: 'system',
    priority: 'high',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    source: 'PWR-MGMT'
  },
  {
    id: '5',
    headline: 'Radiation Storm Warning - Sector 12',
    content: 'Elevated radiation levels detected in external sector 12. All surface operations postponed.',
    category: 'wasteland',
    priority: 'critical',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    source: 'RAD-MON'
  }
];

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
  const { settings, setSettings, collapsed, setCollapsed, isLoading, error } = useWidgetState(
    widget.id,
    widget.settings as NewsTerminalSettings
  );

  const [filteredNews, setFilteredNews] = useState<NewsItem[]>(mockNewsItems);

  useEffect(() => {
    if (settings) {
      let filtered = mockNewsItems;

      // Apply category filter
      if (settings.categories?.length > 0) {
        filtered = filtered.filter(item => settings.categories.includes(item.category));
      }

      // Apply max items limit
      if (settings.maxItems) {
        filtered = filtered.slice(0, settings.maxItems);
      }

      // Sort by timestamp (newest first)
      filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setFilteredNews(filtered);
    }
  }, [settings]);

  // Auto-refresh logic
  useEffect(() => {
    if (!settings?.autoRefresh || !settings?.refreshInterval) return;

    const interval = setInterval(() => {
      // In a real app, this would fetch new news items
      console.log('Auto-refreshing news...');
    }, settings.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [settings?.autoRefresh, settings?.refreshInterval]);

  if (isLoading) {
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
      error={error}
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
            {filteredNews.map((item) => (
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
          <span>{filteredNews.length} messages</span>
          <span className="animate-pulse">● LIVE</span>
        </div>
      </div>
    </WidgetContainer>
  );
});

NewsTerminalWidget.displayName = 'NewsTerminalWidget';