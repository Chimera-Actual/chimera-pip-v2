import React, { useState, useEffect } from 'react';
import { useWidgetManager, UserWidget } from '@/hooks/useWidgetManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3X3, TestTube, Settings } from 'lucide-react';
import { WidgetControlButtons } from '@/components/widgets/WidgetControlButtons';
import { WidgetInstanceSettingsModal } from '@/components/widgets/WidgetInstanceSettingsModal';
import { StandardWidgetTemplate } from '@/components/widgets/templates/WidgetTemplate';
import { TestWidget } from '@/components/widgets/TestWidget';
import { AtomicClockWidget } from '@/components/widgets/AtomicClockWidget';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { iconMapping } from '@/utils/iconMapping';

// Widget descriptions mapping
const widgetDescriptions: Record<string, string> = {
  'test_widget': 'A simple test widget for demonstration purposes',
  'atomic_clock': 'Multi-timezone atomic clock with alarms, themes, and retro visual effects',
  // Add more widget descriptions as needed
};

interface CanvasIntegrationProps {
  tab: string;
  className?: string;
  onDoubleClick?: () => void;
}

export const CanvasIntegration: React.FC<CanvasIntegrationProps> = ({ tab, className, onDoubleClick }) => {
  const { getTabWidgets, deleteWidget, updateWidget } = useWidgetManager();
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<UserWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsWidget, setSettingsWidget] = useState<UserWidget | null>(null);

  const loadWidgets = async () => {
    setIsLoading(true);
    const tabWidgets = await getTabWidgets(tab);
    setWidgets(tabWidgets);
    setIsLoading(false);
  };

  useEffect(() => {
    loadWidgets();
  }, [tab, getTabWidgets]);

  const handleCloseWidget = async (widgetId: string) => {
    const success = await deleteWidget(widgetId);
    if (success) {
      loadWidgets();
    }
  };

  const handleToggleCollapse = async (widget: UserWidget) => {
    const success = await updateWidget(widget.id, { 
      is_collapsed: !widget.is_collapsed 
    });
    if (success) {
      loadWidgets();
      toast({
        title: widget.is_collapsed ? "Widget Expanded" : "Widget Collapsed",
        description: `${widget.widget_config?.title || widget.widget_type} has been ${widget.is_collapsed ? 'expanded' : 'collapsed'}`,
      });
    }
  };

  const handleToggleFullWidth = async (widget: UserWidget) => {
    const currentConfig = widget.widget_config || {};
    const success = await updateWidget(widget.id, { 
      widget_config: { 
        ...currentConfig, 
        fullWidth: !currentConfig.fullWidth 
      } 
    });
    if (success) {
      loadWidgets();
      toast({
        title: currentConfig.fullWidth ? "Normal Width" : "Full Width",
        description: `${widget.widget_config?.title || widget.widget_type} width has been ${currentConfig.fullWidth ? 'restored' : 'expanded'}`,
      });
    }
  };

  const handleSettings = (widget: UserWidget) => {
    setSettingsWidget(widget);
  };

  const handleSaveSettings = async (widgetId: string, config: any) => {
    const success = await updateWidget(widgetId, { widget_config: config });
    if (success) {
      loadWidgets();
      toast({
        title: "Settings Updated",
        description: "Widget settings have been saved successfully",
      });
    }
  };

  const getIconComponent = (widget: UserWidget) => {
    const iconName = widget.widget_config?.icon || 'TestTube';
    const IconComponent = iconMapping[iconName as keyof typeof iconMapping] || TestTube;
    return <IconComponent className="w-6 h-6" />;
  };

  const renderWidgetContent = (widget: UserWidget) => {
    const normalizedType = (widget.widget_type || '').toLowerCase().replace(/[^a-z]/g, '');
    switch (normalizedType) {
      case 'test':
      case 'testwidget':
        return (
          <TestWidget
            title={widget.widget_config?.title || 'Test Widget'}
            settings={widget.widget_config || {}}
            onSettingsChange={(settings) => handleSaveSettings(widget.id, settings)}
            widget={widget}
            onRemove={() => handleCloseWidget(widget.id)}
            onToggleCollapse={() => handleToggleCollapse(widget)}
            onToggleFullWidth={() => handleToggleFullWidth(widget)}
            onOpenSettings={() => handleSettings(widget)}
          />
        );
      case 'atomicclock':
      case 'clockwidget':
        return (
          <AtomicClockWidget
            title={widget.widget_config?.title || 'Atomic Clock'}
            settings={widget.widget_config || {}}
            onSettingsChange={(settings) => handleSaveSettings(widget.id, settings)}
            widgetId={widget.id}
            widget={widget}
            onRemove={() => handleCloseWidget(widget.id)}
            onToggleCollapse={() => handleToggleCollapse(widget)}
            onToggleFullWidth={() => handleToggleFullWidth(widget)}
            onOpenSettings={() => handleSettings(widget)}
          />
        );
      default:
        return (
          <ScrollArea className="h-48">
            <div className="p-6">
              <div className="space-y-2 text-pip-text-secondary font-pip-mono text-xs">
                <div>Color: {widget.widget_config?.colorValue || 'N/A'}</div>
                <div>Text: {widget.widget_config?.textInput || 'N/A'}</div>
                <div>Number: {widget.widget_config?.numberInput || 0}</div>
              </div>
            </div>
          </ScrollArea>
        );
    }
  };

  if (isLoading) {
    return (
      <div className={`canvas-integration relative h-full ${className || ''}`} onDoubleClick={onDoubleClick}>
        <div className="flex items-center justify-center h-full">
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
        className={`canvas-integration relative h-full ${className || ''}`}
        onDoubleClick={onDoubleClick}
      >
        <div className="flex items-center justify-center h-full border-2 border-dashed border-pip-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-center">
            <div className="text-pip-text-secondary mb-2">No widgets in this tab</div>
            <div className="text-xs text-pip-text-muted">Double-click to add a widget</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`canvas-integration relative h-full overflow-auto ${className || ''}`} onDoubleClick={onDoubleClick}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max content-start p-4">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`relative group ${
              widget.widget_config?.fullWidth ? 'md:col-span-2' : ''
            } ${widget.is_collapsed ? 'min-h-[80px]' : 'min-h-[200px]'}`}
          >
            <StandardWidgetTemplate
              widget={widget}
              onRemove={() => handleCloseWidget(widget.id)}
              onToggleCollapse={() => handleToggleCollapse(widget)}
              onToggleFullWidth={() => handleToggleFullWidth(widget)}
              onOpenSettings={() => handleSettings(widget)}
              showStandardControls={true}
            >
              {renderWidgetContent(widget)}
            </StandardWidgetTemplate>
          </div>
        ))}
      </div>

      {/* Widget Instance Settings Modal */}
      <WidgetInstanceSettingsModal
        open={!!settingsWidget}
        onClose={() => setSettingsWidget(null)}
        widget={settingsWidget}
        onSave={handleSaveSettings}
      />
    </div>
  );
};