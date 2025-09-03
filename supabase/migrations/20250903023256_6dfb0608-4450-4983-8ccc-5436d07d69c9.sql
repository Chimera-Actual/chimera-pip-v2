-- Add order column to widgets table and migrate existing data
ALTER TABLE public.widgets ADD COLUMN widget_order INTEGER DEFAULT 0;

-- Update existing widgets with order based on creation time
UPDATE public.widgets 
SET widget_order = row_number() OVER (PARTITION BY user_id, tab_assignment ORDER BY created_at)
WHERE widget_order = 0;

-- Add index for better performance on ordering
CREATE INDEX idx_widgets_order ON public.widgets(user_id, tab_assignment, widget_order);