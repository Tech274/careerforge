import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
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

    // Get profile name and username
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

    const totalVisits = count || 0;
    const ownerEmail = userData.user.email;
    const profileName = profile?.name || "Your profile";
    const profileUrl = profile?.username
      ? `${Deno.env.get("SITE_URL") || "https://tech274.github.io/careerforge"}/u/${profile.username}`
      : null;

    // Send email notification via Resend (if API key is configured)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (RESEND_API_KEY) {
      const visitTime = new Date().toLocaleString("en-US", {
        timeZone: "UTC",
        dateStyle: "medium",
        timeStyle: "short",
      });

      const emailHtml = `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">&#x1F441;&#xFE0F; Profile Viewed!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Someone just visited your CareerForge profile</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
              <strong>${profileName}</strong>, someone checked out your profile on <strong>${visitTime} UTC</strong>.
            </p>
            ${visitor_info ? `<p style="color: #6b7280; font-size: 13px; margin: 0 0 16px;">Visitor info: ${visitor_info}</p>` : ""}
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; text-align: center; margin: 0 0 20px;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">Total profile views</p>
              <p style="color: #6366f1; font-size: 28px; font-weight: 700; margin: 0;">${totalVisits}</p>
            </div>
            ${profileUrl ? `
            <div style="text-align: center;">
              <a href="${profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">View My Profile</a>
            </div>` : ""}
          </div>
          <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">CareerForge — Your AI-powered career companion</p>
          </div>
        </div>
      `;

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CareerForge <noreply@careerforge.dev>",
          to: [ownerEmail],
          subject: `&#x1F441;&#xFE0F; Someone viewed your profile (${totalVisits} total views)`,
          html: emailHtml,
        }),
      });

      emailSent = resendRes.ok;
      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error("Resend error:", resendRes.status, errText);
      }
    } else {
      // Fallback: log notification (no email service configured)
      console.log("Profile visit notification (no email service):", {
        email: ownerEmail,
        profileName,
        totalVisits,
        visitTime: new Date().toISOString(),
        visitorInfo: visitor_info || "Anonymous visitor",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: emailSent ? "Visit notification email sent" : "Visit notification recorded",
        totalVisits,
        emailSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("notify-profile-visit error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
