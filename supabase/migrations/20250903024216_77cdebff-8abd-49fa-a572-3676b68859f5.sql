-- Update user_widgets table to use grid-based positioning
ALTER TABLE user_widgets 
DROP COLUMN IF EXISTS widget_order,
ADD COLUMN IF NOT EXISTS grid_position jsonb NOT NULL DEFAULT '{"row": 0, "col": 0, "width": 2, "height": 2}'::jsonb;

-- Update existing widgets to have default grid positions
WITH numbered_widgets AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id, tab_assignment ORDER BY created_at) - 1 as position_index
  FROM user_widgets
)
UPDATE user_widgets 
SET grid_position = jsonb_build_object(
  'row', (numbered_widgets.position_index / 6) * 2,
  'col', (numbered_widgets.position_index % 6) * 2,
  'width', 2,
  'height', 2
)
FROM numbered_widgets
WHERE user_widgets.id = numbered_widgets.id;

-- Create index for efficient grid position queries
CREATE INDEX IF NOT EXISTS idx_user_widgets_grid_position ON user_widgets USING GIN (grid_position);