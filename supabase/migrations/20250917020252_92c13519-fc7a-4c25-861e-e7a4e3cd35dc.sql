-- Create MAIN tab for all users and make it the primary tab
-- First, shift existing tab positions to make room for MAIN tab at position 0
UPDATE public.user_tabs 
SET position = position + 1, updated_at = NOW()
WHERE position >= 0;

-- Insert MAIN tab for all users who don't have one
INSERT INTO public.user_tabs (user_id, name, icon, description, position, is_default, is_custom, created_at, updated_at)
SELECT DISTINCT 
  user_id,
  'MAIN' as name,
  'TerminalIcon' as icon,
  'Main user interface' as description,
  0 as position,
  true as is_default,
  false as is_custom,
  NOW() as created_at,
  NOW() as updated_at
FROM public.user_tabs
WHERE user_id NOT IN (
  SELECT user_id 
  FROM public.user_tabs 
  WHERE name = 'MAIN'
);