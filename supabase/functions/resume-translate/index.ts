import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeData, targetLanguage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const languageNotes: Record<string, string> = {
      Spanish: "Use formal Spanish (usted form). Dates: DD/MM/YYYY.",
      French: "Use formal French (vous form). Professional tone.",
      German: "Use formal German (Sie form). German date format DD.MM.YYYY.",
      Portuguese: "Use formal Brazilian Portuguese.",
      Japanese: "Use formal Japanese (敬語). Keep skills/tech terms in English.",
      Mandarin: "Use Simplified Chinese. Keep technical terms in English.",
      Italian: "Use formal Italian (Lei form).",
      Dutch: "Use formal Dutch.",
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert multilingual translator specializing in professional documents.
Translate the resume data to ${targetLanguage}.
${languageNotes[targetLanguage] || "Use formal professional language."}
IMPORTANT: Keep all proper nouns (company names, product names, tech skills) in their original form.
Do NOT translate: email addresses, URLs, dates, numbers, technical skill names (e.g. React, Python, AWS).
Return the COMPLETE resume data structure as JSON with all text fields translated. No markdown.`,
          },
          {
            role: "user",
            content: `Translate this resume data to ${targetLanguage}:\n\n${JSON.stringify(resumeData, null, 2)}`,
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
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : resumeData;
    } catch {
      parsed = resumeData;
    }

    return new Response(JSON.stringify({ translatedResume: parsed, language: targetLanguage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resume-translate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
