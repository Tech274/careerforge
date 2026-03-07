import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeData, jobDescription, questionCount = 10 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const resumeContext = resumeData ? `
Resume Summary: ${resumeData.summary || "Not provided"}
Skills: ${(resumeData.skills || []).join(", ")}
Experience: ${(resumeData.experience || []).map((e: any) => `${e.role} at ${e.company}`).join("; ")}
Education: ${(resumeData.education || []).map((e: any) => `${e.degree} from ${e.institution}`).join("; ")}
` : "No resume provided";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          {
            role: "system",
            content: `You are an expert interview coach. Generate ${questionCount} practice interview questions based on the candidate's resume and optional job description. Include a mix of:
- Behavioral questions (STAR method)
- Technical questions related to their skills
- Situational/problem-solving questions
- Culture fit questions

For each question, provide:
- The question itself
- Category (behavioral, technical, situational, culture)
- Difficulty (easy, medium, hard)
- A brief tip on how to answer well
- A sample strong answer outline

Return ONLY a JSON object: {"questions": [{"question": "...", "category": "...", "difficulty": "...", "tip": "...", "sampleAnswer": "..."}]}. No markdown.`,
          },
          {
            role: "user",
            content: `${resumeContext}${jobDescription ? `\n\nJob Description:\n${jobDescription}` : ""}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };
    } catch {
      parsed = { questions: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("interview-prep error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
