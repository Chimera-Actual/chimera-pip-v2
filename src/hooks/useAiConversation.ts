import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AiConversation } from '@/types/widgets';
import { useToast } from '@/hooks/use-toast';
import { reportError } from '@/lib/errorReporting';

interface UseAiConversationReturn {
  conversation: AiConversation | null;
  messages: AiConversation['messages'];
  loading: boolean;
  error: string | null;
  sendMessage: (message: string, agentId: string) => Promise<boolean>;
  clearConversation: () => Promise<boolean>;
  loadConversation: (widgetId: string, agentId: string) => Promise<void>;
  updateMetadata: (metadata: Partial<AiConversation['metadata']>) => Promise<boolean>;
}

export const useAiConversation = (): UseAiConversationReturn => {
  const [conversation, setConversation] = useState<AiConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadConversation = useCallback(async (widgetId: string, agentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: fetchError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('widget_id', widgetId)
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        const formattedConversation: AiConversation = {
          id: data.id,
          widgetId: data.widget_id,
          agentId: data.agent_id,
          userId: data.user_id,
          messages: (data.messages as any[])?.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })) || [],
          metadata: (data.metadata as AiConversation['metadata']) || {
            tokenUsage: 0,
            requestCount: 0
          },
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        setConversation(formattedConversation);
      } else {
        // Create new conversation if none exists
        const { data: newData, error: createError } = await supabase
          .from('ai_conversations')
          .insert({
            widget_id: widgetId,
            agent_id: agentId,
            user_id: user.id,
            messages: [],
            metadata: {
              tokenUsage: 0,
              requestCount: 0
            }
          })
          .select()
          .single();

        if (createError) throw createError;

        const newConversation: AiConversation = {
          id: newData.id,
          widgetId: newData.widget_id,
          agentId: newData.agent_id,
          userId: newData.user_id,
          messages: [],
          metadata: {
            tokenUsage: 0,
            requestCount: 0
          },
          createdAt: new Date(newData.created_at),
          updatedAt: new Date(newData.updated_at)
        };
        setConversation(newConversation);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation';
      setError(errorMessage);
      reportError('Error loading conversation', {
        component: 'useAiConversation',
        widgetId,
        agentId
      }, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message: string, agentId: string): Promise<boolean> => {
    if (!conversation) return false;

    try {
      setLoading(true);

      // Use Supabase Edge Function for AI chat
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          agentId,
          conversationId: conversation.id,
          widgetId: conversation.widgetId
        }
      });

      if (error) throw error;

      if (!data || !data.response) {
        throw new Error('Invalid response from AI service');
      }

      // Update local state with the response
      const userMessage = {
        role: 'user' as const,
        content: message,
        timestamp: new Date(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const assistantMessage = {
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          agentId,
          tokenUsage: data.tokenUsage
        }
      };

      const finalMessages = [...conversation.messages, userMessage, assistantMessage];

      // Update local state
      setConversation(prev => prev ? {
        ...prev,
        messages: finalMessages,
        metadata: {
          ...prev.metadata,
          requestCount: data.requestCount || (prev.metadata.requestCount || 0) + 1,
          tokenUsage: data.tokenUsage || (prev.metadata.tokenUsage || 0),
          lastAgentUsed: agentId
        }
      } : null);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast({
        title: "Message Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [conversation, toast]);

  const clearConversation = useCallback(async (): Promise<boolean> => {
    if (!conversation) return false;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({
          messages: [],
          metadata: {
            ...conversation.metadata,
            tokenUsage: 0,
            requestCount: 0
          }
        })
        .eq('id', conversation.id);

      if (error) throw error;

      setConversation(prev => prev ? {
        ...prev,
        messages: [],
        metadata: {
          ...prev.metadata,
          tokenUsage: 0,
          requestCount: 0
        }
      } : null);

      toast({
        title: "Conversation Cleared",
        description: "The conversation history has been cleared.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear conversation';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [conversation, toast]);

  const updateMetadata = useCallback(async (metadata: Partial<AiConversation['metadata']>): Promise<boolean> => {
    if (!conversation) return false;

    try {
      const updatedMetadata = { ...conversation.metadata, ...metadata };

      const { error } = await supabase
        .from('ai_conversations')
        .update({ metadata: updatedMetadata })
        .eq('id', conversation.id);

      if (error) throw error;

      setConversation(prev => prev ? {
        ...prev,
        metadata: updatedMetadata
      } : null);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update metadata';
      setError(errorMessage);
      return false;
    }
  }, [conversation]);

  return {
    conversation,
    messages: conversation?.messages || [],
    loading,
    error,
    sendMessage,
    clearConversation,
    loadConversation,
    updateMetadata
  };
};