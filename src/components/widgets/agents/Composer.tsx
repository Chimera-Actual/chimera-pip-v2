import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Square } from 'lucide-react';

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  disabled?: boolean;
  pending?: boolean;
  placeholder?: string;
}

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  disabled = false,
  pending = false,
  placeholder = 'Type your message... (Enter to send, Shift+Enter for new line)'
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !pending && value.trim()) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (!disabled && !pending && value.trim()) {
      onSend();
    }
  };

  const handleStop = () => {
    if (pending && onStop) {
      onStop();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const canSend = !disabled && !pending && value.trim().length > 0;
  const canStop = pending && onStop;

  return (
    <div className="border-t border-border bg-background/20 p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[40px] max-h-[120px] resize-none bg-background/40 border-primary/20 focus:border-primary/40 text-sm"
            rows={1}
          />
        </div>
        
        <div className="flex gap-1">
          {canStop && (
            <Button
              onClick={handleStop}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
            >
              <Square className="h-4 w-4 text-destructive" />
            </Button>
          )}
          
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="sm"
            className="h-10 w-10 p-0 bg-primary/20 hover:bg-primary/30 border border-primary/20 hover:border-primary/40"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Usage stats */}
      <div className="mt-2 text-xs text-muted-foreground">
        <span>Characters: {value.length}</span>
        {pending && <span className="ml-4 animate-pulse">Sending...</span>}
      </div>
    </div>
  );
}