-- Create user_agents table for per-user agent profiles
CREATE TABLE IF NOT EXISTS public.user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    system_message TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for efficient user queries
CREATE INDEX IF NOT EXISTS idx_user_agents_user ON public.user_agents(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own agents
CREATE POLICY "Users can CRUD their own agents" ON public.user_agents
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_agents_updated_at
    BEFORE UPDATE ON public.user_agents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_agents_updated_at();