-- Fix the news terminal categories field type from 'multi-select' to 'multiselect'
UPDATE widget_settings_schemas 
SET settings_schema = jsonb_set(
  settings_schema, 
  '{categories,type}', 
  '"multiselect"'::jsonb
)
WHERE widget_type = 'news-terminal' AND settings_schema->'categories'->>'type' = 'multi-select';