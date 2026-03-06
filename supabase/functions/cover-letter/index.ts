import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeData, jobTitle, company, hiringManager, jobDescription, tone = "professional" } = await req.json();
    
    if (!jobTitle?.trim() || !company?.trim()) {
      return new Response(JSON.stringify({ error: "Job title and company are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const name = resumeData?.personalInfo?.name || "the applicant";
    const skills = (resumeData?.skills || []).slice(0, 10).join(", ");
    const topExp = (resumeData?.experience || []).slice(0, 2).map((e: any) => `${e.role} at ${e.company}`).join("; ");
    const summary = resumeData?.summary || "";

    const toneInstructions: Record<string, string> = {
      professional: "formal, polished, and confident",
      friendly: "warm, approachable, and personable while remaining professional",
      bold: "assertive, energetic, and memorable — make the candidate stand out",
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          {
            role: "system",
            content: `You are an expert cover letter writer. Write a compelling, personalized cover letter.
Tone: ${toneInstructions[tone] || toneInstructions.professional}
Keep it 3-4 paragraphs. No generic filler. Make it specific to the role and company.
Return ONLY a JSON: {"subject": "...", "body": "...", "wordCount": 250}. The body should have proper paragraph breaks using \\n\\n. No markdown.`,
          },
          {
            role: "user",
            content: `Candidate: ${name}
Summary: ${summary}
Skills: ${skills}
Experience: ${topExp}

Target Role: ${jobTitle} at ${company}
${hiringManager ? `Hiring Manager: ${hiringManager}` : ""}
${jobDescription ? `Job Description:\n${jobDescription}` : ""}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI service error: ${status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { subject: "", body: "", wordCount: 0 };
    } catch {
      parsed = { subject: `Cover Letter — ${jobTitle} at ${company}`, body: content, wordCount: content.split(" ").length };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("cover-letter error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
