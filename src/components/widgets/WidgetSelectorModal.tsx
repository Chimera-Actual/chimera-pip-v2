import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid3X3, TestTube, Settings, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WidgetType {
  id: string;
  widget_type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  featured: boolean;
  default_settings: any;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadWidgetTypes();
    }
  }, [isOpen]);

  const loadWidgetTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('widget_catalog')
        .select('*')
        .order('featured', { ascending: false })
        .order('name');

      if (error) throw error;
      setWidgetTypes(data || []);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'communication':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'entertainment':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'testing':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-pip-bg-primary border-pip-border">
        <DialogHeader className="border-b border-pip-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-pip-text-bright font-pip-display text-xl pip-text-glow">
              Add Widget to {activeTab}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-pip-text-secondary hover:text-pip-text-bright"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-pip-text-secondary">Loading widgets...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgetTypes.map((widget) => (
                <Card
                  key={widget.id}
                  className="bg-pip-bg-secondary border-pip-border hover:border-primary transition-all duration-200 cursor-pointer group"
                  onClick={() => handleAddWidget(widget)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-pip-bg-tertiary border border-pip-border group-hover:border-primary transition-colors">
                          {getIconComponent(widget.icon)}
                        </div>
                        <div>
                          <CardTitle className="text-pip-text-bright font-pip-display text-sm">
                            {widget.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`text-xs mt-1 ${getCategoryColor(widget.category)}`}
                          >
                            {widget.category}
                          </Badge>
                        </div>
                      </div>
                      {widget.featured && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-pip-text-secondary font-pip-mono text-xs leading-relaxed">
                      {widget.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};