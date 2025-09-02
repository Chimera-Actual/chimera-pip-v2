-- Enable leaked password protection for enhanced security
-- This addresses the security linter warning about disabled password protection

-- Note: This setting is managed through the Supabase Auth configuration
-- The SQL migration cannot directly enable this feature as it's controlled 
-- through the dashboard settings, not database configuration

-- However, we can add a function to validate password strength on our side
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean AS $$
BEGIN
  -- Check minimum requirements
  IF length(password) < 8 THEN
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
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;