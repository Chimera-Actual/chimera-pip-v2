import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WIDGET_SIZE_PRESETS } from '@/lib/constants';

interface WidgetSizeSelectorProps {
  currentSize: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
  className?: string;
}

export const WidgetSizeSelector: React.FC<WidgetSizeSelectorProps> = ({
  currentSize,
  onSizeChange,
  className
}) => {
  const presets = Object.entries(WIDGET_SIZE_PRESETS);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-pip-text-primary">
          Widget Size
        </label>
        <Badge variant="outline" className="font-pip-mono text-xs">
          {currentSize.width}×{currentSize.height}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {presets.map(([name, size]) => (
          <Button
            key={name}
            variant={
              currentSize.width === size.width && currentSize.height === size.height
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => onSizeChange(size)}
            className="h-12 flex flex-col items-center justify-center font-pip-mono text-xs"
          >
            <div className="font-medium">{name}</div>
            <div className="text-xs opacity-70">{size.width}×{size.height}</div>
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-pip-text-secondary">Width</label>
          <input
            type="number"
            min="1"
            max="12"
            value={currentSize.width}
            onChange={(e) => onSizeChange({ 
              ...currentSize, 
              width: Math.max(1, Math.min(12, parseInt(e.target.value) || 1))
            })}
            className="w-full px-2 py-1 text-xs bg-pip-bg-tertiary border border-pip-border rounded font-pip-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-pip-text-secondary">Height</label>
          <input
            type="number"
            min="1"
            max="4"
            value={currentSize.height}
            onChange={(e) => onSizeChange({ 
              ...currentSize, 
              height: Math.max(1, Math.min(4, parseInt(e.target.value) || 1))
            })}
            className="w-full px-2 py-1 text-xs bg-pip-bg-tertiary border border-pip-border rounded font-pip-mono"
          />
        </div>
      </div>
    </div>
  );
};