import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddWidgetButtonProps {
  onAddWidget: () => void;
}

export const AddWidgetButton: React.FC<AddWidgetButtonProps> = memo(({ onAddWidget }) => {
  return (
    <div className="col-span-1 flex items-center justify-center">
      <Button
        onClick={onAddWidget}
        variant="outline"
        className="w-full h-24 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
      >
        <Plus className="w-6 h-6 text-primary" />
      </Button>
    </div>
  );
});

AddWidgetButton.displayName = 'AddWidgetButton';