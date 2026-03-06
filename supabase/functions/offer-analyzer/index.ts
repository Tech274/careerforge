import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { offerText, resumeData, targetSalary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const skills = (resumeData?.skills || []).slice(0, 6).join(", ");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an employment lawyer and compensation expert analyzing a job offer letter.
Extract all compensation details and evaluate fairness. Flag any red flags.
Return ONLY JSON (no markdown):
{
  "overallScore": 78,
  "verdict": "Strong Offer",
  "extracted": {
    "baseSalary": 120000,
    "bonus": "10% target",
    "equity": "0.1% over 4 years",
    "pto": "Unlimited",
    "healthBenefits": "Full coverage",
    "startDate": "2024-02-01",
    "vestingSchedule": "4-year with 1-year cliff"
  },
  "marketComparison": "Above median for the role",
  "redFlags": ["Non-compete clause spanning 2 years is aggressive", "..."],
  "greenFlags": ["Equity vesting is standard", "..."],
  "negotiationPoints": [
    { "item": "Base Salary", "current": "$120,000", "suggestion": "Ask for $130,000", "reasoning": "..." }
  ],
  "negotiationScript": "I'm excited about the offer. Based on my research...",
  "summary": "This is a solid offer with competitive compensation..."
}`,
          },
          {
            role: "user",
            content: `Offer Letter / Details:\n${offerText}

${targetSalary ? `Candidate's target salary: $${targetSalary}` : ""}
${skills ? `Candidate's key skills: ${skills}` : ""}`,
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
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      parsed = { overallScore: 0, verdict: "Unable to analyze", redFlags: [], greenFlags: [], negotiationPoints: [], summary: "" };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("offer-analyzer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
