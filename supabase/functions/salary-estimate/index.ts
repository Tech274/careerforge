import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jobTitle, company, location, resumeData } = await req.json();
    
    if (!jobTitle?.trim()) {
      return new Response(JSON.stringify({ error: "Job title is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const yearsExp = (resumeData?.experience || []).length * 2; // rough estimate
    const skills = (resumeData?.skills || []).slice(0, 8).join(", ");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          {
            role: "system",
            content: `You are a compensation expert with up-to-date salary data. Provide realistic salary estimates.
Return ONLY JSON (no markdown):
{
  "low": 80000,
  "median": 100000,
  "high": 130000,
  "currency": "USD",
  "totalCompLow": 90000,
  "totalCompHigh": 160000,
  "notes": "Brief explanation of the range",
  "negotiationTip": "Specific advice for negotiating this role",
  "marketTrend": "growing|stable|declining",
  "topPayingLocations": ["San Francisco", "New York", "Seattle"]
}
Use realistic 2024-2025 market data. All numbers are annual base salary in USD unless specified.`,
          },
          {
            role: "user",
            content: `Job Title: ${jobTitle}
Company: ${company || "unknown company"}
Location: ${location || "Remote / US"}
Candidate experience: ~${yearsExp} years
Key skills: ${skills}`,
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
      parsed = { low: 0, median: 0, high: 0, currency: "USD", notes: "Unable to estimate", negotiationTip: "", marketTrend: "stable" };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("salary-estimate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
