import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeData, targetRole, skillGaps } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const currentSkills = (resumeData?.skills || []).join(", ");
    const experience = (resumeData?.experience || []).map((e: any) => `${e.role} at ${e.company}`).join("; ");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a career development expert. Create a realistic, actionable career roadmap.
Provide a step-by-step learning plan with free and paid resources.
Return ONLY JSON (no markdown):
{
  "targetRole": "...",
  "estimatedTimeline": "6-12 months",
  "readinessScore": 65,
  "phases": [
    {
      "phase": 1,
      "title": "Foundation",
      "duration": "1-2 months",
      "description": "...",
      "skills": ["skill1", "skill2"],
      "resources": [
        { "title": "...", "type": "free|paid", "platform": "YouTube|Coursera|Udemy|Docs|Book", "url": "https://...", "duration": "10 hours" }
      ],
      "milestone": "What you'll be able to do after this phase"
    }
  ],
  "quickWins": ["Thing you can do this week to start", "..."],
  "certifications": [{ "name": "...", "provider": "...", "cost": "Free|$50" }]
}`,
          },
          {
            role: "user",
            content: `Current Skills: ${currentSkills}
Experience: ${experience}
Target Role: ${targetRole || "Senior Software Engineer"}
Identified Skill Gaps: ${skillGaps ? JSON.stringify(skillGaps) : "Not specified — infer from target role"}`,
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
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { phases: [], quickWins: [], certifications: [] };
    } catch {
      parsed = { phases: [], quickWins: [], certifications: [], estimatedTimeline: "Unknown", readinessScore: 0 };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("career-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
