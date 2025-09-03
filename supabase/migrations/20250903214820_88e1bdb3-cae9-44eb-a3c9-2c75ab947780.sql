-- Fix function search path security warnings
-- Update functions to have proper search_path settings

CREATE OR REPLACE FUNCTION public.update_user_presence_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;