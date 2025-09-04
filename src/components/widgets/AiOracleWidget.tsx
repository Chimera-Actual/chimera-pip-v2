import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, MessageCircle, Settings, Trash2, Brain, Send, Bot, User, Clock } from 'lucide-react';
import { AiOracleSettings, BaseWidget } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useAiAgents } from '@/hooks/useAiAgents';
import { useAiConversation } from '@/hooks/useAiConversation';
import { formatDistanceToNow } from 'date-fns';

interface AiOracleWidgetProps {
  widget: BaseWidget;
  onSettingsClick?: () => void;
}

export const AiOracleWidget: React.FC<AiOracleWidgetProps> = ({
  widget,
  onSettingsClick
}) => {
  const widgetState = useWidgetState<AiOracleSettings>(widget.id, widget.settings as AiOracleSettings);
  const { settings: aiSettings, setSettings: setAiSettings } = widgetState;
  
  // AI Agents hook
  const { 
    agents, 
    loading: agentsLoading, 
    getDefaultAgent 
  } = useAiAgents();
  
  // Local state
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Conversation hook
  const {
    conversation,
    messages,
    loading,
    sendMessage,
    loadConversation,
    clearConversation
  } = useAiConversation();
  
  // Settings update function
  const handleSettingsChange = useCallback((newSettings: Partial<AiOracleSettings>) => {
    setAiSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, [setAiSettings]);
  
  // Initialize selected agent with fallback behavior
  useEffect(() => {
    if (!agentsLoading && !isInitialized) {
      let agentToSelect = null;
      
      // Try to get configured agent first
      if (aiSettings?.selectedAgentId && agents.length > 0) {
        agentToSelect = agents.find(a => a.id === aiSettings.selectedAgentId);
      }
      
      // Fallback to default agent
      if (!agentToSelect && agents.length > 0) {
        agentToSelect = getDefaultAgent();
        
        // Update settings to reflect the fallback
        if (agentToSelect) {
          handleSettingsChange({ selectedAgentId: agentToSelect.id });
        }
      }
      
      if (agentToSelect) {
        setSelectedAgentId(agentToSelect.id);
        loadConversation(widget.id, agentToSelect.id);
      }
      
      setIsInitialized(true);
    }
  }, [agentsLoading, agents, aiSettings?.selectedAgentId, getDefaultAgent, widget.id, loadConversation, isInitialized, handleSettingsChange]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !selectedAgentId || loading) return;

    const messageText = inputMessage;
    setInputMessage('');
    
    await sendMessage(messageText, selectedAgentId);
  }, [inputMessage, selectedAgentId, loading, sendMessage]);

  const handleAgentChange = useCallback(async (agentId: string) => {
    setSelectedAgentId(agentId);
    await handleSettingsChange({ selectedAgentId: agentId });
    await loadConversation(widget.id, agentId);
  }, [handleSettingsChange, widget.id, loadConversation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = useCallback(async () => {
    if (conversation) {
      await clearConversation();
    }
  }, [conversation, clearConversation]);

  const getCurrentAgent = () => {
    return agents.find(agent => agent.id === selectedAgentId);
  };

  const currentAgent = getCurrentAgent();
  const showAgentSwitcher = aiSettings?.uiPreferences?.showAgentSwitcher !== false;
  const showTokenUsage = aiSettings?.uiPreferences?.showTokenUsage === true;
  const compactMode = aiSettings?.uiPreferences?.compactMode === true;

  if (agentsLoading) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-pip-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading AI Agents...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-pip-text-bright">
            <Brain className="h-5 w-5" />
            AI Oracle
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full text-center">
          <Brain className="h-12 w-12 text-pip-text-muted mb-4" />
          <p className="text-pip-text-muted mb-4">No AI agents configured</p>
          <Button onClick={onSettingsClick} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Agents
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      {/* Chat Messages */}
      <CardContent className="flex-1 flex flex-col p-2 gap-2">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageCircle className="h-8 w-8 text-pip-text-muted mb-2" />
                <p className="text-pip-text-muted text-sm">
                  {currentAgent ? `Start a conversation with ${currentAgent.name}` : 'Select an agent to start chatting'}
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {message.role === 'user' ? (
                      <AvatarFallback className="bg-pip-accent text-pip-text-bright">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback 
                        className="text-pip-text-bright"
                        style={{ backgroundColor: currentAgent?.avatarConfig.color || '#00ff00' }}
                      >
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div 
                      className={`inline-block max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        message.role === 'user' 
                          ? 'bg-pip-accent text-pip-text-bright ml-auto' 
                          : 'bg-pip-background border border-pip-border text-pip-text'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {!compactMode && (
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          message.role === 'user' ? 'text-pip-text-bright/70' : 'text-pip-text-muted'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback 
                    className="text-pip-text-bright"
                    style={{ backgroundColor: currentAgent?.avatarConfig.color || '#00ff00' }}
                  >
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="inline-block bg-pip-background border border-pip-border px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2 text-pip-text-muted">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={currentAgent ? `Message ${currentAgent.name}...` : 'Select an agent first...'}
              disabled={loading || !currentAgent}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim() || !currentAgent}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            {messages.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearHistory}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-pip-text-muted">
            <div className="flex items-center gap-4">
              {conversation?.metadata?.requestCount && (
                <span>{conversation.metadata.requestCount} messages</span>
              )}
              {currentAgent && (
                <span>Agent: {currentAgent.name}</span>
              )}
            </div>
            {showTokenUsage && conversation?.metadata?.tokenUsage && (
              <span>{conversation.metadata.tokenUsage} tokens used</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};