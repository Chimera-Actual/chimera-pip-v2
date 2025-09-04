import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, LayoutGrid } from 'lucide-react';

interface EmptyGridStateProps {
  onAddWidget: () => void;
}

export const EmptyGridState: React.FC<EmptyGridStateProps> = memo(({ onAddWidget }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <LayoutGrid className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No widgets in this tab</h3>
        <p className="text-muted-foreground mb-4">Add your first widget to get started</p>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onAddWidget}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                <LayoutGrid className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a new widget to this tab</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
});

EmptyGridState.displayName = 'EmptyGridState';