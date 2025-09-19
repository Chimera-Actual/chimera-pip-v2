/**
 * Large numeric keypad for glove-friendly Quick Access input
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { CornerDownLeft, Delete, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAccessPadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
}

const digits = [
  ['1', '2', '3'],
  ['4', '5', '6'], 
  ['7', '8', '9'],
  ['', '0', '']
];

export function QuickAccessPad({
  onDigit,
  onBackspace,
  onClear,
  onSubmit,
  disabled = false,
  className
}: QuickAccessPadProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-3 max-w-sm mx-auto", className)}>
      {/* Number grid */}
      {digits.map((row, rowIndex) =>
        row.map((digit, colIndex) => {
          if (!digit) {
            return <div key={`${rowIndex}-${colIndex}`} />; // Empty cell
          }
          
          return (
            <Button
              key={digit}
              variant="outline"
              size="lg"
              onClick={() => onDigit(digit)}
              disabled={disabled}
              className={cn(
                "min-h-[64px] min-w-[64px] text-2xl font-mono",
                "bg-pip-bg-secondary/50 border-pip-border",
                "hover:bg-primary/20 hover:border-primary/50",
                "active:bg-primary/30 active:scale-95",
                "focus-visible:ring-2 focus-visible:ring-primary",
                "transition-all duration-150",
                "touch-manipulation" // Better mobile touch handling
              )}
            >
              {digit}
            </Button>
          );
        })
      )}
      
      {/* Action buttons row */}
      <Button
        variant="outline"
        size="lg"
        onClick={onClear}
        disabled={disabled}
        className={cn(
          "min-h-[64px] text-sm font-mono uppercase",
          "bg-destructive/10 border-destructive/30",
          "hover:bg-destructive/20 hover:border-destructive/50",
          "active:bg-destructive/30 active:scale-95",
          "focus-visible:ring-2 focus-visible:ring-destructive",
          "transition-all duration-150"
        )}
      >
        <Delete className="h-5 w-5 mr-1" />
        Clear
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        onClick={onBackspace}
        disabled={disabled}
        className={cn(
          "min-h-[64px] text-sm font-mono uppercase",
          "bg-pip-bg-secondary/50 border-pip-border",
          "hover:bg-primary/20 hover:border-primary/50",
          "active:bg-primary/30 active:scale-95",
          "focus-visible:ring-2 focus-visible:ring-primary",
          "transition-all duration-150"
        )}
      >
        <CornerDownLeft className="h-5 w-5" />
      </Button>
      
      <Button
        variant="default"
        size="lg"
        onClick={onSubmit}
        disabled={disabled}
        className={cn(
          "min-h-[64px] text-sm font-mono uppercase",
          "bg-primary hover:bg-primary/90",
          "active:bg-primary/80 active:scale-95", 
          "focus-visible:ring-2 focus-visible:ring-primary",
          "transition-all duration-150"
        )}
      >
        <ArrowRight className="h-5 w-5 mr-1" />
        Enter
      </Button>
    </div>
  );
}