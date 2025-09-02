-- Phase 1: Database Schema Enhancement for Advanced Tab & Widget Management System

-- Create user_tabs table for custom tab configurations
CREATE TABLE public.user_tabs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'FolderIcon',
  description TEXT,
  color TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_custom BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique positions per user
  UNIQUE(user_id, position)
);

-- Enable RLS for user_tabs
ALTER TABLE public.user_tabs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_tabs
CREATE POLICY "Users can manage their own tabs" 
ON public.user_tabs 
FOR ALL 
USING (auth.uid() = user_id);

-- Create widget_tags table for the tagging system
CREATE TABLE public.widget_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#00ff00',
  icon TEXT,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  user_id UUID,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique tag names per user (null user_id means global default tags)
  UNIQUE(name, user_id)
);

-- Enable RLS for widget_tags
ALTER TABLE public.widget_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for widget_tags
CREATE POLICY "Users can view all tags" 
ON public.widget_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own custom tags" 
ON public.widget_tags 
FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create widget_catalog table for enhanced widget metadata
CREATE TABLE public.widget_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  widget_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'productivity',
  featured BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT true,
  preview_image TEXT,
  default_settings JSONB NOT NULL DEFAULT '{}',
  required_permissions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for widget_catalog
ALTER TABLE public.widget_catalog ENABLE ROW LEVEL SECURITY;

-- Create policy for widget_catalog (read-only for all users)
CREATE POLICY "Everyone can view widget catalog" 
ON public.widget_catalog 
FOR SELECT 
USING (true);

-- Create widget_tag_associations table for many-to-many relationship
CREATE TABLE public.widget_tag_associations (
  widget_type TEXT NOT NULL,
  tag_id UUID NOT NULL REFERENCES public.widget_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  PRIMARY KEY (widget_type, tag_id)
);

-- Enable RLS for widget_tag_associations
ALTER TABLE public.widget_tag_associations ENABLE ROW LEVEL SECURITY;

-- Create policy for widget_tag_associations
CREATE POLICY "Everyone can view widget tag associations" 
ON public.widget_tag_associations 
FOR SELECT 
USING (true);

-- Create trigger to update updated_at columns
CREATE TRIGGER update_user_tabs_updated_at
  BEFORE UPDATE ON public.user_tabs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_widget_catalog_updated_at
  BEFORE UPDATE ON public.widget_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Pip-Boy tabs
INSERT INTO public.user_tabs (user_id, name, icon, description, position, is_default, is_custom)
SELECT 
  id as user_id,
  tab_data.name,
  tab_data.icon,
  tab_data.description,
  tab_data.position,
  true as is_default,
  false as is_custom
FROM public.users,
(VALUES 
  ('STAT', 'BarChart3', 'Character Statistics & System Status', 0),
  ('INV', 'Package', 'Digital Inventory & File Management', 1),
  ('DATA', 'Database', 'Information & Communication Hub', 2),
  ('MAP', 'Map', 'Location Services & Navigation', 3),
  ('RADIO', 'Radio', 'Media & Entertainment Center', 4)
) AS tab_data(name, icon, description, position)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_tabs WHERE user_tabs.user_id = users.id AND user_tabs.name = tab_data.name
);

-- Insert default widget tags
INSERT INTO public.widget_tags (name, color, icon, description, is_default, user_id, usage_count)
VALUES 
  ('Productivity', '#00ff00', 'BriefcaseIcon', 'Tools to help you get things done', true, null, 0),
  ('Entertainment', '#ff00ff', 'GamepadIcon', 'Fun and media widgets', true, null, 0),
  ('System', '#ffaa00', 'CpuIcon', 'System monitoring and management', true, null, 0),
  ('Communication', '#0088ff', 'MessageCircleIcon', 'Chat, email, and messaging tools', true, null, 0),
  ('Analytics', '#00ffff', 'TrendingUpIcon', 'Data analysis and reporting', true, null, 0),
  ('Weather', '#87ceeb', 'CloudIcon', 'Weather and environmental data', true, null, 0),
  ('Finance', '#ffd700', 'DollarSignIcon', 'Financial tracking and management', true, null, 0),
  ('Security', '#ff4444', 'ShieldIcon', 'Security and privacy tools', true, null, 0),
  ('Development', '#9370db', 'CodeIcon', 'Development and coding tools', true, null, 0),
  ('Personal', '#ff69b4', 'HeartIcon', 'Personal organization and tracking', true, null, 0)
ON CONFLICT (name, user_id) DO NOTHING;

-- Insert widget catalog entries
INSERT INTO public.widget_catalog (widget_type, name, description, icon, category, featured, default_settings)
VALUES 
  ('character-profile', 'Character Profile', 'Display vault dweller information including level, karma, and experience', 'UserIcon', 'productivity', true, '{"showLevel": true, "showKarma": true, "showVaultNumber": true, "showLastLogin": false, "showExperience": true}'),
  ('special-stats', 'S.P.E.C.I.A.L.', 'Interactive display of your character attributes', 'BarChartIcon', 'productivity', true, '{"showProgressBars": true, "showTooltips": true, "allowStatAdjustment": false, "displayStyle": "detailed"}'),
  ('system-monitor', 'System Monitor', 'Real-time system performance metrics and status', 'ActivityIcon', 'system', true, '{"refreshRate": 5000, "showGraphs": true, "monitoredMetrics": ["cpu", "memory", "network", "storage"], "alertThresholds": {"cpu": 80, "memory": 85, "network": 90, "storage": 90}}'),
  ('weather-station', 'Environmental Monitor', 'Environmental data including temperature, humidity, and radiation levels', 'CloudIcon', 'productivity', true, '{"temperatureUnit": "F", "showRadiation": true, "showAirQuality": true, "autoRefresh": true, "refreshInterval": 30000}'),
  ('news-terminal', 'News Terminal', 'Latest news updates and communications feed', 'NewspaperIcon', 'communication', false, '{"maxItems": 5, "autoRefresh": true, "refreshInterval": 60000, "categories": ["tech", "science", "general"], "showTimestamps": true}'),
  ('calendar-mission', 'Mission Control', 'Task management and mission scheduling interface', 'CalendarIcon', 'productivity', false, '{"showCompleted": false, "maxTasks": 10, "priorityFilter": ["high", "medium", "low"], "showDueDates": true}'),
  ('ai-oracle', 'AI Oracle', 'Intelligent assistant interface and interaction panel', 'BrainIcon', 'communication', true, '{"personality": "codsworth", "autoGreet": true, "responseSpeed": "normal", "showStatus": true}'),
  ('achievement-gallery', 'Achievement Gallery', 'Display unlocked achievements and progress tracking', 'TrophyIcon', 'entertainment', false, '{"showProgress": true, "displayMode": "grid", "hideUnlocked": false}'),
  ('file-explorer', 'File Explorer', 'Browse and manage files and documents', 'FolderIcon', 'productivity', false, '{"viewMode": "list", "showHidden": false, "sortBy": "name"}'),
  ('secure-vault', 'Secure Vault', 'Encrypted storage for sensitive information', 'LockIcon', 'system', false, '{"autoLock": true, "lockTimeout": 300000, "showPasswordStrength": true}'),
  ('audio-player', 'Audio Player', 'Music and audio playback interface', 'MusicIcon', 'entertainment', true, '{"showVisualizer": true, "autoplay": false, "repeat": false, "shuffle": false}')
ON CONFLICT (widget_type) DO NOTHING;

-- Create widget-tag associations
INSERT INTO public.widget_tag_associations (widget_type, tag_id)
SELECT 
  catalog.widget_type,
  tags.id as tag_id
FROM public.widget_catalog catalog
JOIN public.widget_tags tags ON tags.is_default = true
WHERE 
  (catalog.widget_type = 'character-profile' AND tags.name IN ('Productivity', 'Personal')) OR
  (catalog.widget_type = 'special-stats' AND tags.name IN ('Analytics', 'Personal')) OR
  (catalog.widget_type = 'system-monitor' AND tags.name IN ('System', 'Analytics')) OR
  (catalog.widget_type = 'weather-station' AND tags.name IN ('Weather', 'Productivity')) OR
  (catalog.widget_type = 'news-terminal' AND tags.name IN ('Communication', 'Productivity')) OR
  (catalog.widget_type = 'calendar-mission' AND tags.name IN ('Productivity', 'Personal')) OR
  (catalog.widget_type = 'ai-oracle' AND tags.name IN ('Communication', 'Productivity')) OR
  (catalog.widget_type = 'achievement-gallery' AND tags.name IN ('Entertainment', 'Personal')) OR
  (catalog.widget_type = 'file-explorer' AND tags.name IN ('Productivity', 'System')) OR
  (catalog.widget_type = 'secure-vault' AND tags.name IN ('Security', 'System')) OR
  (catalog.widget_type = 'audio-player' AND tags.name IN ('Entertainment', 'Productivity'))
ON CONFLICT (widget_type, tag_id) DO NOTHING;