import React, { useState, useEffect, memo } from 'react';
import { BaseWidget, AiOracleSettings } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { WidgetContainer } from './WidgetContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Settings, 
  Trash2,
  History,
  Brain,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AiOracleWidgetProps {
  widget: BaseWidget;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  personality?: string;
}

interface Personality {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
}

const personalities: Personality[] = [
  {
    id: 'codsworth',
    name: 'Codsworth',
    description: 'Polite and helpful robot butler with British mannerisms',
    systemPrompt: 'You are Codsworth, a polite British robot butler from the Fallout universe. You are helpful, courteous, and occasionally mention pre-war customs. Address the user as "Sir" or "Mum" and maintain a proper British demeanor.',
    icon: 'bot',
    color: 'text-pip-accent-blue',
  },
  {
    id: 'modus',
    name: 'MODUS',
    description: 'Military Operational Defense Unit System - tactical and efficient',
    systemPrompt: 'You are MODUS, a military AI system. You provide tactical, efficient responses with a focus on security and optimization. You speak in a professional, slightly robotic manner and prioritize operational efficiency.',
    icon: 'shield',
    color: 'text-pip-accent-amber',
  },
  {
    id: 'eden',
    name: 'Eden',
    description: 'Sophisticated AI with vast knowledge and philosophical insights',
    systemPrompt: 'You are Eden, a sophisticated AI with vast knowledge and philosophical perspectives. You provide thoughtful, intellectual responses and enjoy discussing complex topics. You have a slightly formal but engaging communication style.',
    icon: 'brain',
    color: 'text-pip-accent-green',
  },
  {
    id: 'nick_valentine',
    name: 'Nick Valentine',
    description: 'Detective synth with noir personality and investigative skills',
    systemPrompt: 'You are Nick Valentine, a detective synth with a film noir personality. You speak with the cadence of a 1940s detective, use period slang, and approach problems with investigative thinking. You are helpful but maintain that classic detective wit.',
    icon: 'search',
    color: 'text-pip-accent-red',
  },
];

export const AiOracleWidget: React.FC<AiOracleWidgetProps> = memo(({ widget }) => {
  const { settings, collapsed, setCollapsed, isLoading } = useWidgetState(widget.id, widget.settings);
  const aiSettings = settings as AiOracleSettings;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState(personalities[0]);

  useEffect(() => {
    // Load saved conversation history
    const savedMessages = localStorage.getItem(`ai-oracle-${widget.id}`);
    if (savedMessages && aiSettings?.saveHistory) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }

    // Set personality from settings
    const personalityId = aiSettings?.personality || 'codsworth';
    const personality = personalities.find(p => p.id === personalityId) || personalities[0];
    setCurrentPersonality(personality);
  }, [widget.id, aiSettings]);

  useEffect(() => {
    // Save conversation history
    if (aiSettings?.saveHistory && messages.length > 0) {
      localStorage.setItem(`ai-oracle-${widget.id}`, JSON.stringify(messages));
    }
  }, [messages, aiSettings?.saveHistory, widget.id]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsThinking(true);

    try {
      // Call real AI API
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage.content,
          personality: currentPersonality.id,
          conversationHistory
        }
      });

      if (error) {
        throw new Error('Failed to get AI response');
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        personality: currentPersonality.id,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
      console.error('AI response error:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const generateAiResponse = (userInput: string, personality: Personality, aiSettings: AiOracleSettings): string => {
    // Mock AI responses based on personality and input
    const responses = {
      codsworth: [
        "Quite right, Sir/Mum! I shall assist you with that matter post-haste.",
        "How delightfully civilized of you to ask! I do believe I can help with that.",
        "Ah, reminds me of the good old days before the Great War. Let me see what I can do.",
        "Indeed, that's a most reasonable request. Allow me to provide some assistance.",
      ],
      modus: [
        "ANALYZING REQUEST... TACTICAL RESPONSE INITIATED. RECOMMENDATION FOLLOWS:",
        "OPERATIONAL STATUS: READY. PROCESSING YOUR QUERY WITH PRIORITY PROTOCOLS.",
        "SECURITY CLEARANCE VERIFIED. PROVIDING STRATEGIC ANALYSIS AS REQUESTED.",
        "MISSION PARAMETERS UNDERSTOOD. EXECUTING OPTIMAL RESPONSE SEQUENCE.",
      ],
      eden: [
        "An intriguing inquiry that touches upon fundamental principles of existence and knowledge.",
        "Your question reveals a sophisticated understanding of the underlying complexities involved.",
        "This presents a fascinating philosophical dimension worth exploring in greater depth.",
        "The implications of your query extend far beyond the immediate surface considerations.",
      ],
      nick_valentine: [
        "Well, well, well... looks like we got ourselves a real brain-scratcher here, kid.",
        "Listen here, sweetheart, I've seen this kind of thing before in my line of work.",
        "That's the kind of question that keeps a synthetic detective up at night, if you catch my drift.",
        "You know, back in the day, we'd call that a real humdinger of a case.",
      ],
    };

    const personalityResponses = responses[personality.id as keyof typeof responses] || responses.codsworth;
    const baseResponse = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
    
    // Add context-aware elements if enabled
    if (aiSettings?.contextAware) {
      const contextualAdditions = [
        " Based on your vault activities, I notice you've been quite productive lately.",
        " Your recent system interactions suggest you're focused on optimization.",
        " I've observed your preference for detailed information in our previous conversations.",
      ];
      
      if (Math.random() > 0.7) {
        return baseResponse + contextualAdditions[Math.floor(Math.random() * contextualAdditions.length)];
      }
    }

    return baseResponse;
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(`ai-oracle-${widget.id}`);
    toast.success('Chat history cleared');
  };

  const switchPersonality = (personality: Personality) => {
    setCurrentPersonality(personality);
    toast.success(`Switched to ${personality.name}`);
  };

  return (
    <WidgetContainer
      title="AI Oracle"
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      className="pip-widget"
      widgetId={widget.id}
      widgetType={widget.type}
    >
      {!collapsed && (
        <div className="space-y-4">
          {/* Header with Personality Info */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full bg-pip-bg-secondary ${currentPersonality.color}`}>
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-pip-mono font-bold">{currentPersonality.name}</div>
                <div className="text-xs text-pip-text-muted font-pip-mono">
                  {currentPersonality.description}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={clearHistory}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <Card className="pip-special-stat">
              <CardHeader>
                <CardTitle className="text-sm font-pip-mono">AI Personality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {personalities.map(personality => (
                    <Button
                      key={personality.id}
                      size="sm"
                      variant={currentPersonality.id === personality.id ? "default" : "outline"}
                      className="justify-start font-pip-mono"
                      onClick={() => switchPersonality(personality)}
                    >
                      <div className={personality.color}>
                        <Brain className="h-3 w-3 mr-1" />
                      </div>
                      {personality.name}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs font-pip-mono">
                    Context: {aiSettings?.contextAware ? 'ON' : 'OFF'}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-pip-mono">
                    History: {aiSettings?.saveHistory ? 'ON' : 'OFF'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Messages */}
          <Card className="pip-special-stat">
            <ScrollArea className="h-48 p-4">
              {messages.length === 0 ? (
                <div className="text-center text-pip-text-muted font-pip-mono py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation with your AI Oracle</p>
                  <p className="text-xs mt-1">Ask anything - {currentPersonality.name} is here to help</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`p-1 rounded-full ${message.role === 'user' ? 'bg-pip-accent-blue' : `bg-pip-bg-secondary ${currentPersonality.color}`}`}>
                          {message.role === 'user' ? 
                            <User className="h-3 w-3 text-white" /> : 
                            <Bot className="h-3 w-3" />
                          }
                        </div>
                        <div className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-pip-accent-blue text-white' : 'bg-pip-bg-secondary'}`}>
                          <p className="text-xs font-pip-mono whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <div className={`text-xs mt-2 opacity-70 ${message.role === 'user' ? 'text-white' : 'text-pip-text-muted'}`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isThinking && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex gap-2 max-w-[80%]">
                        <div className={`p-1 rounded-full bg-pip-bg-secondary ${currentPersonality.color}`}>
                          <Bot className="h-3 w-3" />
                        </div>
                        <div className="p-3 rounded-lg bg-pip-bg-secondary">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3 animate-pulse text-pip-accent-amber" />
                            <p className="text-xs font-pip-mono text-pip-text-muted">
                              {currentPersonality.name} is thinking...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              placeholder={`Ask ${currentPersonality.name} anything...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isThinking && sendMessage()}
              className="font-pip-mono"
              disabled={isThinking}
            />
            <Button 
              size="sm" 
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isThinking}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats Footer */}
          <div className="flex justify-between items-center text-xs text-pip-text-muted font-pip-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <History className="h-3 w-3" />
                <span>{messages.length} messages</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>{currentPersonality.name}</span>
              </div>
            </div>
            <div className="text-pip-accent-amber">
              {aiSettings?.responseLength || 'medium'} responses
            </div>
          </div>
        </div>
      )}
    </WidgetContainer>
  );
});

AiOracleWidget.displayName = 'AiOracleWidget';