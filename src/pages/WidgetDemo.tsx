import React, { useState } from 'react';
import { useTheme, PipBoyTheme } from '@/contexts/ThemeContext';
import { WidgetFactory } from '@/lib/widgetFactory';
import { CharacterProfileWidget } from '@/components/widgets/CharacterProfileWidget';
import { SpecialStatsWidget } from '@/components/widgets/SpecialStatsWidget';
import { SystemMonitorWidget } from '@/components/widgets/SystemMonitorWidget';
import { WeatherStationWidget } from '@/components/widgets/WeatherStationWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Palette, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const WidgetDemo: React.FC = () => {
  const { currentTheme, setTheme, soundEnabled, toggleSound } = useTheme();
  
  // Generate demo widgets with mock data
  const mockWidgets = [
    WidgetFactory.createWidget('character-profile', 'demo-user', 'STAT'),
    WidgetFactory.createWidget('special-stats', 'demo-user', 'STAT'),
    {
      ...WidgetFactory.createWidget('system-monitor', 'demo-user', 'STAT'),
      settings: { 
        refreshRate: 2000, 
        showGraphs: true, 
        monitoredMetrics: ['cpu', 'memory', 'network', 'storage'],
        alertThresholds: { cpu: 80, memory: 85, network: 90, storage: 95 }
      }
    },
    WidgetFactory.createWidget('weather-station', 'demo-user', 'DATA')
  ];

  const themes: { value: PipBoyTheme; label: string; color: string }[] = [
    { value: 'green', label: 'Classic Green', color: 'hsl(var(--pip-green-primary))' },
    { value: 'amber', label: 'Amber', color: 'hsl(45 100% 55%)' },
    { value: 'blue', label: 'Blue', color: 'hsl(207 100% 55%)' },
    { value: 'red', label: 'Red', color: 'hsl(0 100% 55%)' },
    { value: 'white', label: 'White', color: 'hsl(var(--pip-text-bright))' }
  ];

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'character-profile':
        return <CharacterProfileWidget key={widget.id} widget={widget} />;
      case 'special-stats':
        return <SpecialStatsWidget key={widget.id} widget={widget} />;
      case 'system-monitor':
        return <SystemMonitorWidget key={widget.id} widget={widget} />;
      case 'weather-station':
        return <WeatherStationWidget key={widget.id} widget={widget} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-pip-bg-primary pip-scanlines relative">
      {/* Demo Header */}
      <div className="sticky top-0 z-10 bg-pip-bg-primary/95 backdrop-blur-sm border-b border-pip-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="hover:bg-pip-green-primary/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
                  CHIMERA-PIP 4000 mk2
                </h1>
                <p className="text-sm text-pip-text-muted font-pip-mono">
                  Widget System Demonstration
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Selector */}
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-pip-green-primary" />
                <Select value={currentTheme} onValueChange={(value: PipBoyTheme) => setTheme(value)}>
                  <SelectTrigger className="w-40 bg-pip-bg-secondary border-pip-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full border border-pip-border/50" 
                            style={{ backgroundColor: theme.color }}
                          />
                          <span>{theme.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sound Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                className="hover:bg-pip-green-primary/20"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-pip-green-primary" />
                ) : (
                  <VolumeX className="h-4 w-4 text-pip-text-muted" />
                )}
              </Button>

              {/* Current Theme Badge */}
              <Badge variant="outline" className="border-pip-border text-pip-text-bright">
                {themes.find(t => t.value === currentTheme)?.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Demo Info Card */}
        <Card className="mb-8 pip-terminal border-pip-border-bright/30">
          <CardHeader>
            <CardTitle className="text-pip-text-bright font-pip-display">
              Interactive Widget Showcase
            </CardTitle>
            <CardDescription className="text-pip-text-secondary font-pip-mono">
              Experience all four essential widgets with live data simulation. 
              Try switching themes and interacting with widget controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="pip-special-stat p-3">
                <div className="text-sm font-pip-mono text-pip-text-muted mb-1">WIDGETS</div>
                <div className="text-xl font-pip-display font-bold text-primary">4</div>
              </div>
              <div className="pip-special-stat p-3">
                <div className="text-sm font-pip-mono text-pip-text-muted mb-1">THEMES</div>
                <div className="text-xl font-pip-display font-bold text-primary">5</div>
              </div>
              <div className="pip-special-stat p-3">
                <div className="text-sm font-pip-mono text-pip-text-muted mb-1">RESPONSIVE</div>
                <div className="text-xl font-pip-display font-bold text-primary">✓</div>
              </div>
              <div className="pip-special-stat p-3">
                <div className="text-sm font-pip-mono text-pip-text-muted mb-1">LIVE DATA</div>
                <div className="text-xl font-pip-display font-bold text-primary">✓</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widgets Grid */}
        <div className="widgets-grid grid gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {mockWidgets.map(renderWidget)}
        </div>

        {/* Demo Instructions */}
        <Card className="mt-8 pip-terminal border-pip-border-bright/30">
          <CardHeader>
            <CardTitle className="text-pip-text-bright font-pip-display">
              Demo Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-pip-text-secondary font-pip-mono text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h4 className="text-pip-text-bright mb-2">Widget Interactions:</h4>
                <ul className="space-y-1">
                  <li>• Click arrow to collapse/expand widgets</li>
                  <li>• Hover over S.P.E.C.I.A.L. stats for tooltips</li>
                  <li>• System Monitor shows real-time simulation</li>
                  <li>• Weather data updates automatically</li>
                </ul>
              </div>
              <div>
                <h4 className="text-pip-text-bright mb-2">Theme Features:</h4>
                <ul className="space-y-1">
                  <li>• 5 authentic Pip-Boy color themes</li>
                  <li>• Persistent theme selection</li>
                  <li>• Smooth color transitions</li>
                  <li>• Mobile-responsive design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WidgetDemo;