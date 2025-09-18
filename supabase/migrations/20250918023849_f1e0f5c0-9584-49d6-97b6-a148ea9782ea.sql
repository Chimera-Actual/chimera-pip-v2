-- Fix Security Issues from Previous Migration

-- Step 1: Fix function search paths for security
CREATE OR REPLACE FUNCTION validate_tab_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent renaming default tabs
  IF TG_OP = 'UPDATE' AND OLD.is_default = true AND NEW.name != OLD.name THEN
    RAISE EXCEPTION 'Cannot rename default tabs. Tab "%" is a system default tab.', OLD.name;
  END IF;
  
  -- Check for reserved names on custom tabs
  IF NEW.name IN ('INV', 'STAT', 'DATA', 'MAP', 'RADIO') AND NEW.is_custom = true THEN
    RAISE EXCEPTION 'Tab name "%" is reserved for system use. Please choose a different name.', NEW.name;
  END IF;
  
  -- Ensure name is not empty and properly formatted
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'Tab name cannot be empty';
  END IF;
  
  -- Limit name length for consistency
  IF length(NEW.name) > 20 THEN
    RAISE EXCEPTION 'Tab name cannot exceed 20 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 2: Fix handle_tab_name_change function search path
CREATE OR REPLACE FUNCTION handle_tab_name_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If tab name changed, update all widgets that reference this tab
  IF TG_OP = 'UPDATE' AND OLD.name != NEW.name THEN
    UPDATE user_widgets 
    SET tab_assignment = NEW.name,
        updated_at = now()
    WHERE tab_assignment = OLD.name 
    AND user_id = NEW.user_id;
    
    -- Log the cascading update
    INSERT INTO audit_logs (
      user_id, table_name, operation, record_id, 
      old_values, new_values
    ) VALUES (
      NEW.user_id, 'user_widgets', 'CASCADE_UPDATE', NEW.id,
      jsonb_build_object('old_tab_name', OLD.name),
      jsonb_build_object('new_tab_name', NEW.name, 'widgets_updated', 
        (SELECT count(*) FROM user_widgets WHERE tab_assignment = NEW.name AND user_id = NEW.user_id))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;