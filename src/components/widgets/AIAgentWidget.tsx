import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WidgetShell } from '@/components/widgets/base/WidgetShell';
import { WidgetActionBar, type WidgetAction } from '@/components/widgets/base/WidgetActionBar';
import { AgentSelector } from './agents/AgentSelector';
import { Transcript } from './agents/Transcript';
import { Composer } from './agents/Composer';
import { AIAgentSettings } from './agents/AIAgentSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { aiAgentService } from '@/services/agents/aiAgentService';
import { DEFAULT_AGENTS, getDefaultAgent } from '@/services/agents/agentRegistry';
import type { 
  ChatMessage, 
  AgentDefinition, 
  AgentWidgetConfig,
  ChatSession 
} from '@/types/agents';
import { 
  Bot, 
  RefreshCw, 
  Square, 
  Download, 
  Settings, 
  FileJson,
  FileText 
} from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface AIAgentWidgetProps {
  widgetId: string;
  widget?: {
    widget_config: Record<string, any>;
  };
  onConfigUpdate?: (config: Record<string, any>) => void;
}

export default function AIAgentWidget({ 
  widgetId, 
  widget, 
  onConfigUpdate 
}: AIAgentWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load config from widget or localStorage
  const loadConfig = (): AgentWidgetConfig => {
    if (widget?.widget_config?.agentConfig) {
      return widget.widget_config.agentConfig;
    }
    
    try {
      const stored = localStorage.getItem(`chimera.agent.${widgetId}.config`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const [config, setConfig] = useState<AgentWidgetConfig>(loadConfig);
  const [activeAgent, setActiveAgent] = useState<AgentDefinition>(() => {
    const defaultId = config.defaultAgentId || DEFAULT_AGENTS[0].id;
    return DEFAULT_AGENTS.find(a => a.id === defaultId) || getDefaultAgent();
  });
  
  const [sessionId, setSessionId] = useState<string>(() => uuid());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save config when it changes
  useEffect(() => {
    if (onConfigUpdate) {
      onConfigUpdate({ agentConfig: config });
    } else {
      localStorage.setItem(`chimera.agent.${widgetId}.config`, JSON.stringify(config));
    }
  }, [config, widgetId, onConfigUpdate]);

  // Load session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`chimera.agent.${widgetId}.${sessionId}.chat`);
      if (stored) {
        const session: ChatSession = JSON.parse(stored);
        setMessages(session.messages);
      }
    } catch (error) {
      console.warn('Failed to load chat session:', error);
    }
  }, [widgetId, sessionId]);

  // Save session to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const session: ChatSession = {
        id: sessionId,
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem(
          `chimera.agent.${widgetId}.${sessionId}.chat`, 
          JSON.stringify(session)
        );
      } catch (error) {
        console.warn('Failed to save chat session:', error);
      }
    }
  }, [messages, sessionId, widgetId]);

  const newChat = () => {
    setMessages([]);
    setSessionId(uuid());
    setInput('');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || pending) return;

    // Validate webhook URL if custom one is set
    if (config.customWebhookUrl) {
      try {
        new URL(config.customWebhookUrl);
        if (!config.customWebhookUrl.startsWith('https://')) {
          throw new Error('Webhook URL must use HTTPS');
        }
      } catch (error) {
        toast({
          title: 'Invalid webhook URL',
          description: 'Please check your settings and provide a valid HTTPS URL.',
          variant: 'destructive',
        });
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      status: 'ok',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setPending(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Add pending assistant message
    const pendingMessage: ChatMessage = {
      id: uuid(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    setMessages(prev => [...prev, pendingMessage]);

    try {
      const response = await aiAgentService.sendMessage({
        messages: [...messages, userMessage],
        agent: activeAgent,
        sessionId,
        widgetId,
        webhookUrl: config.customWebhookUrl,
        customHeaders: config.customHeaders,
        signal: controller.signal,
      });

      // Replace pending message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === pendingMessage.id 
          ? {
              ...msg,
              content: response.content,
              status: 'ok' as const,
            }
          : msg
      ));

      // Show usage info if available
      if (response.usage) {
        toast({
          title: 'Message sent',
          description: `Tokens: ${response.usage.prompt || 0} + ${response.usage.completion || 0}`,
          duration: 3000,
        });
      }

    } catch (error: any) {
      // Remove pending message and mark user message as error
      setMessages(prev => prev
        .filter(msg => msg.id !== pendingMessage.id)
        .map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' as const }
            : msg
        )
      );

      if (error.name !== 'AbortError') {
        toast({
          title: 'Failed to send message',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      setPending(false);
      abortControllerRef.current = null;
    }
  };

  const exportTranscript = (format: 'json' | 'markdown') => {
    if (messages.length === 0) {
      toast({
        title: 'No messages to export',
        description: 'Start a conversation first.',
        variant: 'destructive',
      });
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      const exportData = {
        sessionId,
        agent: activeAgent,
        messages: messages.map(({ id, role, content, timestamp }) => ({
          id, role, content, timestamp
        })),
        exportedAt: new Date().toISOString(),
      };
      content = JSON.stringify(exportData, null, 2);
      filename = `ai-chat-${sessionId.slice(0, 8)}.json`;
      mimeType = 'application/json';
    } else {
      const lines = [
        `# AI Chat Session`,
        `**Agent:** ${activeAgent.name}`,
        `**Session ID:** ${sessionId}`,
        `**Exported:** ${new Date().toISOString()}`,
        '',
        '---',
        '',
      ];

      for (const message of messages) {
        if (message.status !== 'pending') {
          lines.push(`## ${message.role === 'user' ? 'User' : 'Assistant'}`);
          lines.push(`*${new Date(message.timestamp).toLocaleString()}*`);
          lines.push('');
          lines.push(message.content);
          lines.push('');
        }
      }

      content = lines.join('\n');
      filename = `ai-chat-${sessionId.slice(0, 8)}.md`;
      mimeType = 'text/markdown';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export complete',
      description: `Downloaded ${filename}`,
    });
  };

  const actions: WidgetAction[] = useMemo(() => [
    {
      type: 'button',
      id: 'new-chat',
      label: 'New Chat',
      onClick: newChat,
      icon: RefreshCw,
    },
    ...(pending ? [{
      type: 'button' as const,
      id: 'stop',
      label: 'Stop',
      onClick: stopGeneration,
      icon: Square,
    }] : []),
    {
      type: 'menu',
      id: 'export',
      label: 'Export',
      icon: Download,
      items: [
        {
          id: 'export-json',
          label: 'Export as JSON',
          onClick: () => exportTranscript('json'),
          icon: FileJson,
        },
        {
          id: 'export-md',
          label: 'Export as Markdown',
          onClick: () => exportTranscript('markdown'),
          icon: FileText,
        },
      ],
    },
    {
      type: 'button',
      id: 'settings',
      label: 'Settings',
      onClick: () => setSettingsOpen(true),
      icon: Settings,
    },
  ], [pending]);

  return (
    <>
      <WidgetShell 
        title="AI Agent" 
        icon={Bot}
        className="flex flex-col h-full"
      >
        <WidgetActionBar actions={actions} className="border-b border-border" />
        
        <div className="flex-1 flex flex-col min-h-0 p-4">
          {/* Agent Selector */}
          <div className="mb-4">
            <AgentSelector
              agents={DEFAULT_AGENTS}
              selectedAgent={activeAgent}
              onAgentChange={setActiveAgent}
              disabled={pending}
            />
          </div>

          {/* Transcript */}
          <Transcript 
            messages={messages}
            className="flex-1 min-h-0"
          />

          {/* Composer */}
          <Composer
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            onStop={stopGeneration}
            pending={pending}
            disabled={!config.customWebhookUrl && !user} // Require auth for default service
          />
        </div>
      </WidgetShell>

      <AIAgentSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        config={config}
        onSave={setConfig}
      />
    </>
  );
}