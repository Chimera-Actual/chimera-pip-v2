-- Fix Tab Name Change Trigger - Remove Invalid CASCADE_UPDATE Operation

-- Update the handle_tab_name_change function to use valid audit log operations
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
    
    -- Log the cascading update using valid operation 'UPDATE'
    INSERT INTO audit_logs (
      user_id, table_name, operation, record_id, 
      old_values, new_values
    ) VALUES (
      NEW.user_id, 'user_widgets', 'UPDATE', NEW.id,
      jsonb_build_object('old_tab_name', OLD.name, 'operation_type', 'cascade_update'),
      jsonb_build_object('new_tab_name', NEW.name, 'widgets_updated', 
        (SELECT count(*) FROM user_widgets WHERE tab_assignment = NEW.name AND user_id = NEW.user_id))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;