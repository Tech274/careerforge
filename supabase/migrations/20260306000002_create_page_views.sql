-- Page views table for real-time traffic tracking
CREATE TABLE IF NOT EXISTS public.page_views (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path        TEXT        NOT NULL,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT        NOT NULL DEFAULT '',
  referrer    TEXT        DEFAULT '',
  device_type TEXT        DEFAULT 'desktop'
    CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common admin queries (time-range, path grouping, user lookup)
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON public.page_views (viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path      ON public.page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id   ON public.page_views (user_id);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- INSERT: open to both anon and authenticated users (tracking works before login)
CREATE POLICY "Anyone can insert page views"
  ON public.page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT: service role only (admin edge function uses SUPABASE_SERVICE_ROLE_KEY)
-- No SELECT policy for regular users — page_views are admin-only reads
