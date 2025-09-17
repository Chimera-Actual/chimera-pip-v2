-- Ensure all users have a default 'MAIN' tab
-- Create MAIN tab for users who don't have one
INSERT INTO public.user_tabs (user_id, name, icon, description, position, is_default, is_custom, created_at, updated_at)
SELECT 
  profiles.id as user_id,
  'MAIN' as name,
  'TerminalIcon' as icon,
  'Main user interface' as description,
  0 as position,
  true as is_default,
  false as is_custom,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users 
JOIN public.profiles ON profiles.user_id = auth.users.id
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.user_tabs 
  WHERE user_tabs.user_id = profiles.id 
  AND user_tabs.name = 'MAIN'
);

-- Update positions so MAIN tab is always first (position 0)
UPDATE public.user_tabs 
SET position = position + 1, updated_at = NOW()
WHERE name != 'MAIN' AND position = 0;