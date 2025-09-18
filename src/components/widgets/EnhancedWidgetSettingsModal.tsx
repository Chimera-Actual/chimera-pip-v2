import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconSelectionModal } from '@/components/ui/IconSelectionModal';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { getTabIcon } from '@/utils/iconMapping';
import type { UserWidget } from '@/hooks/useWidgetManager';
import { cn } from '@/lib/utils';

interface EnhancedWidgetSettingsModalProps {
  open: boolean;
  onClose: () => void;
  widget: UserWidget | null;
  onSave: (widgetId: string, config: any) => void;
}

export const EnhancedWidgetSettingsModal: React.FC<EnhancedWidgetSettingsModalProps> = ({
  open,
  onClose,
  widget,
  onSave,
}) => {
  const [config, setConfig] = useState<any>({});
  const [showIconModal, setShowIconModal] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (widget) {
      setConfig(widget.widget_config || {});
    }
  }, [widget]);

  const handleSave = () => {
    if (widget) {
      onSave(widget.id, config);
      onClose();
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!widget) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 pip-dialog">
          <DialogHeader className="px-6 py-4 border-b border-pip-border">
            <DialogTitle className="text-pip-text-bright font-pip-display text-xl flex items-center gap-3">
              {(() => {
                const IconComponent = getTabIcon('', config.icon || 'CogIcon');
                return <IconComponent className="h-6 w-6 text-primary" />;
              })()}
              Widget Settings
              <Badge variant="outline" className="ml-auto">
                {widget.widget_type}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
              <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
              <TabsTrigger value="display" className="text-xs">Display</TabsTrigger>
              <TabsTrigger value="behavior" className="text-xs">Behavior</TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6">
              <div className="py-4">
                <TabsContent value="general" className="space-y-6 mt-0">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-pip-text-primary">Basic Information</h3>
                    
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-pip-text-secondary font-pip-mono">
                          Widget Title
                        </Label>
                        <Input
                          id="title"
                          value={config.title || ''}
                          onChange={(e) => updateConfig('title', e.target.value)}
                          className="pip-input"
                          placeholder="Enter widget title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-pip-text-secondary font-pip-mono">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={config.description || ''}
                          onChange={(e) => updateConfig('description', e.target.value)}
                          className="pip-input"
                          placeholder="Widget description"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Icon Selection */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-pip-text-primary">Icon</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded border border-pip-border bg-pip-bg-tertiary/50 pip-glow">
                        {(() => {
                          const IconComponent = getTabIcon('', config.icon || 'CogIcon');
                          return <IconComponent className="h-6 w-6 text-primary" />;
                        })()}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowIconModal(true)}
                        className="flex-1"
                      >
                        Select Icon
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="display" className="space-y-6 mt-0">
                  {/* Display Options */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-pip-text-primary">Display Options</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-pip-text-secondary font-pip-mono">Show Title</Label>
                          <p className="text-xs text-pip-text-muted">Display widget title in header</p>
                        </div>
                        <Switch
                          checked={config.showTitle !== false}
                          onCheckedChange={(checked) => updateConfig('showTitle', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-pip-text-secondary font-pip-mono">Show Description</Label>
                          <p className="text-xs text-pip-text-muted">Display widget description</p>
                        </div>
                        <Switch
                          checked={config.showDescription !== false}
                          onCheckedChange={(checked) => updateConfig('showDescription', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="behavior" className="space-y-6 mt-0">
                  {/* Behavior Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-pip-text-primary">Behavior</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-pip-text-secondary font-pip-mono">Auto Refresh</Label>
                          <p className="text-xs text-pip-text-muted">Automatically refresh widget data</p>
                        </div>
                        <Switch
                          checked={config.autoRefresh === true}
                          onCheckedChange={(checked) => updateConfig('autoRefresh', checked)}
                        />
                      </div>

                      {config.autoRefresh && (
                        <div className="space-y-2">
                          <Label className="text-pip-text-secondary font-pip-mono">
                            Refresh Interval (seconds)
                          </Label>
                          <Input
                            type="number"
                            value={config.refreshInterval || 30}
                            onChange={(e) => updateConfig('refreshInterval', parseInt(e.target.value) || 30)}
                            className="pip-input"
                            min={5}
                            max={3600}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6 mt-0">
                  {/* Widget-specific Advanced Settings */}
                  {['test', 'test_widget'].includes((widget.widget_type || '').toLowerCase()) && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-pip-text-primary">Test Widget Settings</h3>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label className="text-pip-text-secondary font-pip-mono">Text Input</Label>
                          <Input
                            value={config.textInput || ''}
                            onChange={(e) => updateConfig('textInput', e.target.value)}
                            className="pip-input"
                            placeholder="Enter text"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-pip-text-secondary font-pip-mono">Number</Label>
                          <Input
                            type="number"
                            value={config.numberInput || 0}
                            onChange={(e) => updateConfig('numberInput', parseInt(e.target.value) || 0)}
                            className="pip-input"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-pip-text-secondary font-pip-mono">Color</Label>
                          <Input
                            type="color"
                            value={config.colorValue || '#00ff00'}
                            onChange={(e) => updateConfig('colorValue', e.target.value)}
                            className="pip-input h-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Debug Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-pip-text-primary">Debug Information</h3>
                    <div className="bg-pip-bg-secondary/30 rounded p-3 font-pip-mono text-xs space-y-1">
                      <div>Widget ID: <span className="text-pip-text-muted">{widget.id}</span></div>
                      <div>Type: <span className="text-pip-text-muted">{widget.widget_type}</span></div>
                      <div>Created: <span className="text-pip-text-muted">{new Date(widget.created_at).toLocaleDateString()}</span></div>
                      <div>Updated: <span className="text-pip-text-muted">{new Date(widget.updated_at).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
          
          <DialogFooter className="px-6 py-4 border-t border-pip-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="pip-button-secondary"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              className="pip-button-primary"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <IconSelectionModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        onSelect={(iconName) => updateConfig('icon', iconName)}
        selectedIcon={config.icon || 'CogIcon'}
        title="Select Widget Icon"
      />
    </>
  );
};