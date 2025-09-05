-- Phase 1: Database Schema Redesign for Widget Canvas
-- Remove the problematic unique constraint and simplify positioning

-- First, let's drop the unique constraint that's causing violations
ALTER TABLE user_widgets DROP CONSTRAINT IF EXISTS unique_user_tab_order_position;

-- Rename order_position to display_order for clarity and remove uniqueness requirement
ALTER TABLE user_widgets RENAME COLUMN order_position TO display_order;

-- Ensure display_order has a reasonable default and handles nulls
ALTER TABLE user_widgets ALTER COLUMN display_order SET DEFAULT 0;
UPDATE user_widgets SET display_order = 0 WHERE display_order IS NULL;

-- Create a simple index for performance (non-unique)
CREATE INDEX IF NOT EXISTS idx_user_widgets_display_order 
ON user_widgets(user_id, tab_assignment, display_order);

-- Add a simple sequence-based ordering for new widgets
-- This will be used as a fallback when display_order conflicts occur
ALTER TABLE user_widgets ADD COLUMN IF NOT EXISTS sequence_order SERIAL;

-- Update existing widgets to have proper sequence ordering
UPDATE user_widgets 
SET sequence_order = subq.row_num 
FROM (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY user_id, tab_assignment 
           ORDER BY display_order, created_at
         ) as row_num
  FROM user_widgets
) subq 
WHERE user_widgets.id = subq.id;

-- Create a function to automatically assign display_order for new widgets
CREATE OR REPLACE FUNCTION assign_widget_display_order()
RETURNS TRIGGER AS $$
BEGIN
  -- If display_order is not provided or is 0, assign the next available position
  IF NEW.display_order IS NULL OR NEW.display_order = 0 THEN
    SELECT COALESCE(MAX(display_order), 0) + 100
    INTO NEW.display_order
    FROM user_widgets 
    WHERE user_id = NEW.user_id 
    AND tab_assignment = NEW.tab_assignment;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic display_order assignment
DROP TRIGGER IF EXISTS trigger_assign_widget_display_order ON user_widgets;
CREATE TRIGGER trigger_assign_widget_display_order
  BEFORE INSERT ON user_widgets
  FOR EACH ROW
  EXECUTE FUNCTION assign_widget_display_order();

-- Add updated_at trigger for the table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_widgets_updated_at ON user_widgets;
CREATE TRIGGER update_user_widgets_updated_at
    BEFORE UPDATE ON user_widgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();