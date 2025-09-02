-- Widget Settings Schema Registry
CREATE TABLE widget_settings_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_type TEXT NOT NULL UNIQUE,
  schema_version INTEGER NOT NULL DEFAULT 1,
  default_settings JSONB NOT NULL,
  settings_schema JSONB NOT NULL,
  validation_rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Widget Instance Settings
CREATE TABLE widget_instance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL,
  user_id UUID NOT NULL,
  widget_type TEXT NOT NULL,
  settings_overrides JSONB NOT NULL DEFAULT '{}',
  settings_merged JSONB NOT NULL,
  last_validated_at TIMESTAMP WITH TIME ZONE,
  validation_errors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(widget_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE widget_settings_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_instance_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for widget_settings_schemas (read-only for all authenticated users)
CREATE POLICY "Everyone can view widget schemas" 
ON widget_settings_schemas 
FOR SELECT 
USING (true);

-- RLS policies for widget_instance_settings (users can only access their own settings)
CREATE POLICY "Users can manage their own widget settings" 
ON widget_instance_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX idx_widget_instance_settings_widget_id ON widget_instance_settings(widget_id);
CREATE INDEX idx_widget_instance_settings_user_id ON widget_instance_settings(user_id);
CREATE INDEX idx_widget_instance_settings_type ON widget_instance_settings(widget_type);
CREATE INDEX idx_widget_settings_schemas_type ON widget_settings_schemas(widget_type);

-- Insert sample schemas for existing widgets
INSERT INTO widget_settings_schemas (widget_type, default_settings, settings_schema) VALUES
('character-profile', 
  '{"showLevel": true, "showKarma": true, "showVaultNumber": true, "showLastLogin": false}',
  '{
    "showLevel": {"type": "boolean", "label": "Show Level", "description": "Display character level", "group": "display"},
    "showKarma": {"type": "boolean", "label": "Show Karma", "description": "Display karma value", "group": "display"},
    "showVaultNumber": {"type": "boolean", "label": "Show Vault Number", "description": "Display vault identification", "group": "display"},
    "showLastLogin": {"type": "boolean", "label": "Show Last Login", "description": "Display last login time", "group": "advanced"}
  }'
),
('weather-station',
  '{"units": "metric", "showForecast": true, "showDetails": true, "refreshInterval": 300000, "apiKey": "", "location": "auto"}',
  '{
    "apiKey": {"type": "apikey", "label": "Weather API Key", "description": "OpenWeatherMap API key", "placeholder": "Enter your API key", "required": true, "group": "api"},
    "location": {"type": "string", "label": "Location", "description": "City name or coordinates", "placeholder": "London or 51.5074,-0.1278", "group": "general"},
    "units": {"type": "select", "label": "Units", "description": "Temperature units", "options": [{"value": "metric", "label": "Celsius"}, {"value": "imperial", "label": "Fahrenheit"}], "group": "general"},
    "showForecast": {"type": "boolean", "label": "Show Forecast", "description": "Display weather forecast", "group": "display"},
    "showDetails": {"type": "boolean", "label": "Show Details", "description": "Display humidity, wind, etc.", "group": "display"},
    "refreshInterval": {"type": "number", "label": "Refresh Interval (ms)", "description": "How often to update weather", "validation": {"min": 60000, "max": 3600000}, "group": "advanced"}
  }'
),
('system-monitor',
  '{"refreshRate": 5000, "showGraphs": true, "monitoredMetrics": ["cpu", "memory", "network"], "alertThresholds": {"cpu": 80, "memory": 85}}',
  '{
    "refreshRate": {"type": "number", "label": "Refresh Rate (ms)", "description": "Update frequency", "validation": {"min": 1000, "max": 60000}, "group": "general"},
    "showGraphs": {"type": "boolean", "label": "Show Graphs", "description": "Display metric bars", "group": "display"},
    "monitoredMetrics": {"type": "multiselect", "label": "Monitored Metrics", "description": "Which metrics to display", "options": [{"value": "cpu", "label": "CPU Usage"}, {"value": "memory", "label": "Memory Usage"}, {"value": "network", "label": "Network Activity"}, {"value": "storage", "label": "Storage Usage"}], "group": "general"},
    "alertThresholds": {"type": "string", "label": "Alert Thresholds (JSON)", "description": "JSON object with threshold values", "placeholder": "{\"cpu\": 80, \"memory\": 85}", "group": "advanced"}
  }'
),
('special-stats',
  '{"showBars": true, "showValues": true, "showTooltips": true, "layout": "vertical"}',
  '{
    "showBars": {"type": "boolean", "label": "Show Progress Bars", "description": "Display stat bars", "group": "display"},
    "showValues": {"type": "boolean", "label": "Show Numeric Values", "description": "Display stat numbers", "group": "display"},
    "showTooltips": {"type": "boolean", "label": "Show Tooltips", "description": "Display stat descriptions on hover", "group": "display"},
    "layout": {"type": "select", "label": "Layout", "description": "How to arrange stats", "options": [{"value": "vertical", "label": "Vertical"}, {"value": "horizontal", "label": "Horizontal"}, {"value": "grid", "label": "Grid"}], "group": "general"}
  }'
);

-- Add triggers for automatic updated_at timestamps
CREATE TRIGGER update_widget_settings_schemas_updated_at
BEFORE UPDATE ON widget_settings_schemas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_widget_instance_settings_updated_at
BEFORE UPDATE ON widget_instance_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();