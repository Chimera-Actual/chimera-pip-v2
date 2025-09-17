-- Drop the restrictive check constraint on tab_assignment
ALTER TABLE user_widgets DROP CONSTRAINT IF EXISTS user_widgets_tab_assignment_check;

-- Add a more flexible constraint that allows tab_assignment to be any non-empty string
-- and optionally validates against user_tabs (but we'll keep it simple for now)
ALTER TABLE user_widgets ADD CONSTRAINT user_widgets_tab_assignment_check 
CHECK (length(trim(tab_assignment)) > 0);