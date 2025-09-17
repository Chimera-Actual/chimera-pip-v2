-- Create MAIN tab for all users and make it the primary tab
-- First, check if any user already has a MAIN tab to avoid conflicts
DO $$
BEGIN
  -- Only proceed if no users have a MAIN tab yet
  IF NOT EXISTS (SELECT 1 FROM public.user_tabs WHERE name = 'MAIN') THEN
    
    -- Update positions in descending order to avoid constraint conflicts
    UPDATE public.user_tabs 
    SET position = position + 1, updated_at = NOW()
    WHERE position >= 0
    ORDER BY position DESC;

    -- Insert MAIN tab for all users
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
    GROUP BY user_id;
    
  END IF;
END $$;