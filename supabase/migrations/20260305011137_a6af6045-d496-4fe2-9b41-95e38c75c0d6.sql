
-- Resume variants for tailoring
CREATE TABLE public.resume_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  variant_type TEXT NOT NULL DEFAULT 'tailored',
  job_description TEXT DEFAULT '',
  resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  title TEXT NOT NULL DEFAULT 'Tailored Resume',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own variants" ON public.resume_variants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own variants" ON public.resume_variants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own variants" ON public.resume_variants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Resume version history
CREATE TABLE public.resume_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version_number INT NOT NULL DEFAULT 1,
  resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  template TEXT NOT NULL DEFAULT 'modern',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own versions" ON public.resume_versions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own versions" ON public.resume_versions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Profile visits tracking
CREATE TABLE public.profile_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL,
  visitor_ip TEXT DEFAULT '',
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visits" ON public.profile_visits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can view own visits" ON public.profile_visits FOR SELECT TO authenticated USING (auth.uid() = profile_user_id);

-- Add bio and public visibility to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Allow public read for public profiles
CREATE POLICY "Anyone can view public profiles" ON public.profiles FOR SELECT TO anon USING (is_public = true);
