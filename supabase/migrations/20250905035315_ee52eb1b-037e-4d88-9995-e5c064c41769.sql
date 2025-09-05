-- Fix security warnings: Set search_path for functions

-- Fix the assign_widget_display_order function
CREATE OR REPLACE FUNCTION assign_widget_display_order()
RETURNS TRIGGER AS $$
BEGIN
  -- If display_order is not provided or is 0, assign the next available position
  IF NEW.display_order IS NULL OR NEW.display_order = 0 THEN
    SELECT COALESCE(MAX(display_order), 0) + 100
    INTO NEW.display_order
    FROM user_widgets 
    WHERE user_id = NEW.user_id 
    AND tab_assignment = NEW.tab_assignment;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Fix the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';