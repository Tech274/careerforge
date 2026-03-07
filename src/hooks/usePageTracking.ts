import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function getOrCreateSessionId(): string {
  const KEY = "cf_session_id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

function getDeviceType(): "desktop" | "mobile" | "tablet" {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function usePageTracking() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    // Skip admin pages to keep traffic data clean
    if (pathname.startsWith("/admin")) return;
    // Dedup: skip if same path as last tracked
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const sessionId = getOrCreateSessionId();
    const deviceType = getDeviceType();
    const referrer = document.referrer || "";

    // Fire-and-forget — do NOT await so it never blocks navigation
    supabase
      .from("page_views")
      .insert({
        path: pathname,
        user_id: user?.id ?? null,
        session_id: sessionId,
        referrer,
        device_type: deviceType,
      })
      .then(({ error }) => {
        if (error) {
          console.debug("[PageTracking] insert error:", error.message);
        }
      });
  }, [pathname, user?.id]);
}
