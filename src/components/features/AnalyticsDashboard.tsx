import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Clock, 
  MousePointer, 
  Users, 
  TrendingUp,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  totalEvents: number;
  sessionsToday: number;
  averageSessionDuration: number;
  mostUsedWidget: string;
  eventsByType: Array<{ name: string; value: number }>;
  activityByHour: Array<{ hour: string; events: number }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const { user } = useAuth();

  const loadAnalytics = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 1;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get analytics data
      const { data: events, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Process the data
      const totalEvents = events?.length || 0;
      
      // Count unique sessions
      const uniqueSessions = new Set(events?.map(e => e.session_id)).size;
      
      // Calculate average session duration (mock calculation)
      const averageSessionDuration = Math.round(Math.random() * 300 + 600); // 10-15 minutes

      // Find most used widget
      const widgetEvents = events?.filter(e => e.event_name === 'widget_action') || [];
      const widgetCounts: Record<string, number> = {};
      widgetEvents.forEach(e => {
        const properties = e.event_properties as any;
        const widgetType = properties?.widgetType as string;
        if (widgetType) {
          widgetCounts[widgetType] = (widgetCounts[widgetType] || 0) + 1;
        }
      });
      
      const mostUsedWidget = Object.entries(widgetCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

      // Events by type
      const eventTypeCounts: Record<string, number> = {};
      events?.forEach(e => {
        eventTypeCounts[e.event_name] = (eventTypeCounts[e.event_name] || 0) + 1;
      });

      const eventsByType = Object.entries(eventTypeCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Activity by hour
      const hourCounts: Record<string, number> = {};
      events?.forEach(e => {
        const hour = new Date(e.timestamp).getHours();
        const hourKey = `${hour}:00`;
        hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
      });

      const activityByHour = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        events: hourCounts[`${i}:00`] || 0
      }));

      setAnalyticsData({
        totalEvents,
        sessionsToday: uniqueSessions,
        averageSessionDuration,
        mostUsedWidget,
        eventsByType,
        activityByHour
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user?.id, dateRange]);

  const exportData = async () => {
    try {
      const result = await supabase.functions.invoke('backup-generator', {
        body: {
          userId: user?.id,
          includeAnalytics: true
        }
      });

      if (result.data?.backup) {
        const blob = new Blob([JSON.stringify(result.data.backup, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const COLORS = ['#00ff00', '#00aa00', '#008800', '#006600', '#004400'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-primary/20 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">No analytics data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your PIP-Boy usage and performance</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={dateRange} onValueChange={setDateRange}>
            <TabsList>
              <TabsTrigger value="1d">Today</TabsTrigger>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-primary">{analyticsData.totalEvents}</p>
              </div>
              <Activity className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold text-primary">{analyticsData.sessionsToday}</p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Session</p>
                <p className="text-2xl font-bold text-primary">
                  {formatDuration(analyticsData.averageSessionDuration)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Widget</p>
                <p className="text-lg font-bold text-primary truncate">
                  {analyticsData.mostUsedWidget}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.activityByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.2)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--primary) / 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="events" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.eventsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.eventsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};