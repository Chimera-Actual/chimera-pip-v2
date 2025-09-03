-- Remove complex grid positioning and add simple ordering system
ALTER TABLE user_widgets 
DROP COLUMN IF EXISTS grid_position;

-- Add new simplified layout fields
ALTER TABLE user_widgets 
ADD COLUMN order_position INTEGER NOT NULL DEFAULT 0,
ADD COLUMN widget_width TEXT CHECK (widget_width IN ('half', 'full')) NOT NULL DEFAULT 'half';

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_user_widgets_order ON user_widgets(user_id, tab_assignment, order_position);

-- Update existing widgets to have sequential order
WITH ordered_widgets AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY user_id, tab_assignment ORDER BY created_at) - 1 as new_order
  FROM user_widgets
)
UPDATE user_widgets 
SET order_position = ordered_widgets.new_order
FROM ordered_widgets 
WHERE user_widgets.id = ordered_widgets.id;