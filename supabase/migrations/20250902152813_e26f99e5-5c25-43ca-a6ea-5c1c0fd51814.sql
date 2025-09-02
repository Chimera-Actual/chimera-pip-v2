-- Fix security warnings by setting search path on functions

-- Fix generate_vault_number function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix handle_new_user function  
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;