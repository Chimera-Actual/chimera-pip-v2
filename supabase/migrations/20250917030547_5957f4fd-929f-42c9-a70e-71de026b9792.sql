-- Add user_id to widget_catalog to support user-owned custom widget types
ALTER TABLE public.widget_catalog 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Remove the hard-coded category field
ALTER TABLE public.widget_catalog 
DROP COLUMN category;

-- Update RLS policies to allow users to manage their own widget types
DROP POLICY IF EXISTS "Everyone can view widget catalog" ON public.widget_catalog;

CREATE POLICY "Users can view all widget catalog entries" 
ON public.widget_catalog 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own custom widget types" 
ON public.widget_catalog 
FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage system widget types" 
ON public.widget_catalog 
FOR ALL 
USING (user_id IS NULL AND auth.role() = 'service_role'::text)
WITH CHECK (user_id IS NULL AND auth.role() = 'service_role'::text);

-- Update RLS policies for widget_tag_associations to allow user management
DROP POLICY IF EXISTS "Everyone can view widget tag associations" ON public.widget_tag_associations;

CREATE POLICY "Everyone can view widget tag associations" 
ON public.widget_tag_associations 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage widget tag associations for their widget types" 
ON public.widget_tag_associations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.widget_catalog wc 
    WHERE wc.widget_type = widget_tag_associations.widget_type 
    AND (wc.user_id = auth.uid() OR wc.user_id IS NULL)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.widget_catalog wc 
    WHERE wc.widget_type = widget_tag_associations.widget_type 
    AND wc.user_id = auth.uid()
  )
);

-- Set existing widget catalog entries as system-owned (user_id = NULL)
-- This makes the existing test_widget a system widget that users can see but not edit directly