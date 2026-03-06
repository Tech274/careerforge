import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeData, company, role, recipientName, emailType = "cold_outreach", context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const name = resumeData?.personalInfo?.name || "the candidate";
    const skills = (resumeData?.skills || []).slice(0, 8).join(", ");
    const topExp = (resumeData?.experience || [])[0];
    const currentRole = topExp ? `${topExp.role} at ${topExp.company}` : "a professional";

    const emailTypeGuide: Record<string, string> = {
      cold_outreach: "cold outreach to a recruiter or hiring manager at a target company",
      referral_request: "requesting a referral from a connection who works at the company",
      follow_up: "follow-up after submitting an application with no response after 1-2 weeks",
      informational: "requesting a 15-minute informational interview to learn about the company",
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert job search coach writing highly personalized outreach emails.
Email type: ${emailTypeGuide[emailType] || emailTypeGuide.cold_outreach}
Keep it concise (150-200 words max), specific, and genuinely personalized. No generic templates.
Return ONLY JSON: {"subject": "...", "body": "...", "tips": ["tip1", "tip2", "tip3"]}. No markdown.`,
          },
          {
            role: "user",
            content: `From: ${name} (${currentRole})
Key skills: ${skills}
Target: ${role || "open role"} at ${company}
${recipientName ? `Recipient: ${recipientName}` : ""}
${context ? `Additional context: ${context}` : ""}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { subject: "", body: "", tips: [] };
    } catch {
      parsed = { subject: `Interest in ${role} at ${company}`, body: content, tips: [] };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("outreach-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
