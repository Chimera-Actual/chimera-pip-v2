-- Schema hardening and function security improvements

-- Fix function search paths to prevent search_path attacks
ALTER FUNCTION public.update_user_presence_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_widget_changes() SET search_path = public, pg_temp;
ALTER FUNCTION public.assign_widget_display_order() SET search_path = public, pg_temp;
ALTER FUNCTION public.validate_password_strength(text) SET search_path = public, pg_temp;

-- Lock down public schema DDL to prevent unauthorized schema modifications
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;

-- Ensure proper table permissions (already handled by RLS, but explicit grants)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Note: PostGIS extensions in public schema warning
-- WARNING: PostGIS extensions are installed in public schema
-- This is standard for PostGIS and cannot be easily changed on Supabase
-- Risk mitigation: RLS policies and explicit grants control access
-- Monitor extension updates and review permissions regularly