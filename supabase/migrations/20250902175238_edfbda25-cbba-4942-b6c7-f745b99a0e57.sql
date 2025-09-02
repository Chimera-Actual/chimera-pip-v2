-- Fix function search path security issue
-- This addresses the security linter warning about mutable search_path

-- Update the password validation function with proper search_path
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;