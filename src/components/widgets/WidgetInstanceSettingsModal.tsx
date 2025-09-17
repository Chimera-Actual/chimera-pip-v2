import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserWidget } from '@/hooks/useWidgetManager';

interface WidgetInstanceSettingsModalProps {
  open: boolean;
  onClose: () => void;
  widget: UserWidget | null;
  onSave: (widgetId: string, config: any) => void;
}

export const WidgetInstanceSettingsModal: React.FC<WidgetInstanceSettingsModalProps> = ({
  open,
  onClose,
  widget,
  onSave,
}) => {
  const [config, setConfig] = useState<any>({});

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] pip-dialog">
        <DialogHeader>
          <DialogTitle className="text-pip-text-bright font-pip-display">
            Widget Settings
          </DialogTitle>
          <DialogDescription className="text-pip-text-secondary font-pip-mono">
            Configure settings for this {widget.widget_type} widget
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-pip-text-secondary font-pip-mono">
              Title
            </Label>
            <Input
              id="title"
              value={config.title || ''}
              onChange={(e) => updateConfig('title', e.target.value)}
              className="col-span-3 pip-input"
              placeholder="Widget title"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right text-pip-text-secondary font-pip-mono">
              Description
            </Label>
            <Textarea
              id="description"
              value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              className="col-span-3 pip-input"
              placeholder="Widget description"
              rows={3}
            />
          </div>

          {/* Widget-specific settings based on type */}
          {widget.widget_type === 'test' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="textInput" className="text-right text-pip-text-secondary font-pip-mono">
                  Text Input
                </Label>
                <Input
                  id="textInput"
                  value={config.textInput || ''}
                  onChange={(e) => updateConfig('textInput', e.target.value)}
                  className="col-span-3 pip-input"
                  placeholder="Enter text"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numberInput" className="text-right text-pip-text-secondary font-pip-mono">
                  Number
                </Label>
                <Input
                  id="numberInput"
                  type="number"
                  value={config.numberInput || 0}
                  onChange={(e) => updateConfig('numberInput', parseInt(e.target.value) || 0)}
                  className="col-span-3 pip-input"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="colorValue" className="text-right text-pip-text-secondary font-pip-mono">
                  Color
                </Label>
                <Input
                  id="colorValue"
                  type="color"
                  value={config.colorValue || '#00ff00'}
                  onChange={(e) => updateConfig('colorValue', e.target.value)}
                  className="col-span-3 pip-input h-10"
                />
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
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
  );
};