import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-origin, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STRIPE_PRO_PRODUCT     = "prod_U5b8XJ8Ob5ja1K";
const STRIPE_PREMIUM_PRODUCT = "prod_U5b8GG2z9v2uUP";

function errResp(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonResp(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function groupByDay(items: { created_at?: string; viewed_at?: string }[], dateKey: "created_at" | "viewed_at") {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const d = (item[dateKey] ?? "").slice(0, 10);
    if (d) counts[d] = (counts[d] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function groupByMonth(items: { created_at?: string }[]) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const m = (item.created_at ?? "").slice(0, 7); // "YYYY-MM"
    if (m) counts[m] = (counts[m] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

// Fetch ALL pages of Stripe subscriptions
async function getAllStripeSubscriptions(stripe: Stripe, status: "active" | "canceled", createdGte?: number) {
  const all: Stripe.Subscription[] = [];
  const params: Stripe.SubscriptionListParams = { status, limit: 100, expand: ["data.items.data.price"] };
  if (createdGte) params.created = { gte: createdGte };
  let page = await stripe.subscriptions.list(params);
  all.push(...page.data);
  while (page.has_more) {
    page = await stripe.subscriptions.list({ ...params, starting_after: page.data[page.data.length - 1].id });
    all.push(...page.data);
  }
  return all;
}

// Build a Map<email, {plan, subscription_end}> from Stripe
async function buildStripePlanMap(stripe: Stripe): Promise<Map<string, { plan: string; subscription_end: string | null }>> {
  const map = new Map<string, { plan: string; subscription_end: string | null }>();
  const subs = await getAllStripeSubscriptions(stripe, "active");
  for (const sub of subs) {
    const customer = sub.customer as string;
    let email = "";
    try {
      const cust = await stripe.customers.retrieve(customer) as Stripe.Customer;
      email = cust.email ?? "";
    } catch { continue; }
    if (!email) continue;
    const priceProductId = (sub.items.data[0]?.price?.product as string) ?? "";
    let plan = "free";
    if (priceProductId === STRIPE_PREMIUM_PRODUCT) plan = "premium";
    else if (priceProductId === STRIPE_PRO_PRODUCT) plan = "pro";
    map.set(email, {
      plan,
      subscription_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
    });
  }
  return map;
}

// ── Section handlers ──────────────────────────────────────────────────────────

async function handleOverview(
  admin: ReturnType<typeof createClient>,
  stripe: Stripe,
  fromDate: Date,
  toDate: Date
) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [
    { count: totalUsers },
    { count: newUsers30d },
    { count: newUsers7d },
    { count: totalResumes },
    { count: totalApplications },
    { count: pageViews30d },
    { data: recentResumeUsers },
    { data: recentAppUsers },
    { data: profilesLast7d },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    admin.from("resumes").select("*", { count: "exact", head: true }),
    admin.from("applications").select("*", { count: "exact", head: true }),
    admin.from("page_views").select("*", { count: "exact", head: true }).gte("viewed_at", thirtyDaysAgo),
    admin.from("resumes").select("user_id").gte("updated_at", sevenDaysAgo),
    admin.from("applications").select("user_id").gte("updated_at", sevenDaysAgo),
    admin.from("profiles").select("created_at").gte("created_at", sevenDaysAgo),
  ]);

  // Active users = union of unique user IDs active in resumes OR applications in last 7d
  const activeUserIds = new Set([
    ...(recentResumeUsers ?? []).map((r: { user_id: string }) => r.user_id),
    ...(recentAppUsers ?? []).map((r: { user_id: string }) => r.user_id),
  ]);
  const activeUsers7d = activeUserIds.size;

  // Signup trend last 7d grouped by day
  const signupTrend7d = groupByDay(profilesLast7d ?? [], "created_at");
  // Fill missing days with 0
  const trend7dMap: Record<string, number> = {};
  for (const { date, count } of signupTrend7d) trend7dMap[date] = count;
  const filled7d = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000).toISOString().slice(0, 10);
    return { date: d, signups: trend7dMap[d] ?? 0 };
  });

  // Stripe: MRR + plan counts
  let mrrUsd = 0, proCount = 0, premiumCount = 0;
  let mrrGrowthPct: number | null = null;
  try {
    const activeSubs = await getAllStripeSubscriptions(stripe, "active");
    for (const sub of activeSubs) {
      const item = sub.items.data[0];
      const amount = item?.price?.unit_amount ?? 0;
      const interval = item?.price?.recurring?.interval;
      const monthly = interval === "year" ? amount / 12 : amount;
      mrrUsd += monthly;
      const productId = (item?.price?.product as string) ?? "";
      if (productId === STRIPE_PREMIUM_PRODUCT) premiumCount++;
      else if (productId === STRIPE_PRO_PRODUCT) proCount++;
    }
    mrrUsd = Math.round(mrrUsd) / 100;
  } catch { /* Stripe may not be configured */ }

  // Recent signups (last 10 from auth)
  const { data: { users: recentAuthUsers } } = await admin.auth.admin.listUsers({ page: 1, perPage: 10 });
  const recentUserIds = recentAuthUsers.map(u => u.id);
  const { data: recentProfiles } = await admin.from("profiles").select("id,name").in("id", recentUserIds);
  const profileNameMap = new Map((recentProfiles ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));

  const planMap = await buildStripePlanMap(stripe);
  const recentSignups = recentAuthUsers.map(u => ({
    id: u.id,
    name: profileNameMap.get(u.id) || u.user_metadata?.name || "Unknown",
    email: u.email ?? "",
    created_at: u.created_at,
    plan: planMap.get(u.email ?? "")?.plan ?? "free",
  }));

  const freeUsers = (totalUsers ?? 0) - proCount - premiumCount;

  return {
    kpis: {
      total_users: totalUsers ?? 0,
      new_users_30d: newUsers30d ?? 0,
      new_users_7d: newUsers7d ?? 0,
      total_resumes: totalResumes ?? 0,
      total_applications: totalApplications ?? 0,
      total_page_views_30d: pageViews30d ?? 0,
      active_users_7d: activeUsers7d,
      mrr_usd: mrrUsd,
      mrr_growth_pct: mrrGrowthPct,
      pro_subscribers: proCount,
      premium_subscribers: premiumCount,
      free_users: freeUsers > 0 ? freeUsers : 0,
      churn_rate_30d: null,
    },
    recent_signups: recentSignups,
    signup_trend_7d: filled7d,
  };
}

async function handleUsers(
  admin: ReturnType<typeof createClient>,
  stripe: Stripe,
  page: number,
  perPage: number,
  search: string | undefined,
  planFilter: string | undefined
) {
  const { data: { users }, count } = await admin.auth.admin.listUsers({ page, perPage });

  const userIds = users.map(u => u.id);
  const emails  = users.map(u => u.email ?? "");

  const [
    { data: profiles },
    { data: resumes },
    { data: applications },
    { data: visits },
  ] = await Promise.all([
    admin.from("profiles").select("id,name,username,is_admin,is_public").in("id", userIds),
    admin.from("resumes").select("user_id").in("user_id", userIds),
    admin.from("applications").select("user_id").in("user_id", userIds),
    admin.from("profile_visits").select("profile_user_id").in("profile_user_id", userIds),
  ]);

  // Group counts
  const resumeCounts  = new Map<string, number>();
  const appCounts     = new Map<string, number>();
  const visitCounts   = new Map<string, number>();
  for (const r of (resumes ?? []))      resumeCounts.set((r as { user_id: string }).user_id,  (resumeCounts.get((r as { user_id: string }).user_id)  ?? 0) + 1);
  for (const r of (applications ?? [])) appCounts.set(   (r as { user_id: string }).user_id,  (appCounts.get(   (r as { user_id: string }).user_id)  ?? 0) + 1);
  for (const r of (visits ?? []))       visitCounts.set( (r as { profile_user_id: string }).profile_user_id, (visitCounts.get((r as { profile_user_id: string }).profile_user_id) ?? 0) + 1);

  const profileMap = new Map((profiles ?? []).map((p: { id: string; name: string; username: string; is_admin: boolean; is_public: boolean }) => [p.id, p]));
  const planMap    = await buildStripePlanMap(stripe);

  let result = users.map(u => {
    const p = profileMap.get(u.id) as { name?: string; username?: string; is_admin?: boolean; is_public?: boolean } | undefined;
    const stripePlan = planMap.get(u.email ?? "");
    return {
      id:                   u.id,
      email:                u.email ?? "",
      name:                 p?.name || u.user_metadata?.name || "Unknown",
      username:             p?.username ?? null,
      created_at:           u.created_at,
      last_sign_in_at:      u.last_sign_in_at ?? null,
      plan:                 stripePlan?.plan ?? "free",
      subscription_end:     stripePlan?.subscription_end ?? null,
      resume_count:         resumeCounts.get(u.id) ?? 0,
      application_count:    appCounts.get(u.id) ?? 0,
      profile_visit_count:  visitCounts.get(u.id) ?? 0,
      is_admin:             p?.is_admin ?? false,
      is_public:            p?.is_public ?? false,
    };
  });

  // Filter by search
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  // Filter by plan
  if (planFilter && planFilter !== "all") {
    result = result.filter(u => u.plan === planFilter);
  }

  return { users: result, total: count ?? result.length, page, per_page: perPage };
}

async function handleFinancial(
  admin: ReturnType<typeof createClient>,
  stripe: Stripe,
  fromDate: Date,
  _toDate: Date
) {
  const { count: totalUsers } = await admin.from("profiles").select("*", { count: "exact", head: true });

  let mrrUsd = 0, arrUsd = 0, proCount = 0, premiumCount = 0;
  let revenue30d = 0, canceledLast30d = 0;
  const revenueByMonth: Record<string, { revenue: number; new_subs: number }> = {};
  const planDistribution: Array<{ plan: string; count: number; revenue: number }> = [];

  try {
    // Active subscriptions for MRR
    const activeSubs = await getAllStripeSubscriptions(stripe, "active");
    for (const sub of activeSubs) {
      const item = sub.items.data[0];
      const amount = item?.price?.unit_amount ?? 0;
      const interval = item?.price?.recurring?.interval;
      const monthly = interval === "year" ? amount / 12 : amount;
      mrrUsd += monthly;
      const productId = (item?.price?.product as string) ?? "";
      if (productId === STRIPE_PREMIUM_PRODUCT) premiumCount++;
      else if (productId === STRIPE_PRO_PRODUCT) proCount++;

      // Track new sub by month
      const subMonth = new Date(sub.created * 1000).toISOString().slice(0, 7);
      if (!revenueByMonth[subMonth]) revenueByMonth[subMonth] = { revenue: 0, new_subs: 0 };
      revenueByMonth[subMonth].new_subs++;
    }
    mrrUsd = Math.round(mrrUsd) / 100;
    arrUsd = Math.round(mrrUsd * 12 * 100) / 100;

    // Revenue from charges in date range
    const fromTimestamp = Math.floor(fromDate.getTime() / 1000);
    let chargesPage = await stripe.charges.list({ created: { gte: fromTimestamp }, limit: 100 });
    const allCharges = [...chargesPage.data];
    while (chargesPage.has_more) {
      chargesPage = await stripe.charges.list({ created: { gte: fromTimestamp }, limit: 100, starting_after: chargesPage.data[chargesPage.data.length - 1].id });
      allCharges.push(...chargesPage.data);
    }
    for (const c of allCharges) {
      if (c.status === "succeeded") {
        revenue30d += c.amount;
        const month = new Date(c.created * 1000).toISOString().slice(0, 7);
        if (!revenueByMonth[month]) revenueByMonth[month] = { revenue: 0, new_subs: 0 };
        revenueByMonth[month].revenue += c.amount / 100;
      }
    }
    revenue30d = Math.round(revenue30d) / 100;

    // Canceled subs
    const oneYearAgo = Math.floor((Date.now() - 365 * 86_400_000) / 1000);
    const canceledSubs = await getAllStripeSubscriptions(stripe, "canceled", oneYearAgo);
    canceledLast30d = canceledSubs.filter(s =>
      s.canceled_at && s.canceled_at >= fromTimestamp
    ).length;
  } catch { /* Stripe not configured */ }

  const freeCount = Math.max(0, (totalUsers ?? 0) - proCount - premiumCount);
  const churnRate = (proCount + premiumCount) > 0
    ? Math.round((canceledLast30d / (proCount + premiumCount)) * 1000) / 10
    : 0;

  planDistribution.push(
    { plan: "free",    count: freeCount,     revenue: 0 },
    { plan: "pro",     count: proCount,      revenue: proCount * 14.99 },
    { plan: "premium", count: premiumCount,  revenue: premiumCount * 29.99 },
  );

  // Last 12 months revenue_by_month
  const months12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return d.toISOString().slice(0, 7);
  });
  const revenueByMonthArr = months12.map(m => ({
    month: m,
    revenue: Math.round((revenueByMonth[m]?.revenue ?? 0) * 100) / 100,
    new_subs: revenueByMonth[m]?.new_subs ?? 0,
  }));

  return {
    mrr_usd: mrrUsd,
    arr_usd: arrUsd,
    total_revenue_30d: revenue30d,
    total_revenue_all_time: revenueByMonthArr.reduce((s, r) => s + r.revenue, 0),
    pro_count: proCount,
    premium_count: premiumCount,
    free_count: freeCount,
    canceled_last_30d: canceledLast30d,
    churn_rate: churnRate,
    revenue_by_month: revenueByMonthArr,
    plan_distribution: planDistribution,
    avg_revenue_per_user: (totalUsers ?? 0) > 0
      ? Math.round((mrrUsd / (totalUsers ?? 1)) * 100) / 100
      : 0,
  };
}

async function handleTraffic(
  admin: ReturnType<typeof createClient>,
  fromDate: Date,
  toDate: Date
) {
  const { data: views } = await admin
    .from("page_views")
    .select("path, session_id, user_id, device_type, viewed_at")
    .gte("viewed_at", fromDate.toISOString())
    .lte("viewed_at", toDate.toISOString());

  const rows = (views ?? []) as Array<{ path: string; session_id: string; user_id: string | null; device_type: string; viewed_at: string }>;

  const totalViews = rows.length;
  const uniqueSessions = new Set(rows.map(r => r.session_id)).size;
  const dayCount = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / 86_400_000));
  const avgDailyViews = Math.round(totalViews / dayCount);

  // Top pages
  const pageCounts: Record<string, number> = {};
  for (const r of rows) pageCounts[r.path] = (pageCounts[r.path] ?? 0) + 1;
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, views]) => ({ path, views, pct: totalViews > 0 ? Math.round(views / totalViews * 1000) / 10 : 0 }));

  // Views by day
  const dayMap: Record<string, { views: number; sessions: Set<string> }> = {};
  for (const r of rows) {
    const d = r.viewed_at.slice(0, 10);
    if (!dayMap[d]) dayMap[d] = { views: 0, sessions: new Set() };
    dayMap[d].views++;
    dayMap[d].sessions.add(r.session_id);
  }
  const viewsByDay = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, views: v.views, sessions: v.sessions.size }));

  // Device breakdown
  const deviceMap: Record<string, number> = {};
  for (const r of rows) deviceMap[r.device_type] = (deviceMap[r.device_type] ?? 0) + 1;
  const deviceBreakdown = Object.entries(deviceMap).map(([device_type, count]) => ({ device_type, count }));

  // Auth vs anon
  const authenticated = rows.filter(r => r.user_id !== null).length;
  const anonymous = totalViews - authenticated;

  // New vs returning (first occurrence of session_id = new)
  const seenSessions = new Set<string>();
  let newSessions = 0, returningSessions = 0;
  for (const r of rows.sort((a, b) => a.viewed_at.localeCompare(b.viewed_at))) {
    if (!seenSessions.has(r.session_id)) { seenSessions.add(r.session_id); newSessions++; }
    else returningSessions++;
  }

  return {
    total_views_period: totalViews,
    unique_sessions_period: uniqueSessions,
    avg_daily_views: avgDailyViews,
    top_pages: topPages,
    views_by_day: viewsByDay,
    device_breakdown: deviceBreakdown,
    new_vs_returning: { new_sessions: newSessions, returning_sessions: returningSessions },
    authenticated_vs_anon: { authenticated, anonymous },
  };
}

async function handleLeads(
  admin: ReturnType<typeof createClient>,
  stripe: Stripe,
  fromDate: Date,
  _toDate: Date
) {
  const [
    { data: newProfiles },
    { data: allResumeUsers },
    { data: allAppUsers },
  ] = await Promise.all([
    admin.from("profiles").select("id, created_at").gte("created_at", fromDate.toISOString()),
    admin.from("resumes").select("user_id"),
    admin.from("applications").select("user_id"),
  ]);

  const totalSignups = (newProfiles ?? []).length;
  const signupsByDay = groupByDay((newProfiles ?? []).map(p => ({ created_at: (p as { created_at: string }).created_at })), "created_at");

  const resumeUserSet = new Set((allResumeUsers ?? []).map((r: { user_id: string }) => r.user_id));
  const appUserSet    = new Set((allAppUsers ?? []).map((r: { user_id: string }) => r.user_id));

  // Get upgraded users from Stripe
  let upgradedEmails: Set<string> = new Set();
  try {
    const planMap = await buildStripePlanMap(stripe);
    for (const [email, info] of planMap) {
      if (info.plan !== "free") upgradedEmails.add(email);
    }
  } catch { /* ignore */ }

  // Get auth users for recent leads
  const { data: { users: recentAuthUsers } } = await admin.auth.admin.listUsers({ page: 1, perPage: 20 });
  const recentIds = recentAuthUsers.map(u => u.id);
  const { data: recentProfs } = await admin.from("profiles").select("id, name").in("id", recentIds);
  const nameMap = new Map((recentProfs ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));

  const recentLeads = recentAuthUsers.map(u => ({
    id:           u.id,
    name:         nameMap.get(u.id) || u.user_metadata?.name || "Unknown",
    email:        u.email ?? "",
    created_at:   u.created_at,
    resume_count: resumeUserSet.has(u.id) ? 1 : 0,
    has_upgraded: upgradedEmails.has(u.email ?? ""),
  }));

  const upgradedCount = recentAuthUsers.filter(u => upgradedEmails.has(u.email ?? "")).length;
  const conversionRate = totalSignups > 0
    ? Math.round((upgradedCount / totalSignups) * 1000) / 10
    : 0;

  return {
    total_signups_period: totalSignups,
    signups_by_day: signupsByDay,
    conversion_funnel: {
      signed_up:           totalSignups,
      created_resume:      resumeUserSet.size,
      added_application:   appUserSet.size,
      upgraded_to_paid:    upgradedCount,
    },
    signup_to_paid_rate: conversionRate,
    avg_time_to_upgrade_days: null,
    recent_leads: recentLeads,
  };
}

async function handleFeatureUsage(
  admin: ReturnType<typeof createClient>,
  fromDate: Date,
  _toDate: Date
) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [
    { data: allResumes },
    { data: allApplications },
    { count: versionCount },
    { count: variantCount },
    { count: publicProfileCount },
    { count: profileVisits30d },
    { count: totalUsers },
  ] = await Promise.all([
    admin.from("resumes").select("template, created_at"),
    admin.from("applications").select("status"),
    admin.from("resume_versions").select("*", { count: "exact", head: true }),
    admin.from("resume_variants").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("is_public", true),
    admin.from("profile_visits").select("*", { count: "exact", head: true }).gte("visited_at", thirtyDaysAgo),
    admin.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  // Template popularity
  const templateMap: Record<string, number> = {};
  for (const r of (allResumes ?? [])) {
    const t = (r as { template: string }).template ?? "unknown";
    templateMap[t] = (templateMap[t] ?? 0) + 1;
  }
  const templatePopularity = Object.entries(templateMap)
    .sort(([, a], [, b]) => b - a)
    .map(([template, count]) => ({ template, count }));

  // Resumes by month
  const resumesByMonth = groupByMonth((allResumes ?? []).map(r => ({ created_at: (r as { created_at: string }).created_at })));

  // Applications by status
  const statusMap: Record<string, number> = {};
  for (const r of (allApplications ?? [])) {
    const s = (r as { status: string }).status ?? "unknown";
    statusMap[s] = (statusMap[s] ?? 0) + 1;
  }
  const applicationsByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  const safeTotal = Math.max(totalUsers ?? 1, 1);

  return {
    template_popularity:     templatePopularity,
    resumes_by_month:        resumesByMonth,
    applications_by_status:  applicationsByStatus,
    total_resume_versions:   versionCount ?? 0,
    total_resume_variants:   variantCount ?? 0,
    avg_resumes_per_user:    Math.round(((allResumes ?? []).length / safeTotal) * 100) / 100,
    avg_applications_per_user: Math.round(((allApplications ?? []).length / safeTotal) * 100) / 100,
    public_profiles_count:   publicProfileCount ?? 0,
    profile_visits_30d:      profileVisits30d ?? 0,
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 1. Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errResp("Unauthorized", 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) return errResp("Unauthorized", 401);

    // 2. Check is_admin
    const { data: profileData } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();
    if (!profileData?.is_admin) return errResp("Forbidden: admin access required", 403);

    const body = await req.json();
    const {
      section = "overview",
      page = 1,
      per_page = 50,
      search,
      plan_filter,
      from,
      to,
    } = body;

    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 86_400_000);
    const toDate   = to   ? new Date(to)   : new Date();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      // @ts-ignore
      apiVersion: "2025-08-27.basil",
    });

    switch (section) {
      case "overview":
        return jsonResp(await handleOverview(supabaseAdmin, stripe, fromDate, toDate));
      case "users":
        return jsonResp(await handleUsers(supabaseAdmin, stripe, page, per_page, search, plan_filter));
      case "financial":
        return jsonResp(await handleFinancial(supabaseAdmin, stripe, fromDate, toDate));
      case "traffic":
        return jsonResp(await handleTraffic(supabaseAdmin, fromDate, toDate));
      case "leads":
        return jsonResp(await handleLeads(supabaseAdmin, stripe, fromDate, toDate));
      case "feature_usage":
        return jsonResp(await handleFeatureUsage(supabaseAdmin, fromDate, toDate));
      default:
        return errResp(`Unknown section: ${section}`, 400);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("admin-dashboard error:", message);
    return errResp(message, 500);
  }
});
