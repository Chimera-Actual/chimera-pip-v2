-- Enable RLS and create comprehensive user authentication system

-- Users table with vault identity and character stats
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  vault_number integer UNIQUE NOT NULL,
  character_name text,
  special_stats jsonb DEFAULT '{"strength":5,"perception":5,"endurance":5,"charisma":5,"intelligence":5,"agility":5,"luck":5}',
  level integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  karma integer DEFAULT 0,
  theme_config jsonb DEFAULT '{"colorScheme":"green","soundEnabled":true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User widgets configurations
CREATE TABLE public.user_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  widget_type text NOT NULL,
  widget_config jsonb NOT NULL,
  position jsonb NOT NULL DEFAULT '{"x":0,"y":0}',
  size jsonb NOT NULL DEFAULT '{"width":300,"height":200}',
  tab_assignment text NOT NULL CHECK (tab_assignment IN ('STAT','INV','DATA','MAP','RADIO')),
  is_collapsed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User achievements tracking
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_data jsonb,
  unlocked_at timestamptz DEFAULT now()
);

-- User activities for XP and analytics
CREATE TABLE public.user_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_data jsonb,
  experience_gained integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_widgets table
CREATE POLICY "Users can manage own widgets" ON public.user_widgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable widget creation for authenticated users" ON public.user_widgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements table
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can award achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_activities table
CREATE POLICY "Users can view own activities" ON public.user_activities
  FOR ALL USING (auth.uid() = user_id);

-- Function to generate unique vault numbers
CREATE OR REPLACE FUNCTION public.generate_vault_number()
RETURNS INTEGER AS $$
DECLARE
  vault_num INTEGER;
BEGIN
  LOOP
    vault_num := floor(random() * 999) + 1;
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE vault_number = vault_num) THEN
      RETURN vault_num;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, vault_number, special_stats, theme_config)
  VALUES (
    NEW.id,
    NEW.email,
    public.generate_vault_number(),
    '{"strength":5,"perception":5,"endurance":5,"charisma":5,"intelligence":5,"agility":5,"luck":5}',
    '{"colorScheme":"green","soundEnabled":true}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_widgets_updated_at
  BEFORE UPDATE ON public.user_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();