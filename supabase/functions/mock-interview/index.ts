import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, answer, category, resumeData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert interview coach evaluating a candidate's response.
Evaluate the answer critically but constructively. Score each dimension 0-100.
Consider: clarity, structure (STAR method for behavioral), relevance, specificity, confidence.

Return ONLY JSON:
{
  "overallScore": 75,
  "scores": {
    "clarity": 80,
    "structure": 70,
    "relevance": 85,
    "specificity": 65,
    "confidence": 75
  },
  "strengths": ["..."],
  "improvements": ["..."],
  "improvedAnswer": "A stronger version of their answer...",
  "verdict": "Good"
}
verdict must be one of: "Excellent", "Good", "Fair", "Needs Work". No markdown.`,
          },
          {
            role: "user",
            content: `Question (${category || "general"}): ${question}

Candidate's Answer: ${answer}

${resumeData ? `Context — Candidate background: ${resumeData?.personalInfo?.name}, ${(resumeData?.skills || []).slice(0, 8).join(", ")}` : ""}`,
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
      parsed = { overallScore: 0, scores: {}, strengths: [], improvements: [], improvedAnswer: "", verdict: "Fair" };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("mock-interview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
