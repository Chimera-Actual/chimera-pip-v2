-- Add order column to user_widgets table
ALTER TABLE public.user_widgets ADD COLUMN widget_order INTEGER DEFAULT 0;

-- Update existing widgets with order based on creation time using WITH clause
WITH ordered_widgets AS (
  SELECT id, row_number() OVER (PARTITION BY user_id, tab_assignment ORDER BY created_at) as new_order
  FROM public.user_widgets
)
UPDATE public.user_widgets 
SET widget_order = ordered_widgets.new_order
FROM ordered_widgets
WHERE public.user_widgets.id = ordered_widgets.id;

-- Add index for better performance on ordering
CREATE INDEX idx_user_widgets_order ON public.user_widgets(user_id, tab_assignment, widget_order);