-- Fix user presence privacy vulnerability by adding proper RLS policy
-- Current user_presence table is exposing all users' presence data

-- First, check if user_presence table exists and has RLS enabled
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_presence') THEN
        -- Enable RLS if not already enabled
        ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can only see their own presence" ON public.user_presence;
        DROP POLICY IF EXISTS "Users can update their own presence" ON public.user_presence;
        DROP POLICY IF EXISTS "Users can insert their own presence" ON public.user_presence;
        
        -- Create secure RLS policies
        CREATE POLICY "Users can only see their own presence" 
        ON public.user_presence 
        FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own presence" 
        ON public.user_presence 
        FOR UPDATE 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own presence" 
        ON public.user_presence 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON public.user_presence(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_presence_status ON public.user_presence(status);
    END IF;
END
$$;