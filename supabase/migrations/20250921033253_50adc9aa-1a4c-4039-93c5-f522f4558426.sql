-- Enable RLS on spatial_ref_sys table directly 
-- (This is needed because views can't have RLS)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a simple read-only policy for spatial reference data
DROP POLICY IF EXISTS p_spatial_read ON public.spatial_ref_sys;
CREATE POLICY p_spatial_read ON public.spatial_ref_sys
  FOR SELECT TO anon, authenticated
  USING (true);

-- Set search_path on any remaining functions that need it
-- Check for any vector extension functions that need search_path
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT n.nspname as schema_name, p.proname as function_name
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.prokind = 'f'
        AND p.proname NOT LIKE 'vector_%'  -- Skip vector extension functions
        AND p.proname NOT LIKE '%_in'     -- Skip type I/O functions
        AND p.proname NOT LIKE '%_out'
        AND p.proname NOT LIKE '%_recv'
        AND p.proname NOT LIKE '%_send'
        AND NOT (p.proconfig @> ARRAY['search_path=public,pg_temp'] OR p.proconfig @> ARRAY['search_path=public'])
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I SET search_path = public, pg_temp', 
                         func_record.function_name);
        EXCEPTION WHEN OTHERS THEN
            -- Skip functions that can't be altered (like C functions from extensions)
            CONTINUE;
        END;
    END LOOP;
END
$$;