import React, { useState, useEffect, memo, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { TabConfiguration } from '@/types/tabManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import * as LucideIcons from 'lucide-react';

interface TabEditorProps {
  tab?: TabConfiguration;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tabData: Partial<TabConfiguration>) => Promise<void>;
}

const availableIcons = [
  { name: 'FolderIcon', label: 'Folder', icon: LucideIcons.Folder },
  { name: 'CogIcon', label: 'Settings', icon: LucideIcons.Settings },
  { name: 'ChartIcon', label: 'Analytics', icon: LucideIcons.BarChart3 },
  { name: 'GamepadIcon', label: 'Games', icon: LucideIcons.Gamepad2 },
  { name: 'MusicIcon', label: 'Music', icon: LucideIcons.Music },
  { name: 'VideoIcon', label: 'Video', icon: LucideIcons.Video },
  { name: 'CodeIcon', label: 'Development', icon: LucideIcons.Code },
  { name: 'BookIcon', label: 'Reading', icon: LucideIcons.Book },
  { name: 'CameraIcon', label: 'Media', icon: LucideIcons.Camera },
  { name: 'TerminalIcon', label: 'Terminal', icon: LucideIcons.Terminal },
  { name: 'DatabaseIcon', label: 'Data', icon: LucideIcons.Database },
  { name: 'NetworkIcon', label: 'Network', icon: LucideIcons.Network },
  { name: 'ShieldIcon', label: 'Security', icon: LucideIcons.Shield },
  { name: 'RocketIcon', label: 'Projects', icon: LucideIcons.Rocket },
  { name: 'StarIcon', label: 'Favorites', icon: LucideIcons.Star },
];

const colorOptions = [
  { value: '', label: 'Default', color: 'transparent' },
  { value: '#00ff00', label: 'Green', color: '#00ff00' },
  { value: '#ffaa00', label: 'Amber', color: '#ffaa00' },
  { value: '#0088ff', label: 'Blue', color: '#0088ff' },
  { value: '#ff0000', label: 'Red', color: '#ff0000' },
  { value: '#ffffff', label: 'White', color: '#ffffff' },
  { value: '#ff00ff', label: 'Magenta', color: '#ff00ff' },
  { value: '#00ffff', label: 'Cyan', color: '#00ffff' },
];

export const TabEditor: React.FC<TabEditorProps> = memo(({ tab, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FolderIcon',
    color: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tab) {
      setFormData({
        name: tab.name,
        description: tab.description,
        icon: tab.icon,
        color: tab.color || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'FolderIcon',
        color: '',
      });
    }
  }, [tab, isOpen]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save tab:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-pip-bg-overlay/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-pip-bg-primary border-2 border-pip-border-bright rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto pip-glow pip-terminal pip-scanlines">
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-30 pip-scanlines rounded-lg" />
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h2 className="text-xl font-bold font-pip-display text-pip-green-primary pip-text-glow">
              {tab ? 'EDIT TAB' : 'CREATE NEW TAB'}
            </h2>
            <div className="text-xs font-pip-mono text-pip-text-muted mt-1">
              {'>'} TAB_MANAGEMENT_PROTOCOL_v2.1
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-pip-text-secondary hover:text-pip-green-primary pip-button-glow border border-pip-border hover:border-pip-green-secondary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Tab Name */}
          <div className="space-y-2">
            <Label htmlFor="tab-name" className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
              TAB NAME
            </Label>
            <Input
              id="tab-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="MY_CUSTOM_TAB"
              className="bg-pip-bg-tertiary/80 border-pip-border focus:border-pip-green-primary font-pip-mono text-pip-green-primary placeholder:text-pip-text-muted pip-glow"
              required
              maxLength={20}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="tab-description" className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
              DESCRIPTION
            </Label>
            <Textarea
              id="tab-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="DESCRIBE WHAT THIS TAB IS FOR..."
              rows={3}
              className="bg-pip-bg-tertiary/80 border-pip-border focus:border-pip-green-primary font-pip-mono text-pip-green-primary placeholder:text-pip-text-muted resize-none pip-glow"
              maxLength={100}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
              ICON SELECTION
            </Label>
            <div className="grid grid-cols-8 gap-2 p-3 border border-pip-border rounded-md bg-pip-bg-tertiary/50 max-h-48 overflow-y-auto pip-glow">
              {availableIcons.map((iconOption) => {
                const IconComponent = iconOption.icon;
                return (
                  <button
                    key={iconOption.name}
                    type="button"
                    className={`aspect-square flex items-center justify-center p-2 rounded border transition-all pip-button-glow ${
                      formData.icon === iconOption.name
                        ? 'border-pip-green-primary bg-pip-green-primary/20 text-pip-green-primary pip-glow'
                        : 'border-pip-border bg-pip-bg-tertiary/40 text-pip-text-secondary hover:border-pip-green-secondary hover:text-pip-green-secondary'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.name }))}
                    title={iconOption.label}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
              ACCENT COLOR [OPTIONAL]
            </Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  className={`w-10 h-10 rounded-full border-2 transition-all pip-button-glow ${
                    formData.color === colorOption.value
                      ? 'border-pip-green-primary shadow-lg shadow-pip-green-glow pip-glow'
                      : 'border-pip-border hover:border-pip-green-secondary'
                  }`}
                  style={{ 
                    backgroundColor: colorOption.color || 'transparent',
                    backgroundImage: colorOption.color === '' ? 'linear-gradient(45deg, transparent 40%, rgba(255, 0, 0, 0.8) 50%, transparent 60%)' : undefined
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, color: colorOption.value }))}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-pip-border text-pip-text-secondary hover:border-pip-green-secondary hover:text-pip-green-secondary font-pip-mono pip-button-glow"
              disabled={isSubmitting}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-pip-green-primary/20 border border-pip-green-primary text-pip-green-primary hover:bg-pip-green-primary/30 font-pip-mono pip-button-glow"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {tab ? 'UPDATE TAB' : 'CREATE TAB'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});