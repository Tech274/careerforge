import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_user_id, visitor_info } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get profile owner's email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile_user_id);
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, username")
      .eq("id", profile_user_id)
      .single();

    // Get total visit count
    const { count } = await supabase
      .from("profile_visits")
      .select("*", { count: "exact", head: true })
      .eq("profile_user_id", profile_user_id);

    // Store notification in a simple approach - we'll use the Lovable AI to send
    // For now, log the visit notification details
    const notificationData = {
      email: userData.user.email,
      profileName: profile?.name || "Your profile",
      username: profile?.username,
      totalVisits: count || 0,
      visitTime: new Date().toISOString(),
      visitorInfo: visitor_info || "Anonymous visitor",
    };

    console.log("Profile visit notification:", notificationData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Visit notification recorded",
      totalVisits: count || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
