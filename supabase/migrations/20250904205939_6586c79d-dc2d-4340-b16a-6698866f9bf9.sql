-- Enable leaked password protection in Supabase Auth
-- This migration addresses the security warning about disabled password protection

-- Enable leaked password protection
ALTER SYSTEM SET auth.password_leak_check_enabled = 'true';

-- Enhance the validate_password_strength function with additional security
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check minimum requirements (enhanced from 8 to 12 characters)
  IF length(password) < 12 THEN
    RETURN false;
  END IF;
  
  -- Check for mixed case
  IF NOT (password ~ '[a-z]' AND password ~ '[A-Z]') THEN
    RETURN false;
  END IF;
  
  -- Check for numbers
  IF NOT password ~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Check for special characters
  IF NOT password ~ '[^a-zA-Z0-9]' THEN
    RETURN false;
  END IF;
  
  -- Check for common patterns (enhanced)
  IF password ~* 'password|123456|qwerty|admin|vault|chimera|pip|fallout|nuclear' THEN
    RETURN false;
  END IF;
  
  -- Check for repeated characters (more than 3 in a row)
  IF password ~ '(.)\1{3,}' THEN
    RETURN false;
  END IF;
  
  -- Check for sequential characters (like 1234 or abcd)
  IF password ~* '(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- Add database performance indexes for frequently queried tables
CREATE INDEX IF NOT EXISTS idx_user_widgets_user_id_type ON user_widgets(user_id, widget_type);
CREATE INDEX IF NOT EXISTS idx_user_widgets_created_at ON user_widgets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_tabs_user_id_position ON user_tabs(user_id, position);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id_created ON user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_widget_instance_settings_widget_user ON widget_instance_settings(widget_id, user_id);

-- Add performance index for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_timestamp ON user_analytics(user_id, timestamp DESC);

COMMENT ON INDEX idx_user_widgets_user_id_type IS 'Optimize widget queries by user and type';
COMMENT ON INDEX idx_user_widgets_created_at IS 'Optimize widget ordering by creation time';
COMMENT ON INDEX idx_user_tabs_user_id_position IS 'Optimize tab queries and ordering';
COMMENT ON INDEX idx_user_presence_user_id ON user_presence(user_id) IS 'Optimize presence lookups';
COMMENT ON INDEX idx_user_activities_user_id_created ON user_activities(user_id, created_at DESC) IS 'Optimize activity feeds';
COMMENT ON INDEX idx_widget_instance_settings_widget_user ON widget_instance_settings(widget_id, user_id) IS 'Optimize widget settings queries';
COMMENT ON INDEX idx_user_analytics_user_timestamp ON user_analytics(user_id, timestamp DESC) IS 'Optimize analytics queries by user and time';