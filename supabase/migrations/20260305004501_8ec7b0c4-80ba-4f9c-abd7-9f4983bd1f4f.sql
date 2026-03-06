ALTER TABLE public.profiles ALTER COLUMN username SET DEFAULT NULL;
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;

-- Recreate trigger function to also set username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.id::text);
  RETURN NEW;
END;
$$;