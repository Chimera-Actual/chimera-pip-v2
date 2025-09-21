-- Update the default theme_config in users table to include all theme properties
-- First update existing users who have the old theme_config structure
UPDATE users 
SET theme_config = jsonb_build_object(
  'colorScheme', COALESCE(theme_config->>'colorScheme', 'green'),
  'soundEnabled', COALESCE((theme_config->>'soundEnabled')::boolean, true),
  'glowIntensity', 75,
  'scanLineIntensity', 50,
  'backgroundScanLines', 50,
  'scrollingScanLines', 'normal',
  'layoutMode', 'tabbed'
)
WHERE theme_config IS NOT NULL;

-- Update the column default to include all theme properties
ALTER TABLE users 
ALTER COLUMN theme_config 
SET DEFAULT '{"colorScheme": "green", "soundEnabled": true, "glowIntensity": 75, "scanLineIntensity": 50, "backgroundScanLines": 50, "scrollingScanLines": "normal", "layoutMode": "tabbed"}'::jsonb;