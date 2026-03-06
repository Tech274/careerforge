-- Add is_admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Prevent authenticated users from self-promoting to admin via RLS
CREATE OR REPLACE FUNCTION public.prevent_self_admin_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    RAISE EXCEPTION 'Cannot change is_admin via regular auth. Use service role.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS no_self_admin_promotion ON public.profiles;

CREATE TRIGGER no_self_admin_promotion
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (current_setting('role') = 'authenticated')
  EXECUTE FUNCTION public.prevent_self_admin_promotion();

-- NOTE: After running this migration, set yourself as admin via Supabase Studio SQL editor:
-- UPDATE public.profiles SET is_admin = true WHERE id = '<your-user-id>';
