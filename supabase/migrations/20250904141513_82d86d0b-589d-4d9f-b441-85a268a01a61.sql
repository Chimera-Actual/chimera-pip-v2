-- Create AI Agents table for global agent configurations
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  webhook_url TEXT NOT NULL,
  system_prompt TEXT,
  model_parameters JSONB NOT NULL DEFAULT '{"temperature": 0.7, "max_tokens": 1000, "top_p": 1.0}'::jsonb,
  avatar_config JSONB NOT NULL DEFAULT '{"icon": "brain", "color": "#00ff00"}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI Conversations table for conversation history per widget instance  
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  widget_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agents
CREATE POLICY "Users can manage their own agents"
ON public.ai_agents
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared agents"
ON public.ai_agents  
FOR SELECT
USING (auth.uid() = user_id OR is_shared = true);

-- RLS Policies for ai_conversations
CREATE POLICY "Users can manage their own conversations"
ON public.ai_conversations
FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on ai_agents
CREATE TRIGGER update_ai_agents_updated_at
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on ai_conversations  
CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON public.ai_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_ai_agents_user_id ON public.ai_agents(user_id);
CREATE INDEX idx_ai_agents_is_default ON public.ai_agents(user_id, is_default) WHERE is_default = true;
CREATE INDEX idx_ai_conversations_widget_agent ON public.ai_conversations(widget_id, agent_id);
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);

-- Insert default agent templates for existing users
INSERT INTO public.ai_agents (user_id, name, description, webhook_url, system_prompt, model_parameters, avatar_config, is_default)
SELECT 
  u.id,
  'Codsworth Assistant',
  'A helpful general-purpose AI assistant with a polite, butler-like personality',
  'https://n8n.example.com/webhook/ai-chat',
  'You are Codsworth, a helpful AI assistant with a polite, respectful demeanor. Provide clear, concise responses while maintaining a friendly, professional tone.',
  '{"temperature": 0.7, "max_tokens": 1000, "top_p": 1.0, "response_length": "medium"}'::jsonb,
  '{"icon": "bot", "color": "#00ff00"}'::jsonb,
  true
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_agents a WHERE a.user_id = u.id
);