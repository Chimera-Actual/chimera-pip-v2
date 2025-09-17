import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Plus, Grid3X3 } from 'lucide-react';

interface WidgetAppDrawerProps {
  onAddWidget?: () => void;
}

export const WidgetAppDrawer: React.FC<WidgetAppDrawerProps> = ({ onAddWidget }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const availableWidgets = [
    { 
      type: 'Test Widget', 
      description: 'Testing and debugging widget',
      icon: '🧪'
    },
    { 
      type: 'Analytics', 
      description: 'Data visualization and metrics',
      icon: '📊'
    },
    { 
      type: 'Weather', 
      description: 'Current weather conditions',
      icon: '🌤️'
    },
    { 
      type: 'Notes', 
      description: 'Quick notes and reminders',
      icon: '📝'
    },
    { 
      type: 'Calendar', 
      description: 'Schedule and events',
      icon: '📅'
    },
    { 
      type: 'System Monitor', 
      description: 'System performance metrics',
      icon: '⚡'
    }
  ];

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-pip-bg-primary/95 backdrop-blur-sm border-r border-pip-border transition-all duration-300 z-50 ${
        isCollapsed ? 'w-12' : 'w-80'
      }`}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-4 h-6 w-6 rounded-full bg-pip-bg-secondary border border-pip-border hover:bg-pip-bg-tertiary"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Header */}
      {!isCollapsed && (
        <div className="p-4 border-b border-pip-border">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-pip-text-bright" />
            <h2 className="text-lg font-pip-display font-bold text-pip-text-bright">
              Widget Library
            </h2>
          </div>
          <p className="text-xs text-pip-text-secondary font-pip-mono mt-1">
            Available widgets to add
          </p>
        </div>
      )}

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="p-2 pt-16">
          <div className="flex flex-col items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-pip-text-bright" />
            <div className="w-6 h-px bg-pip-border"></div>
          </div>
        </div>
      )}

      {/* Content */}
      {!isCollapsed && (
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {/* Quick Add Button */}
            <Button
              onClick={onAddWidget}
              className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            >
              <Plus className="h-4 w-4" />
              Quick Add Widget
            </Button>

            {/* Available Widgets */}
            <div className="space-y-2">
              <h3 className="text-sm font-pip-display font-semibold text-pip-text-bright mb-2">
                Available Widgets
              </h3>
              {availableWidgets.map((widget, index) => (
                <Card 
                  key={index}
                  className="bg-pip-bg-secondary/50 border-pip-border hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <CardHeader className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{widget.icon}</span>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xs font-pip-display text-pip-text-bright truncate">
                          {widget.type}
                        </CardTitle>
                        <p className="text-xs text-pip-text-secondary font-pip-mono mt-1 truncate">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Widget Categories */}
            <div className="mt-6">
              <h3 className="text-sm font-pip-display font-semibold text-pip-text-bright mb-2">
                Categories
              </h3>
              <div className="space-y-1">
                {['Productivity', 'Analytics', 'Entertainment', 'System', 'Custom'].map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs font-pip-mono text-pip-text-secondary hover:text-pip-text-bright hover:bg-pip-bg-tertiary"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
};