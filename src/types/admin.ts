// Admin Dashboard TypeScript Interfaces

export type AdminDashboardSection =
  | "overview"
  | "users"
  | "financial"
  | "traffic"
  | "leads"
  | "feature_usage";

export interface AdminDashboardRequest {
  section: AdminDashboardSection;
  page?: number;
  per_page?: number;
  search?: string;
  plan_filter?: "free" | "pro" | "premium" | "all";
  from?: string;
  to?: string;
}

// ── Overview ──────────────────────────────────────────────────────────────────

export interface SignupTrendPoint {
  date: string;   // "MMM D"
  signups: number;
}

export interface RecentSignup {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "premium";
  created_at: string;
}

export interface AdminOverviewKpis {
  total_users: number;
  new_users_30d: number;
  new_users_7d: number;
  total_resumes: number;
  total_applications: number;
  active_users_7d: number;
  total_page_views_30d: number;
  mrr_usd: number;
  pro_count: number;
  premium_count: number;
  free_count: number;
  signup_trend_7d: SignupTrendPoint[];
  recent_signups: RecentSignup[];
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  username: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  plan: "free" | "pro" | "premium";
  subscription_end: string | null;
  resume_count: number;
  application_count: number;
  profile_visit_count: number;
  is_admin: boolean;
  is_public: boolean;
}

export interface AdminUsersData {
  users: AdminUser[];
  total: number;
  page: number;
  per_page: number;
}

// ── Financial ─────────────────────────────────────────────────────────────────

export interface RevenueByMonth {
  month: string;     // "MMM YYYY"
  revenue: number;   // USD
  new_subs: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
  revenue: number;
}

export interface FinancialData {
  mrr_usd: number;
  arr_usd: number;
  total_revenue_30d: number;
  pro_count: number;
  premium_count: number;
  free_count: number;
  canceled_last_30d: number;
  churn_rate: number;
  revenue_by_month: RevenueByMonth[];
  plan_distribution: PlanDistribution[];
}

// ── Traffic ───────────────────────────────────────────────────────────────────

export interface TopPage {
  path: string;
  views: number;
}

export interface ViewsByDay {
  date: string;
  views: number;
}

export interface DeviceBreakdown {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface TrafficData {
  total_views: number;
  unique_sessions: number;
  avg_daily_views: number;
  auth_rate: number;          // 0-100 %
  top_pages: TopPage[];
  views_by_day: ViewsByDay[];
  device_breakdown: DeviceBreakdown;
  new_vs_returning: { new: number; returning: number };
  authenticated_vs_anon: { authenticated: number; anon: number };
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export interface SignupsByDay {
  date: string;
  count: number;
}

export interface FunnelStage {
  label: string;
  count: number;
}

export interface RecentLead {
  id: string;
  name: string;
  email: string;
  created_at: string;
  resume_count: number;
  has_upgraded: boolean;
}

export interface LeadsData {
  total_signups: number;
  conversion_rate: number;   // % who upgraded
  leads_7d: number;
  signups_by_day: SignupsByDay[];
  funnel: FunnelStage[];     // 4 stages
  recent_leads: RecentLead[];
}

// ── Feature Usage ─────────────────────────────────────────────────────────────

export interface TemplatePopularity {
  template: string;
  count: number;
}

export interface ResumesByMonth {
  month: string;
  count: number;
}

export interface ApplicationsByStatus {
  status: string;
  count: number;
}

export interface FeatureUsageData {
  template_popularity: TemplatePopularity[];
  resumes_by_month: ResumesByMonth[];
  applications_by_status: ApplicationsByStatus[];
  total_resume_versions: number;
  total_resume_variants: number;
  public_profiles: number;
  profile_visits_30d: number;
  avg_resumes_per_user: number;
  avg_apps_per_user: number;
}
