-- Create user_api_keys table for secure API key storage
CREATE TABLE public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  key_name TEXT NOT NULL,
  api_url TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, service_name, key_name)
);

-- Enable Row Level Security
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage their own API keys" 
ON public.user_api_keys 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_api_keys_updated_at
BEFORE UPDATE ON public.user_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_user_api_keys_updated_at();

-- Create index for performance
CREATE INDEX idx_user_api_keys_user_id ON public.user_api_keys(user_id);
CREATE INDEX idx_user_api_keys_service ON public.user_api_keys(user_id, service_name);