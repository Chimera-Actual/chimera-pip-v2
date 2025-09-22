import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface WidgetSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const WidgetSettingsSheet: React.FC<WidgetSettingsSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className={cn(
          "w-[420px] sm:w-[520px]",
          "bg-pip-bg-primary text-pip-text-primary border-l border-pip-border",
          "flex flex-col",
          className
        )}
      >
        <SheetHeader className="border-b border-pip-border pb-4 mb-6 flex-shrink-0">
          <SheetTitle className="text-pip-text-bright font-pip-display text-lg">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-pip-text-muted text-sm font-pip-mono">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-4">
            {children}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};