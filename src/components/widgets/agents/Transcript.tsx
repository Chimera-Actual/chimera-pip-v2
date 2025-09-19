import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, AlertCircle, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '@/types/agents';

interface TranscriptProps {
  messages: ChatMessage[];
  className?: string;
}

export function Transcript({ messages, className = '' }: TranscriptProps) {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied to clipboard',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (messages.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select an agent and start a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 group ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
              ${message.role === 'user' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-secondary/20 text-secondary-foreground'
              }
            `}>
              {message.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
          </div>

          {/* Message bubble */}
          <div className={`
            flex-1 max-w-[80%] ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }
          `}>
            <div className={`
              relative inline-block px-4 py-3 rounded-lg text-sm
              ${message.role === 'user'
                ? 'bg-primary/10 border border-primary/20 text-primary-foreground'
                : 'bg-background/40 border border-border'
              }
              ${message.status === 'error' ? 'border-destructive/50 bg-destructive/5' : ''}
              ${message.status === 'pending' ? 'animate-pulse' : ''}
            `}>
              {/* Status indicator */}
              {message.status === 'error' && (
                <div className="flex items-center gap-2 mb-2 text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span className="text-xs">Failed to send</span>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-sm prose-invert max-w-none">
                {message.role === 'assistant' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ node, className, children, ...props }) => {
                        const isInline = !className?.includes('language-');
                        if (isInline) {
                          return (
                            <code 
                              className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <pre className="bg-muted/50 p-3 rounded border text-xs overflow-x-auto">
                            <code className="font-mono" {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      },
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>

              {/* Copy button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyMessage(message.content)}
                className={`
                  absolute top-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-background/50 ${
                    message.role === 'user' ? 'left-2' : 'right-2'
                  }
                `}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>

            {/* Timestamp */}
            <div className={`
              text-xs text-muted-foreground mt-1 px-1
              ${message.role === 'user' ? 'text-right' : 'text-left'}
            `}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      ))}

      {/* Pending message indicator */}
      {messages.some(m => m.status === 'pending') && (
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-secondary-foreground" />
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-background/40 border border-border rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}