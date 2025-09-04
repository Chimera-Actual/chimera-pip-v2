-- Create widget settings schemas for all widget types
INSERT INTO widget_settings_schemas (widget_type, schema_version, default_settings, settings_schema, validation_rules) VALUES 
(
  'character-profile',
  1,
  '{"showLevel": true, "showKarma": true, "showVaultNumber": true, "showLastLogin": true, "showExperience": true}',
  '{"showLevel": {"type": "boolean", "label": "Show Level", "group": "display"}, "showKarma": {"type": "boolean", "label": "Show Karma", "group": "display"}, "showVaultNumber": {"type": "boolean", "label": "Show Vault Number", "group": "display"}, "showLastLogin": {"type": "boolean", "label": "Show Last Login", "group": "display"}, "showExperience": {"type": "boolean", "label": "Show Experience", "group": "display"}}',
  '{}'
),
(
  'special-stats',
  1,
  '{"showProgressBars": true, "showTooltips": true, "allowStatAdjustment": false, "displayStyle": "detailed"}',
  '{"showProgressBars": {"type": "boolean", "label": "Show Progress Bars", "group": "display"}, "showTooltips": {"type": "boolean", "label": "Show Tooltips", "group": "display"}, "allowStatAdjustment": {"type": "boolean", "label": "Allow Stat Adjustment", "group": "general"}, "displayStyle": {"type": "select", "label": "Display Style", "options": [{"value": "compact", "label": "Compact"}, {"value": "detailed", "label": "Detailed"}, {"value": "minimal", "label": "Minimal"}], "group": "display"}}',
  '{}'
),
(
  'system-monitor',
  1,
  '{"refreshRate": 5000, "showGraphs": true, "monitoredMetrics": ["cpu", "memory", "network", "storage"], "alertThresholds": {"cpu": 80, "memory": 90, "network": 85, "storage": 90}}',
  '{"refreshRate": {"type": "number", "label": "Refresh Rate (ms)", "validation": {"min": 1000, "max": 60000}, "group": "general"}, "showGraphs": {"type": "boolean", "label": "Show Graphs", "group": "display"}, "monitoredMetrics": {"type": "multi-select", "label": "Monitored Metrics", "options": [{"value": "cpu", "label": "CPU"}, {"value": "memory", "label": "Memory"}, {"value": "network", "label": "Network"}, {"value": "storage", "label": "Storage"}], "group": "general"}, "alertThresholds": {"type": "object", "label": "Alert Thresholds", "group": "advanced"}}',
  '{"refreshRate": {"required": true, "range": [1000, 60000]}}'
),
(
  'weather-station',
  1,
  '{"temperatureUnit": "F", "showRadiation": true, "showAirQuality": true, "autoRefresh": true, "refreshInterval": 30000, "location": ""}',
  '{"temperatureUnit": {"type": "select", "label": "Temperature Unit", "options": [{"value": "F", "label": "Fahrenheit"}, {"value": "C", "label": "Celsius"}], "group": "general"}, "showRadiation": {"type": "boolean", "label": "Show Radiation", "group": "display"}, "showAirQuality": {"type": "boolean", "label": "Show Air Quality", "group": "display"}, "autoRefresh": {"type": "boolean", "label": "Auto Refresh", "group": "general"}, "refreshInterval": {"type": "number", "label": "Refresh Interval (ms)", "validation": {"min": 10000, "max": 300000}, "group": "general"}, "location": {"type": "text", "label": "Location", "group": "general"}}',
  '{"refreshInterval": {"required": true, "range": [10000, 300000]}}'
),
(
  'news-terminal',
  1,
  '{"maxItems": 10, "autoRefresh": true, "refreshInterval": 60000, "categories": ["general"], "showTimestamps": true}',
  '{"maxItems": {"type": "number", "label": "Max Items", "validation": {"min": 1, "max": 50}, "group": "general"}, "autoRefresh": {"type": "boolean", "label": "Auto Refresh", "group": "general"}, "refreshInterval": {"type": "number", "label": "Refresh Interval (ms)", "validation": {"min": 30000, "max": 600000}, "group": "general"}, "categories": {"type": "multi-select", "label": "Categories", "options": [{"value": "general", "label": "General"}, {"value": "tech", "label": "Technology"}, {"value": "science", "label": "Science"}, {"value": "business", "label": "Business"}], "group": "general"}, "showTimestamps": {"type": "boolean", "label": "Show Timestamps", "group": "display"}}',
  '{"maxItems": {"required": true, "range": [1, 50]}, "refreshInterval": {"required": true, "range": [30000, 600000]}}'
),
(
  'calendar-mission',
  1,
  '{"showCompleted": false, "maxTasks": 20, "priorityFilter": [], "showDueDates": true}',
  '{"showCompleted": {"type": "boolean", "label": "Show Completed", "group": "display"}, "maxTasks": {"type": "number", "label": "Max Tasks", "validation": {"min": 1, "max": 100}, "group": "general"}, "priorityFilter": {"type": "multi-select", "label": "Priority Filter", "options": [{"value": "low", "label": "Low"}, {"value": "medium", "label": "Medium"}, {"value": "high", "label": "High"}, {"value": "urgent", "label": "Urgent"}], "group": "general"}, "showDueDates": {"type": "boolean", "label": "Show Due Dates", "group": "display"}}',
  '{"maxTasks": {"required": true, "range": [1, 100]}}'
),
(
  'ai-oracle',
  1,
  '{"personality": "codsworth", "responseLength": "medium", "contextAware": true, "saveHistory": true}',
  '{"personality": {"type": "select", "label": "AI Personality", "options": [{"value": "codsworth", "label": "Codsworth"}, {"value": "modus", "label": "MODUS"}, {"value": "eden", "label": "Eden"}, {"value": "nick_valentine", "label": "Nick Valentine"}], "group": "general"}, "responseLength": {"type": "select", "label": "Response Length", "options": [{"value": "short", "label": "Short"}, {"value": "medium", "label": "Medium"}, {"value": "long", "label": "Long"}], "group": "general"}, "contextAware": {"type": "boolean", "label": "Context Aware", "group": "advanced"}, "saveHistory": {"type": "boolean", "label": "Save History", "group": "advanced"}}',
  '{}'
),
(
  'cryptocurrency',
  1,
  '{"currencies": ["BTC", "ETH"], "refreshInterval": 60000, "showChart": true, "alertThresholds": {}}',
  '{"currencies": {"type": "multi-select", "label": "Currencies", "options": [{"value": "BTC", "label": "Bitcoin"}, {"value": "ETH", "label": "Ethereum"}, {"value": "ADA", "label": "Cardano"}, {"value": "DOT", "label": "Polkadot"}], "group": "general"}, "refreshInterval": {"type": "number", "label": "Refresh Interval (ms)", "validation": {"min": 30000, "max": 300000}, "group": "general"}, "showChart": {"type": "boolean", "label": "Show Chart", "group": "display"}, "alertThresholds": {"type": "object", "label": "Alert Thresholds", "group": "advanced"}}',
  '{"refreshInterval": {"required": true, "range": [30000, 300000]}}'
),
(
  'terminal',
  1,
  '{"theme": "green", "fontSize": 14, "showPrompt": true, "enableSound": true}',
  '{"theme": {"type": "select", "label": "Theme", "options": [{"value": "green", "label": "Green"}, {"value": "amber", "label": "Amber"}, {"value": "blue", "label": "Blue"}], "group": "display"}, "fontSize": {"type": "number", "label": "Font Size", "validation": {"min": 10, "max": 24}, "group": "display"}, "showPrompt": {"type": "boolean", "label": "Show Prompt", "group": "display"}, "enableSound": {"type": "boolean", "label": "Enable Sound", "group": "general"}}',
  '{"fontSize": {"required": true, "range": [10, 24]}}'
)
ON CONFLICT (widget_type) DO UPDATE SET
  schema_version = EXCLUDED.schema_version,
  default_settings = EXCLUDED.default_settings,
  settings_schema = EXCLUDED.settings_schema,
  validation_rules = EXCLUDED.validation_rules,
  updated_at = now();