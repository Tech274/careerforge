import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeData, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const resumeText = `
Name: ${resumeData?.personalInfo?.name || ""}
Title: ${resumeData?.personalInfo?.title || ""}
Summary: ${resumeData?.summary || ""}
Skills: ${(resumeData?.skills || []).join(", ")}
Experience: ${(resumeData?.experience || []).map((e: any) => `${e.role} at ${e.company}: ${e.description}`).join("\n")}
Education: ${(resumeData?.education || []).map((e: any) => `${e.degree} ${e.field} from ${e.institution}`).join("; ")}
    `.trim();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          {
            role: "system",
            content: `You are a recruitment expert assessing resume-job fit.
Analyze how well the resume matches the job description across multiple dimensions.
Be honest — don't inflate scores.
Return ONLY JSON (no markdown):
{
  "overallMatch": 72,
  "verdict": "Strong Match",
  "applyRecommendation": "Apply",
  "dimensions": {
    "skills": { "score": 80, "matched": ["Python", "React"], "missing": ["Kubernetes", "Go"] },
    "experience": { "score": 70, "assessment": "3 years relevant experience, role asks for 5+" },
    "education": { "score": 90, "assessment": "Degree matches requirements" },
    "titleAlignment": { "score": 85, "assessment": "Current title closely matches target" }
  },
  "keyStrengths": ["..."],
  "gaps": ["Missing X years of experience", "No Kubernetes mentioned"],
  "quickFixes": ["Add X skill to resume", "Reword summary to match job language"],
  "shouldApply": true
}
verdict: "Strong Match" (80+), "Good Match" (60-79), "Partial Match" (40-59), "Long Shot" (<40)
applyRecommendation: "Apply", "Apply with tailoring", "Upskill first"`,
          },
          {
            role: "user",
            content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
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
      parsed = { overallMatch: 0, verdict: "Error", dimensions: {}, keyStrengths: [], gaps: [], quickFixes: [], shouldApply: false };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("job-match error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
