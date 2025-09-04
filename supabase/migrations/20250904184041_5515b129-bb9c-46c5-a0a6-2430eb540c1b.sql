-- Migration to add title and customIcon fields to existing widget_config records
-- This ensures all existing widgets have proper data structure

-- Update existing widget_config records to include title and customIcon fields
UPDATE user_widgets 
SET widget_config = jsonb_set(
  jsonb_set(
    COALESCE(widget_config, '{}'),
    '{title}', 
    CASE 
      WHEN widget_config->>'title' IS NULL THEN
        to_jsonb(CASE widget_type
          WHEN 'character-profile' THEN 'Character Profile'
          WHEN 'special-stats' THEN 'S.P.E.C.I.A.L. Stats'
          WHEN 'system-monitor' THEN 'System Monitor'
          WHEN 'weather-station' THEN 'Weather Station'
          WHEN 'achievement-gallery' THEN 'Achievement Gallery'
          WHEN 'file-explorer' THEN 'File Explorer'
          WHEN 'secure-vault' THEN 'Secure Vault'
          WHEN 'news-terminal' THEN 'News Terminal'
          WHEN 'audio-player' THEN 'Audio Player'
          WHEN 'calendar-mission' THEN 'Mission Calendar'
          WHEN 'ai-oracle' THEN 'AI Oracle'
          WHEN 'cryptocurrency' THEN 'Cryptocurrency'
          WHEN 'terminal' THEN 'Terminal'
          ELSE 'Widget'
        END)
      ELSE widget_config->'title'
    END
  ),
  '{customIcon}',
  CASE 
    WHEN widget_config->>'customIcon' IS NULL THEN
      to_jsonb(CASE widget_type
        WHEN 'character-profile' THEN 'user'
        WHEN 'special-stats' THEN 'zap'
        WHEN 'system-monitor' THEN 'activity'
        WHEN 'weather-station' THEN 'cloud-sun'
        WHEN 'achievement-gallery' THEN 'award'
        WHEN 'file-explorer' THEN 'folder'
        WHEN 'secure-vault' THEN 'shield'
        WHEN 'news-terminal' THEN 'newspaper'
        WHEN 'audio-player' THEN 'music'
        WHEN 'calendar-mission' THEN 'calendar'
        WHEN 'ai-oracle' THEN 'brain'
        WHEN 'cryptocurrency' THEN 'coins'
        WHEN 'terminal' THEN 'terminal'
        ELSE 'box'
      END)
    ELSE widget_config->'customIcon'
  END
)
WHERE widget_config->>'title' IS NULL 
   OR widget_config->>'customIcon' IS NULL;