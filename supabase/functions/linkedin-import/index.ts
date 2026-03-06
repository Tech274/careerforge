import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { linkedinText } = await req.json();
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
            content: `You are a resume data extractor. Parse LinkedIn profile text into structured resume data.
Return ONLY JSON (no markdown):
{
  "personalInfo": {
    "name": "...",
    "title": "...",
    "email": "",
    "phone": "",
    "location": "...",
    "website": "..."
  },
  "summary": "Professional summary extracted from About section",
  "experience": [
    {
      "id": "uuid-1",
      "role": "Job Title",
      "company": "Company Name",
      "location": "",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "current": true,
      "description": "Key responsibilities and achievements..."
    }
  ],
  "education": [
    {
      "id": "uuid-1",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "institution": "University Name",
      "startDate": "2016",
      "endDate": "2020"
    }
  ],
  "skills": ["Skill1", "Skill2", "Skill3"],
  "certifications": [
    { "id": "uuid-1", "name": "...", "issuer": "...", "date": "..." }
  ]
}
Generate simple sequential IDs like "exp-1", "exp-2", "edu-1" etc.`,
          },
          {
            role: "user",
            content: `LinkedIn Profile Text:\n\n${linkedinText}`,
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
      parsed = { personalInfo: {}, experience: [], education: [], skills: [], certifications: [] };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("linkedin-import error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
