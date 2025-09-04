import { useState, useCallback } from 'react';
import { AiAgent } from '@/types/widgets';
import { useToast } from '@/hooks/use-toast';

export interface AgentFormData {
  name: string;
  description: string;
  webhookUrl: string;
  systemPrompt: string;
  modelParameters: AiAgent['modelParameters'];
  avatarConfig: {
    icon: string;
    color: string;
  };
  isDefault: boolean;
  isShared: boolean;
}

const defaultAgentForm: AgentFormData = {
  name: '',
  description: '',
  webhookUrl: '',
  systemPrompt: '',
  modelParameters: {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0
  },
  avatarConfig: {
    icon: 'brain',
    color: '#00ff00'
  },
  isDefault: false,
  isShared: false
};

export const useAgentForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AgentFormData>(defaultAgentForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof AgentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateNestedField = useCallback((parentField: keyof AgentFormData, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [childField]: value
      }
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Agent name is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.webhookUrl.trim()) {
      toast({
        title: "Validation Error", 
        description: "Webhook URL is required.",
        variant: "destructive"
      });
      return false;
    }

    // Basic URL validation
    try {
      new URL(formData.webhookUrl);
    } catch {
      toast({
        title: "Validation Error",
        description: "Please enter a valid webhook URL.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [formData, toast]);

  const resetForm = useCallback(() => {
    setFormData(defaultAgentForm);
  }, []);

  const loadAgent = useCallback((agent: AiAgent) => {
    setFormData({
      name: agent.name,
      description: agent.description || '',
      webhookUrl: agent.webhookUrl,
      systemPrompt: agent.systemPrompt || '',
      modelParameters: agent.modelParameters,
      avatarConfig: agent.avatarConfig,
      isDefault: agent.isDefault,
      isShared: agent.isShared
    });
  }, []);

  return {
    formData,
    isSubmitting,
    setIsSubmitting,
    updateField,
    updateNestedField,
    validateForm,
    resetForm,
    loadAgent,
    defaultAgentForm
  };
};