import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid3X3, TestTube, Settings, X, SettingsIcon, Tag, CloudSun, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useWidgetTags } from '@/hooks/useWidgetTags';

interface WidgetType {
  id: string;
  widget_type: string;
  name: string;
  description: string;
  icon: string;
  default_settings: any;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

interface WidgetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: string, settings: any) => void;
  activeTab: string;
}

export const WidgetSelectorModal: React.FC<WidgetSelectorModalProps> = ({
  isOpen,
  onClose,
  onAddWidget,
  activeTab
}) => {
  const [widgetTypes, setWidgetTypes] = useState<WidgetType[]>([]);
  const [widgetTags, setWidgetTags] = useState<{ [widgetType: string]: any[] }>({});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { getWidgetTags } = useWidgetTags();

  useEffect(() => {
    if (isOpen) {
      loadWidgetTypes();
    }
  }, [isOpen]);

  const loadWidgetTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('widget_catalog')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const widgets = data || [];
      setWidgetTypes(widgets);

      // Load tags for each widget type
      const tagsMap: { [widgetType: string]: any[] } = {};
      for (const widget of widgets) {
        const tags = await getWidgetTags(widget.widget_type);
        tagsMap[widget.widget_type] = tags;
      }
      setWidgetTags(tagsMap);

    } catch (error) {
      console.error('Error loading widget types:', error);
      toast({
        title: "Error",
        description: "Failed to load widget types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWidget = (widgetType: WidgetType) => {
    onAddWidget(widgetType.widget_type, widgetType.default_settings);
    onClose();
  };

  const handleShowSettings = (e: React.MouseEvent, widgetType: WidgetType) => {
    e.stopPropagation();
    // TODO: Implement widget type settings modal
    if (import.meta.env.DEV) {
      console.log('Settings for widget type:', widgetType);
    }
  };

  const handleSettingsSaved = () => {
    loadWidgetTypes(); // Refresh the widget list
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Grid3X3':
        return <Grid3X3 className="w-6 h-6" />;
      case 'TestTube':
        return <TestTube className="w-6 h-6" />;
      case 'Settings':
        return <Settings className="w-6 h-6" />;
      case 'CloudSun':
        return <CloudSun className="w-6 h-6" />;
      case 'Clock':
        return <Clock className="w-6 h-6" />;
      default:
        return <Grid3X3 className="w-6 h-6" />;
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] bg-pip-bg-primary border-pip-border"
        aria-labelledby="widget-selector-title"
        aria-describedby="widget-selector-description"
      >
        <DialogHeader className="border-b border-pip-border pb-4">
          <DialogTitle 
            id="widget-selector-title"
            className="text-pip-text-bright font-pip-display text-xl pip-text-glow"
          >
            Add Widget to {activeTab}
          </DialogTitle>
          <p 
            id="widget-selector-description"
            className="text-pip-text-muted font-pip-mono text-sm sr-only"
          >
            Select from the available widgets below to add to your current tab
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-pip-text-secondary">Loading widgets...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgetTypes.map((widget) => {
                const tags = widgetTags[widget.widget_type] || [];
                
                return (
                  <Card
                    key={widget.id}
                    className="bg-pip-bg-secondary border-pip-border hover:border-primary transition-all duration-200 cursor-pointer group relative"
                    onClick={() => handleAddWidget(widget)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Add ${widget.name} widget: ${widget.description}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAddWidget(widget);
                      }
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-pip-bg-tertiary border border-pip-border group-hover:border-primary transition-colors">
                            {getIconComponent(widget.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-pip-text-bright font-pip-display text-sm truncate">
                                {widget.name}
                              </CardTitle>
                              {widget.user_id && (
                                <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30 shrink-0">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              {tags.slice(0, 2).map((tag: any) => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-xs"
                                style={{ 
                                  borderColor: tag.color,
                                  color: tag.color,
                                  backgroundColor: `${tag.color}20`
                                }}
                                aria-label={`Tag: ${tag.name}`}
                              >
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tag.name}
                                </Badge>
                              ))}
                              {tags.length > 2 && (
                                <Badge variant="outline" className="text-xs text-pip-text-secondary">
                                  +{tags.length - 2}
                                </Badge>
                              )}
                              {tags.length === 0 && (
                                <Badge variant="outline" className="text-xs text-pip-text-secondary border-pip-border">
                                  No tags
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Settings Button - Top Right */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleShowSettings(e, widget)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-pip-text-secondary hover:text-pip-text-bright shrink-0"
                          title="Widget Settings"
                          aria-label={`Configure ${widget.name} widget settings`}
                        >
                          <SettingsIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-pip-text-secondary font-pip-mono text-xs leading-relaxed">
                        {widget.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};