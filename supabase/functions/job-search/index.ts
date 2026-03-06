import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-origin",
};

const PORTAL_URL_PATTERNS: Record<string, string> = {
  linkedin:   "https://www.linkedin.com/jobs/search/?keywords={TITLE}+{COMPANY}&location={LOCATION}",
  indeed:     "https://in.indeed.com/jobs?q={TITLE}+{COMPANY}&l={LOCATION}",
  naukri:     "https://www.naukri.com/jobs-in-india?k={TITLE}+{COMPANY}",
  glassdoor:  "https://www.glassdoor.co.in/Job/jobs.htm?typedKeyword={TITLE}+{COMPANY}",
  ambitionbox:"https://www.ambitionbox.com/jobs?designations={TITLE}&companies={COMPANY}",
  iamjobs:    "https://iamjobs.co.in/?s={TITLE}",
  iitjobs:    "https://iitjobs.com/?s={TITLE}",
  darwinbox:  "https://jobs.darwinbox.in/careers?q={TITLE}",
  bullhorn:   "https://app.bullhorn.com/careers/?q={TITLE}",
};

const ALL_PORTALS = Object.keys(PORTAL_URL_PATTERNS);

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
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Resolve portal list
    const resolvedPortals: string[] =
      portals.includes("all") || portals.length === 0 ? ALL_PORTALS : portals;

    // Build portal URL patterns section for the prompt
    const portalUrlSection = resolvedPortals
      .map((p) => `- ${p}: ${PORTAL_URL_PATTERNS[p] ?? ""}`)
      .join("\n");

    const effectiveQuery = query.trim() || userTitle || "software engineer";
    const effectiveLocation = location.trim() || userLocation || "India";
    const hasSkills = Array.isArray(userSkills) && userSkills.length > 0;

    const systemPrompt = `You are a job listing database simulator. Generate realistic, diverse, and contextually accurate job listings as they would appear aggregated from multiple Indian and international job portals.

CRITICAL RULES:
1. Return ONLY a valid JSON object — no markdown, no explanation, no backtick code fences.
2. Use real, recognizable company names appropriate for each portal and location. Indian examples: TCS, Infosys, Wipro, HCL, Cognizant, Razorpay, Zepto, Swiggy, Zomato, Flipkart, PhonePe, Paytm, HDFC Bank, ICICI Bank, Bajaj Finance, Deloitte, PwC, KPMG, Accenture, IBM, Oracle, SAP, Capgemini. US/Global examples: Google, Microsoft, Meta, Amazon, Apple, Stripe, Netflix, Shopify, Atlassian, Salesforce, Adobe, Twilio.
3. Distribute listings evenly across the portals provided. Each job belongs to exactly ONE portal.
4. Salary in INR lakh per annum for India-based roles: entry-level 4-8 LPA, mid-level 10-25 LPA, senior 25-60 LPA, principal/staff 60-100+ LPA. Salary in USD thousands for US/Remote international roles: junior $70-100k, mid $100-140k, senior $140-200k. Always set salaryCurrency accordingly.
5. Compute matchScore (0-100) by calculating skill overlap percentage between the listing's skills array and the userSkills array — only if userSkills is non-empty. If userSkills is empty, set matchScore to null.
6. postedDaysAgo: weight toward recent (0-7 days most common, max 30). postedDisplay: "Today" if 0, "Yesterday" if 1, else "{N} days ago" if <= 13, "1 week ago" if 7-13, "2 weeks ago" if 14-20, "3 weeks ago" if 21-27, "1 month ago" if >= 28.
7. isHot: true only if postedDaysAgo <= 1.
8. ID format must be: "{portal}-p{page}-{index}" where index is 1-based.
9. Build applyUrl by substituting URL-encoded job title and company name into the portal pattern. Replace {TITLE}, {COMPANY}, {LOCATION} with URL-encoded values.
10. skills array: 4-6 tags directly relevant to the job title. Do not pad with unrelated skills.
11. description: 2-3 sentence summary describing the role, team context, and tech/domain.
12. The JSON must contain exactly {pageSize} jobs in the "jobs" array.

Portal URL patterns for applyUrl:
${portalUrlSection}

Return this exact JSON structure with no additional text:
{
  "jobs": [ { ...GeneratedJob } ],
  "totalCount": <integer, estimated total results for this search>,
  "page": <page number>,
  "pageSize": <pageSize>,
  "query": "<effective search query>"
}`;

    const userPrompt = `Search Criteria:
- Query: ${effectiveQuery}
- Location: ${effectiveLocation}
- Portals to include: ${resolvedPortals.join(", ")}
- Job Type filter: ${jobType}
- Experience Level filter: ${experienceLevel}
- Sort preference: ${sortBy} (if "latest": bias postedDaysAgo toward 0-3; if "salary": use higher salary ranges)
- Page: ${page}, Page Size: ${pageSize}

User Profile (for personalisation):
- Current Title: ${userTitle || "Not provided"}
- Skills: ${hasSkills ? userSkills.join(", ") : "None — set matchScore to null for all jobs"}
- Location: ${userLocation || "Not provided"}

Generate exactly ${pageSize} diverse, realistic job listings matching the criteria above.
Distribute them across: ${resolvedPortals.join(", ")}.
${sortBy === "salary" ? "Make salary ranges higher and more varied since user sorted by salary." : ""}
${sortBy === "latest" ? "Keep all postedDaysAgo values between 0-3." : ""}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Extract JSON from the AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI returned no valid JSON");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate and post-process jobs array
    if (!Array.isArray(parsed.jobs)) {
      parsed.jobs = [];
    }

    // Post-process each job for safety
    parsed.jobs = parsed.jobs.map((job: Record<string, unknown>, idx: number) => {
      // Ensure salary display is consistent
      const salaryMin = Number(job.salaryMin) || 0;
      const salaryMax = Number(job.salaryMax) || 0;
      const currency = String(job.salaryCurrency || "INR");
      let salaryDisplay = String(job.salaryDisplay || "");
      if (!salaryDisplay && salaryMin > 0) {
        salaryDisplay =
          currency === "USD"
            ? `$${salaryMin}k – $${salaryMax}k`
            : `₹${salaryMin}L – ₹${salaryMax}L`;
      }

      // Ensure postedDisplay matches postedDaysAgo
      const days = Number(job.postedDaysAgo ?? 0);
      let postedDisplay = String(job.postedDisplay || "");
      if (!postedDisplay) {
        if (days === 0) postedDisplay = "Today";
        else if (days === 1) postedDisplay = "Yesterday";
        else if (days < 14) postedDisplay = `${days} days ago`;
        else if (days < 21) postedDisplay = "2 weeks ago";
        else if (days < 28) postedDisplay = "3 weeks ago";
        else postedDisplay = "1 month ago";
      }

      return {
        ...job,
        id: `${String(job.portal || "unknown")}-p${page}-${idx + 1}`,
        salaryDisplay,
        postedDisplay,
        isHot: days <= 1,
        matchScore: hasSkills ? (Number(job.matchScore) ?? null) : null,
        skills: Array.isArray(job.skills) ? job.skills : [],
      };
    });

    // Ensure required top-level fields
    parsed.page = page;
    parsed.pageSize = pageSize;
    parsed.query = effectiveQuery;
    if (!parsed.totalCount) parsed.totalCount = Math.max(parsed.jobs.length * 8, 50);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("job-search error:", message);
    return new Response(
      JSON.stringify({
        error: message,
        jobs: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        query: "",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
