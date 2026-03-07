import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { resumeData, section } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert LinkedIn profile optimization consultant. You help professionals create compelling LinkedIn profiles that attract recruiters and opportunities.

When given resume data, generate LinkedIn-optimized content. Always be professional, concise, and keyword-rich.

Return your response as valid JSON with the following structure:
{
  "headline": "A compelling LinkedIn headline (max 220 chars)",
  "about": "A 5-6 line professional LinkedIn About section",
  "experience": [{"company": "...", "role": "...", "description": "LinkedIn-optimized description"}],
  "keywords": ["keyword1", "keyword2", ...]
}

If a specific section is requested, only return that section's content.`;

    let userPrompt = "";
    if (section === "headline") {
      userPrompt = `Generate a compelling LinkedIn headline for this professional. Return JSON: {"headline": "..."}\n\nResume data:\n${JSON.stringify(resumeData)}`;
    } else if (section === "about") {
      userPrompt = `Generate a LinkedIn About section (5-6 lines) for this professional. Return JSON: {"about": "..."}\n\nResume data:\n${JSON.stringify(resumeData)}`;
    } else if (section === "experience") {
      userPrompt = `Optimize these work experience entries for LinkedIn. Return JSON: {"experience": [{"company":"...","role":"...","description":"..."}]}\n\nResume data:\n${JSON.stringify(resumeData)}`;
    } else if (section === "keywords") {
      userPrompt = `Suggest 10-15 high-performing LinkedIn keywords for this professional. Return JSON: {"keywords": [...]}\n\nResume data:\n${JSON.stringify(resumeData)}`;
    } else {
      userPrompt = `Generate a complete LinkedIn profile optimization for this professional. Return the full JSON with headline, about, experience, and keywords.\n\nResume data:\n${JSON.stringify(resumeData)}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Could not parse AI response" };
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("linkedin-optimize error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
