import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cloud, Newspaper, Mail, MessageSquare, Calendar, Brain, TrendingUp } from 'lucide-react';

const weatherData = {
  temperature: 72,
  condition: 'Partly Cloudy',
  humidity: 45,
  radiation: 'Minimal',
  airQuality: 'Good'
};

const newsItems = [
  { title: 'New CHIMERA-TEC Technology Breakthrough', source: 'Tech News', time: '2h ago' },
  { title: 'Wasteland Weather Patterns Analysis', source: 'Science Journal', time: '4h ago' },
  { title: 'Communication Network Expansion', source: 'Network News', time: '6h ago' },
];

const communications = [
  { type: 'email', count: 7, unread: 3, label: 'Email' },
  { type: 'messages', count: 23, unread: 5, label: 'Messages' },
  { type: 'notifications', count: 12, unread: 8, label: 'Alerts' },
];

export const DataTab = memo(() => {
  return (
    <div className="space-y-6">
      {/* Weather Station */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Cloud className="h-5 w-5" />
            <span>Environmental Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-xs text-pip-text-muted font-pip-mono">TEMP</div>
              <div className="text-2xl font-pip-display font-bold text-primary pip-text-glow">{weatherData.temperature}°F</div>
            </div>
            <div>
              <div className="text-xs text-pip-text-muted font-pip-mono">CONDITION</div>
              <div className="text-sm font-pip-mono text-pip-text-secondary">{weatherData.condition}</div>
            </div>
            <div>
              <div className="text-xs text-pip-text-muted font-pip-mono">HUMIDITY</div>
              <div className="text-xl font-pip-display font-bold text-primary">{weatherData.humidity}%</div>
            </div>
            <div>
              <div className="text-xs text-pip-text-muted font-pip-mono">RADIATION</div>
              <div className="text-sm font-pip-mono text-pip-green-secondary">{weatherData.radiation}</div>
            </div>
            <div>
              <div className="text-xs text-pip-text-muted font-pip-mono">AIR QUALITY</div>
              <div className="text-sm font-pip-mono text-pip-green-secondary">{weatherData.airQuality}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Terminal */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Newspaper className="h-5 w-5" />
            <span>News Terminal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {newsItems.map((news, index) => (
              <div key={`${news.title}-${index}`} className="flex items-start justify-between p-3 rounded border border-pip-border bg-pip-bg-secondary/50 hover:border-primary/40 transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="font-pip-mono text-pip-text-bright hover:text-primary transition-colors">
                    {news.title}
                  </div>
                  <div className="text-xs text-pip-text-muted font-pip-mono mt-1">
                    {news.source} • {news.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 font-pip-display">
            VIEW ALL NEWS
          </Button>
        </CardContent>
      </Card>

      {/* Communications Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {communications.map((comm) => (
          <Card key={comm.type} className="pip-widget">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-pip-text-bright font-pip-display">
                <span className="flex items-center space-x-2">
                  {comm.type === 'email' && <Mail className="h-4 w-4" />}
                  {comm.type === 'messages' && <MessageSquare className="h-4 w-4" />}
                  {comm.type === 'notifications' && <TrendingUp className="h-4 w-4" />}
                  <span>{comm.label}</span>
                </span>
                {comm.unread > 0 && (
                  <Badge variant="default" className="text-xs">
                    {comm.unread}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-pip-display font-bold text-primary pip-text-glow">
                  {comm.count}
                </div>
                <div className="text-xs text-pip-text-muted font-pip-mono">
                  Total Items
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 font-pip-mono">
                OPEN
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission Control & AI Oracle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="pip-widget">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
              <Calendar className="h-5 w-5" />
              <span>Mission Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-lg font-pip-display font-semibold text-primary">Today's Schedule</div>
                <div className="text-xs text-pip-text-muted font-pip-mono">3 tasks pending</div>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded bg-pip-bg-secondary/50 border border-pip-border">
                  <div className="text-sm font-pip-mono text-pip-text-bright">System Maintenance</div>
                  <div className="text-xs text-pip-text-muted">Due: 14:00</div>
                </div>
                <div className="p-2 rounded bg-pip-bg-secondary/50 border border-pip-border">
                  <div className="text-sm font-pip-mono text-pip-text-bright">Data Backup</div>
                  <div className="text-xs text-pip-text-muted">Due: 18:30</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pip-widget">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
              <Brain className="h-5 w-5" />
              <span>AI Oracle</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-lg font-pip-display font-semibold text-primary pip-text-glow">
                  CODSWORTH v2.1
                </div>
                <div className="text-xs text-pip-text-muted font-pip-mono">Assistant Status: Active</div>
              </div>
              <div className="p-3 rounded bg-pip-bg-secondary/50 border border-pip-border">
                <div className="text-sm font-pip-mono text-pip-text-bright">
                  "Good day, Sir! All systems are operating within normal parameters. 
                  Shall I prepare your daily productivity report?"
                </div>
              </div>
              <Button variant="default" className="w-full font-pip-display">
                INTERACT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});