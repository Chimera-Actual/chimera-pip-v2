import React, { useState, useEffect } from 'react';
import { useWidgetManager, UserWidget } from '@/hooks/useWidgetManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3X3, TestTube, Settings } from 'lucide-react';

interface CanvasIntegrationProps {
  tab: string;
  className?: string;
  onDoubleClick?: () => void;
}

export const CanvasIntegration: React.FC<CanvasIntegrationProps> = ({ tab, className, onDoubleClick }) => {
  const { getTabWidgets } = useWidgetManager();
  const [widgets, setWidgets] = useState<UserWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWidgets = async () => {
      setIsLoading(true);
      const tabWidgets = await getTabWidgets(tab);
      setWidgets(tabWidgets);
      setIsLoading(false);
    };

    loadWidgets();
  }, [tab, getTabWidgets]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Grid3X3':
        return <Grid3X3 className="w-6 h-6" />;
      case 'TestTube':
        return <TestTube className="w-6 h-6" />;
      case 'Settings':
        return <Settings className="w-6 h-6" />;
      default:
        return <Grid3X3 className="w-6 h-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`canvas-integration ${className || ''}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-pip-text-secondary">Loading widgets...</div>
          </div>
        </div>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div 
        className={`canvas-integration ${className || ''}`}
        onDoubleClick={onDoubleClick}
      >
        <div className="flex items-center justify-center h-96 border-2 border-dashed border-pip-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {tab} Content Area
            </h3>
            <p className="text-muted-foreground">
              Double-click to add widgets or use the gear menu
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`canvas-integration ${className || ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map((widget) => (
          <Card
            key={widget.id}
            className="bg-pip-bg-secondary border-pip-border hover:border-primary/50 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pip-bg-tertiary border border-pip-border">
                  {getIconComponent('TestTube')}
                </div>
                <div>
                  <CardTitle className="text-pip-text-bright font-pip-display text-sm">
                    {widget.widget_config?.title || widget.widget_type}
                  </CardTitle>
                  <CardDescription className="text-pip-text-secondary font-pip-mono text-xs">
                    {widget.widget_type}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-pip-text-secondary font-pip-mono text-xs">
                <div>Color: {widget.widget_config?.colorValue || 'N/A'}</div>
                <div>Text: {widget.widget_config?.textInput || 'N/A'}</div>
                <div>Number: {widget.widget_config?.numberInput || 0}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Add Widget Area */}
      <div 
        className="mt-4 border-2 border-dashed border-pip-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors text-center"
        onDoubleClick={onDoubleClick}
      >
        <p className="text-pip-text-secondary font-pip-mono text-sm">
          Double-click to add more widgets
        </p>
      </div>
    </div>
  );
};