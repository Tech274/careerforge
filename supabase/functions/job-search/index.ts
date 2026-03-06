import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-origin, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PORTAL_URL_PATTERNS: Record<string, string> = {
  linkedin:    "https://www.linkedin.com/jobs/search/?keywords={TITLE}+{COMPANY}&location={LOCATION}",
  indeed:      "https://in.indeed.com/jobs?q={TITLE}+{COMPANY}&l={LOCATION}",
  naukri:      "https://www.naukri.com/jobs-in-india?k={TITLE}+{COMPANY}",
  glassdoor:   "https://www.glassdoor.co.in/Job/jobs.htm?typedKeyword={TITLE}+{COMPANY}",
  ambitionbox: "https://www.ambitionbox.com/jobs?designations={TITLE}&companies={COMPANY}",
  iamjobs:     "https://iamjobs.co.in/?s={TITLE}",
  iitjobs:     "https://iitjobs.com/?s={TITLE}",
  darwinbox:   "https://jobs.darwinbox.in/careers?q={TITLE}",
  bullhorn:    "https://app.bullhorn.com/careers/?q={TITLE}",
};

const ALL_PORTALS = Object.keys(PORTAL_URL_PATTERNS);

/** Normalise INR salary: AI sometimes returns full rupees (e.g. 1200000) instead of LPA (e.g. 12). */
function normaliseSalaryMin(raw: number, currency: string): number {
  if (currency !== "INR") return raw;
  // If value looks like full rupees (> 10_000), convert to LPA
  return raw > 10_000 ? Math.round(raw / 100_000) : raw;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      query = "",
      location = "",
      portals = ["all"],
      jobType = "all",
      experienceLevel = "all",
      sortBy = "relevance",
      page = 1,
      pageSize = 10,
      userSkills = [],
      userTitle = "",
      userLocation = "",
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Resolve portal list
    const resolvedPortals: string[] =
      portals.includes("all") || portals.length === 0 ? ALL_PORTALS : portals;

    const portalUrlSection = resolvedPortals
      .map((p) => `- ${p}: ${PORTAL_URL_PATTERNS[p] ?? ""}`)
      .join("\n");

    const effectiveQuery    = query.trim() || userTitle || "software engineer";
    const effectiveLocation = location.trim() || userLocation || "India";
    const hasSkills         = Array.isArray(userSkills) && userSkills.length > 0;

    // ── Filters active? ──────────────────────────────────────────────────────
    const jobTypeFilter   = jobType !== "all" ? `jobType MUST be exactly "${jobType}".` : "";
    const expFilter       = experienceLevel !== "all" ? `experienceLevel MUST be exactly "${experienceLevel}".` : "";

    const systemPrompt = `You are a job listing database simulator. Generate realistic, diverse, and contextually accurate job listings aggregated from multiple Indian and international job portals.

CRITICAL RULES:
1. Return ONLY a valid JSON object — no markdown, no explanation, no backtick code fences.
2. Use real, recognisable company names. Indian: TCS, Infosys, Wipro, HCL, Cognizant, Razorpay, Zepto, Swiggy, Zomato, Flipkart, PhonePe, Paytm, HDFC Bank, ICICI Bank, Bajaj Finance, Deloitte, PwC, KPMG, Accenture, IBM, Oracle, SAP, Capgemini, Freshworks, Meesho, Ola, Cred, Urban Company. US/Global: Google, Microsoft, Meta, Amazon, Apple, Stripe, Netflix, Shopify, Atlassian, Salesforce, Adobe, Twilio, Figma, Notion, Linear, Vercel.
3. Distribute listings EVENLY across the portals provided. Each job belongs to exactly ONE portal.
4. Salary rules:
   - India-based roles → INR lakh per annum (LPA). entry-level: 4-8 LPA, mid-level: 10-25 LPA, senior: 25-60 LPA, principal/staff: 60-120 LPA. Set salaryCurrency to "INR".
   - US/Remote international → USD thousands per year. junior: $70-100k, mid: $100-150k, senior: $150-200k. Set salaryCurrency to "USD".
   - salaryDisplay: "₹10L – ₹18L" for INR or "$120k – $160k" for USD.
5. matchScore: integer 0-100 representing % overlap between listing skills and userSkills. Set to null if userSkills is empty.
6. postedDaysAgo: integer 0-30, weighted toward 0-7. postedDisplay: "Today" (0), "Yesterday" (1), "N days ago" (2-13), "2 weeks ago" (14-20), "3 weeks ago" (21-27), "1 month ago" (28+).
7. isHot: true only if postedDaysAgo <= 1, else false.
8. Build applyUrl using the portal pattern below. URL-encode {TITLE} and {COMPANY} and {LOCATION} substitutions.
9. skills: 4-6 tags directly relevant to the job title only. No padding.
10. description: 2-3 sentences covering role purpose, team context, and key tech/domain.
11. jobType MUST be one of: "Full-time", "Part-time", "Contract", "Remote", "Internship".
12. experienceLevel MUST be one of: "0-2 years", "2-5 years", "5+ years".
13. The jobs array MUST contain exactly ${pageSize} entries.
${jobTypeFilter}
${expFilter}

Each job object must have these exact fields:
{
  "portal": "<one of the portals listed below>",
  "title": "<job title string>",
  "company": "<real company name>",
  "location": "<city, country or Remote>",
  "jobType": "<Full-time|Part-time|Contract|Remote|Internship>",
  "experienceLevel": "<0-2 years|2-5 years|5+ years>",
  "salaryMin": <number — LPA for INR, thousands for USD>,
  "salaryMax": <number — LPA for INR, thousands for USD>,
  "salaryCurrency": "<INR|USD>",
  "salaryDisplay": "<formatted string>",
  "description": "<2-3 sentence string>",
  "skills": ["tag1", "tag2", "tag3", "tag4"],
  "postedDaysAgo": <integer 0-30>,
  "postedDisplay": "<string>",
  "matchScore": <integer 0-100 or null>,
  "applyUrl": "<portal search URL with URL-encoded params>",
  "isHot": <boolean>
}

Portal URL patterns for applyUrl construction:
${portalUrlSection}

Return this exact top-level JSON with no additional text:
{
  "jobs": [ /* exactly ${pageSize} job objects */ ],
  "totalCount": <estimated total matching results across all pages>,
  "page": ${page},
  "pageSize": ${pageSize},
  "query": "${effectiveQuery}"
}`;

    const userPrompt = `Search Criteria:
- Query: ${effectiveQuery}
- Location: ${effectiveLocation}
- Portals: ${resolvedPortals.join(", ")}
- Job Type: ${jobType}
- Experience Level: ${experienceLevel}
- Sort: ${sortBy}${sortBy === "latest" ? " → keep ALL postedDaysAgo values between 0-3" : ""}${sortBy === "salary" ? " → use the higher end of each salary bracket" : ""}
- Page: ${page} | Page Size: ${pageSize}

User Profile (personalisation):
- Title: ${userTitle || "Not provided"}
- Skills: ${hasSkills ? userSkills.join(", ") : "None provided — set matchScore to null for every job"}
- Location: ${userLocation || "Not provided"}

Generate exactly ${pageSize} diverse, realistic listings distributed across: ${resolvedPortals.join(", ")}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt },
        ],
        temperature: 0.75,
      }),
    });

    if (!response.ok) {
      if (response.status === 429)
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      if (response.status === 402)
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content  = aiResult.choices?.[0]?.message?.content || "";

    // Extract JSON — handle possible markdown fences
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned no valid JSON");

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!Array.isArray(parsed.jobs)) parsed.jobs = [];

    // ── Post-process each job ─────────────────────────────────────────────────
    (parsed.jobs as Record<string, unknown>[]) = (parsed.jobs as Record<string, unknown>[]).map(
      (job: Record<string, unknown>, idx: number) => {
        const currency = String(job.salaryCurrency || "INR");

        // Normalise salary: AI sometimes returns full rupees instead of LPA
        let salaryMin = normaliseSalaryMin(Number(job.salaryMin) || 0, currency);
        let salaryMax = normaliseSalaryMin(Number(job.salaryMax) || 0, currency);
        if (salaryMax < salaryMin) salaryMax = Math.round(salaryMin * 1.4);

        // Build salaryDisplay if AI didn't provide one
        let salaryDisplay = String(job.salaryDisplay || "");
        if (!salaryDisplay && salaryMin > 0) {
          salaryDisplay = currency === "USD"
            ? `$${salaryMin}k – $${salaryMax}k`
            : `₹${salaryMin}L – ₹${salaryMax}L`;
        }

        // Normalise postedDisplay
        const days = Math.max(0, Number(job.postedDaysAgo ?? 0));
        let postedDisplay = String(job.postedDisplay || "");
        if (!postedDisplay || postedDisplay === "string") {
          if      (days === 0)  postedDisplay = "Today";
          else if (days === 1)  postedDisplay = "Yesterday";
          else if (days < 14)   postedDisplay = `${days} days ago`;
          else if (days < 21)   postedDisplay = "2 weeks ago";
          else if (days < 28)   postedDisplay = "3 weeks ago";
          else                  postedDisplay = "1 month ago";
        }

        // Normalise matchScore — must be integer 0-100 or null
        const rawMatch = job.matchScore;
        const matchScore = hasSkills && rawMatch !== null && rawMatch !== undefined
          ? Math.min(100, Math.max(0, Math.round(Number(rawMatch) || 0)))
          : null;

        return {
          ...job,
          id:            `${String(job.portal || "unknown")}-p${page}-${idx + 1}`,
          salaryMin,
          salaryMax,
          salaryCurrency: currency,
          salaryDisplay,
          postedDaysAgo:  days,
          postedDisplay,
          isHot:          days <= 1,
          matchScore,
          skills:         Array.isArray(job.skills) ? job.skills.slice(0, 6) : [],
        };
      }
    );

    // ── Ensure top-level fields ───────────────────────────────────────────────
    parsed.page      = page;
    parsed.pageSize  = pageSize;
    parsed.query     = effectiveQuery;
    if (!parsed.totalCount || Number(parsed.totalCount) <= 0)
      parsed.totalCount = Math.max((parsed.jobs as unknown[]).length * 10, 80);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("job-search error:", message);
    return new Response(
      JSON.stringify({ error: message, jobs: [], totalCount: 0, page: 1, pageSize: 10, query: "" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
