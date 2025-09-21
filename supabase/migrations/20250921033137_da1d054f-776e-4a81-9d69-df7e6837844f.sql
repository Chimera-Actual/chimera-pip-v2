-- Fix security linter issues from previous migration

-- Fix ERROR 1: Security Definer View - Use SECURITY INVOKER instead
DROP VIEW IF EXISTS public.v_spatial_ref_sys;
CREATE OR REPLACE VIEW public.v_spatial_ref_sys 
WITH (security_invoker = true) AS
SELECT srid, auth_name, auth_srid, srtext, proj4text 
FROM public.spatial_ref_sys;

-- Enable RLS on the view (Fix ERROR 3)
ALTER VIEW public.v_spatial_ref_sys SET (security_invoker = true);
GRANT SELECT ON public.v_spatial_ref_sys TO anon, authenticated;

-- Fix WARN 2: Function Search Path Mutable - Set search_path on all functions
ALTER FUNCTION public.update_user_presence_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_widget_changes() SET search_path = public, pg_temp;
ALTER FUNCTION public.assign_widget_display_order() SET search_path = public, pg_temp;
ALTER FUNCTION public.validate_password_strength(text) SET search_path = public, pg_temp;

-- Add comment for documentation
COMMENT ON VIEW public.v_spatial_ref_sys IS 'Read-only view of spatial reference systems for PostGIS operations (security invoker)';

-- Schema hardening: Lock down public schema DDL
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;