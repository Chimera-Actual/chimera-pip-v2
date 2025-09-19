import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetShell } from '@/components/widgets/base/WidgetShell';
import { WidgetActionBar, type WidgetAction } from '@/components/widgets/base/WidgetActionBar';
import { AgentSelector } from '@/components/widgets/agents/AgentSelector';
import { Transcript } from '@/components/widgets/agents/Transcript';
import { Composer } from '@/components/widgets/agents/Composer';
import { AIAgentSettings } from '@/components/widgets/agents/AIAgentSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useTabWidgets } from '@/hooks/useTabWidgetsRefactored';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_AGENTS, getAgentById, getDefaultAgent } from '@/services/agents/agentRegistry';
import { aiAgentService } from '@/services/agents/aiAgentService';
import { postToN8N } from '@/services/agents/n8nClient';
import type { AgentConfig, AgentDefinition, ChatMessage, ChatSession } from '@/types/agents';
import { localStorageService } from '@/services/storage';
import { v4 as uuid } from 'uuid';
import { RefreshCw, Square, Download, Settings, Bot } from 'lucide-react';

interface AIAgentWidgetProps {
  widgetId: string;
  widget?: {
    widget_config: Record<string, any>;
  };
  onConfigUpdate?: (config: Record<string, any>) => void;
}

const DEFAULT_CONFIG: AgentConfig = {
  defaultAgentId: 'overseer',
  webhookUrl: '',
};

export default function AIAgentWidget({ 
  widgetId, 
  widget, 
  onConfigUpdate 
}: AIAgentWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateWidget } = useTabWidgets('');
  
  // Configuration state
  const [config, setConfig] = useState<AgentConfig>(() => {
    const stored = widget?.widget_config?.agentConfig;
    return stored ? { ...DEFAULT_CONFIG, ...stored } : DEFAULT_CONFIG;
  });
  
  // Chat state
  const [activeAgent, setActiveAgent] = useState<AgentDefinition>(() => 
    getAgentById(config.defaultAgentId) || getDefaultAgent()
  );
  const [sessionId, setSessionId] = useState<string>(() => uuid());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Refs
  const abortRef = useRef<AbortController | null>(null);
  
  // Load persisted session on mount
  useEffect(() => {
    const sessionKey = `chimera.agent.${widgetId}.${sessionId}.chat`;
    const savedSession = localStorageService.get<ChatSession>(sessionKey);
    if (savedSession?.messages) {
      setMessages(savedSession.messages);
    }
  }, [widgetId, sessionId]);
  
  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const sessionKey = `chimera.agent.${widgetId}.${sessionId}.chat`;
      const session: ChatSession = {
        id: sessionId,
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorageService.set(sessionKey, session);
    }
  }, [messages, widgetId, sessionId]);
  
  // Update active agent when config changes
  useEffect(() => {
    const agent = getAgentById(config.defaultAgentId);
    if (agent) {
      setActiveAgent(agent);
    }
  }, [config.defaultAgentId]);
  
  // Save config when it changes
  const saveConfig = (newConfig: AgentConfig) => {
    setConfig(newConfig);
    const updatedWidgetConfig = {
      ...widget?.widget_config,
      agentConfig: newConfig,
    };
    
    if (onConfigUpdate) {
      onConfigUpdate(updatedWidgetConfig);
    }
    
    // Also persist via useTabWidgets if available
    updateWidget(widgetId, { widget_config: updatedWidgetConfig }).catch(console.error);
  };
  
  const newChat = () => {
    setMessages([]);
    setSessionId(uuid());
    setInput('');
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };
  
  const stopRequest = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };
  
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || pending) return;
    
    if (!config.webhookUrl) {
      toast({
        title: 'Configuration Required',
        description: 'Please set a webhook URL in settings before sending messages.',
        variant: 'destructive',
      });
      return;
    }
    
    const userMessage: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: text,
      ts: Date.now(),
      status: 'ok',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setPending(true);
    
    const controller = new AbortController();
    abortRef.current = controller;
    
    try {
      let assistantText: string;
      let usage: { prompt?: number; completion?: number } | undefined;
      
      // Try Supabase AI chat first, then fallback to n8n
      if (!config.webhookUrl) {
        // Use Supabase AI chat
        const response = await aiAgentService.sendMessage({
          messages: [...messages, userMessage],
          agent: activeAgent,
          sessionId,
          widgetId,
          signal: controller.signal,
        });
        assistantText = response.content;
        usage = response.usage;
      } else {
        // Use direct n8n webhook
        const body = {
          sessionId,
          agent: {
            id: activeAgent.id,
            name: activeAgent.name,
          },
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          user: user ? { id: user.id, email: user.email ?? null } : { id: 'anonymous' },
          meta: { widgetId },
        };
        
        const headers = config.authHeaderName && config.authHeaderValue 
          ? { [config.authHeaderName]: config.authHeaderValue }
          : undefined;
        
        const response = await postToN8N({
          webhookUrl: config.webhookUrl,
          headers,
          body,
          signal: controller.signal,
        });
        
        assistantText = response.assistantText;
        usage = response.usage;
      }
      
      const assistantMessage: ChatMessage = {
        id: uuid(),
        role: 'assistant',
        content: assistantText,
        ts: Date.now(),
        status: 'ok',
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (usage) {
        toast({
          title: 'Response received',
          description: `Tokens: ${usage.prompt || 0} prompt + ${usage.completion || 0} completion`,
        });
      }
      
    } catch (error) {
      console.error('Agent error:', error);
      
      // Mark user message as error
      setMessages(prev => 
        prev.map(m => 
          m.id === userMessage.id 
            ? { ...m, status: 'error' as const }
            : m
        )
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Agent Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  };
  
  const exportJson = () => {
    const data = {
      sessionId,
      agent: activeAgent,
      messages,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-chat-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const exportMarkdown = () => {
    const content = [
      `# AI Agent Chat - ${activeAgent.name}`,
      `Session: ${sessionId}`,
      `Exported: ${new Date().toLocaleString()}`,
      '',
      ...messages.map(msg => [
        `## ${msg.role === 'user' ? 'You' : 'Agent'} (${new Date(msg.ts).toLocaleTimeString()})`,
        '',
        msg.content,
        ''
      ]).flat()
    ].join('\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-chat-${sessionId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const actions: WidgetAction[] = useMemo(() => [
    {
      type: 'menu',
      id: 'agent',
      icon: Bot,
      items: DEFAULT_AGENTS.map(agent => ({
        id: agent.id,
        label: agent.name,
        onClick: () => setActiveAgent(agent),
        icon: agent.icon as any, // Cast to any to avoid type conflict
      })),
    },
    {
      type: 'button',
      id: 'new',
      label: 'New Chat',
      onClick: newChat,
      icon: RefreshCw,
    },
    ...(pending ? [{
      type: 'button' as const,
      id: 'stop',
      label: 'Stop',
      onClick: stopRequest,
      icon: Square,
    }] : []),
    {
      type: 'menu',
      id: 'export',
      icon: Download,
      items: [
        { id: 'json', label: 'Export JSON', onClick: exportJson },
        { id: 'md', label: 'Export Markdown', onClick: exportMarkdown },
      ],
    },
    {
      type: 'menu',
      id: 'settings',
      icon: Settings,
      items: [
        { id: 'open', label: 'Widget Settings', onClick: () => setShowSettings(true) },
      ],
    },
  ], [activeAgent, pending]);
  
  return (
    <>
      <WidgetShell
        title="AI Agent"
        icon={Bot}
        className="min-h-[500px] flex flex-col"
      >
        <WidgetActionBar actions={actions} />
        
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-pip-border bg-pip-bg-secondary/20">
            <AgentSelector
              agents={DEFAULT_AGENTS}
              selectedAgent={activeAgent}
              onAgentChange={setActiveAgent}
            />
          </div>
          
          <div className="flex-1 min-h-0">
            <Transcript messages={messages} />
          </div>
          
          <div className="border-t border-pip-border">
            <Composer
              value={input}
              onChange={setInput}
              onSend={sendMessage}
              onStop={pending ? stopRequest : undefined}
              disabled={!config.webhookUrl}
              pending={pending}
              placeholder={
                !config.webhookUrl 
                  ? "Configure webhook URL in settings to start chatting..."
                  : `Message ${activeAgent.name}...`
              }
            />
          </div>
        </div>
      </WidgetShell>
      
      <AIAgentSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        config={config}
        onSave={saveConfig}
      />
    </>
  );
}