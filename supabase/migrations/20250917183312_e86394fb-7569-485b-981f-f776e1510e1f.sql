-- Add grid positioning fields to user_widgets table
ALTER TABLE public.user_widgets 
ADD COLUMN grid_x integer DEFAULT 0,
ADD COLUMN grid_y integer DEFAULT 0,
ADD COLUMN grid_width integer DEFAULT 1,
ADD COLUMN grid_height integer DEFAULT 1;

-- Update existing widgets to have grid positions based on display_order
-- This converts the current linear layout to a grid layout
WITH positioned_widgets AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id, tab_assignment ORDER BY display_order) - 1 as widget_index
  FROM user_widgets
  WHERE grid_x IS NULL OR grid_x = 0
)
UPDATE user_widgets 
SET 
  grid_x = (positioned_widgets.widget_index % 2) * 6, -- 0 or 6 (left/right in 12-col grid)
  grid_y = positioned_widgets.widget_index / 2,       -- row number
  grid_width = CASE 
    WHEN widget_width = 'full' THEN 12
    WHEN widget_width = 'half' THEN 6
    WHEN widget_width = 'third' THEN 4
    WHEN widget_width = 'quarter' THEN 3
    ELSE 6
  END,
  grid_height = 1
FROM positioned_widgets
WHERE user_widgets.id = positioned_widgets.id;