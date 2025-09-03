-- Remove size column and ensure all widgets have proper grid positions
-- First, update any widgets that might have invalid grid positions
UPDATE user_widgets 
SET grid_position = '{"col": 0, "row": 0, "width": 2, "height": 2}'::jsonb
WHERE grid_position IS NULL 
   OR NOT (grid_position ? 'col' AND grid_position ? 'row' AND grid_position ? 'width' AND grid_position ? 'height');

-- Remove the size column as it's no longer needed (we're using grid_position only)
ALTER TABLE user_widgets DROP COLUMN IF EXISTS size;

-- Remove the position column as it's also no longer needed (we're using grid_position only)  
ALTER TABLE user_widgets DROP COLUMN IF EXISTS position;

-- Update grid positions to be reasonable for new smaller grid system
-- Convert any oversized widgets to maximum reasonable sizes
UPDATE user_widgets 
SET grid_position = jsonb_set(
    jsonb_set(grid_position, '{width}', '4'),
    '{height}', '3'
)
WHERE (grid_position->>'width')::int > 4 OR (grid_position->>'height')::int > 3;