import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { AdminKpiCard } from "./components/AdminKpiCard";
import { PlanBadge } from "./components/PlanBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Users, DollarSign, Activity, Eye, Award, Zap, UserCheck,
} from "lucide-react";
import type { AdminOverviewKpis } from "@/types/admin";
import { formatDistanceToNow, parseISO } from "date-fns";

async function fetchOverview(): Promise<AdminOverviewKpis> {
  const { data, error } = await supabase.functions.invoke("admin-dashboard", {
    body: { section: "overview" },
  });
  if (error) throw error;
  return data;
}

function fmtMrr(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery<AdminOverviewKpis>({
    queryKey: ["admin", "overview"],
    queryFn: fetchOverview,
    refetchInterval: 60_000,
  });

  return (
    <AdminLayout title="Overview">
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Failed to load admin data: {(error as Error).message}
        </div>
      )}

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminKpiCard
          title="Total Users"
          value={data?.total_users?.toLocaleString() ?? "—"}
          subtitle={`+${data?.new_users_30d ?? 0} this month`}
          icon={Users}
          iconColor="text-primary"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Monthly Revenue (MRR)"
          value={data ? fmtMrr(data.mrr_usd) : "—"}
          subtitle={`ARR: ${data ? fmtMrr(data.mrr_usd * 12) : "—"}`}
          icon={DollarSign}
          iconColor="text-green-600"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Active Users (7d)"
          value={data?.active_users_7d?.toLocaleString() ?? "—"}
          subtitle={`${data?.new_users_7d ?? 0} new this week`}
          icon={Activity}
          iconColor="text-accent"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Page Views (30d)"
          value={data?.total_page_views_30d?.toLocaleString() ?? "—"}
          subtitle="All pages tracked"
          icon={Eye}
          iconColor="text-blue-500"
          loading={isLoading}
        />
      </div>

      {/* KPI Row 2 — Plan breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <AdminKpiCard
          title="Pro Subscribers"
          value={data?.pro_count?.toLocaleString() ?? "—"}
          subtitle={`${data ? fmtMrr(data.pro_count * 14.99) : "—"} MRR`}
          icon={Zap}
          iconColor="text-primary"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Premium Subscribers"
          value={data?.premium_count?.toLocaleString() ?? "—"}
          subtitle={`${data ? fmtMrr(data.premium_count * 29.99) : "—"} MRR`}
          icon={Award}
          iconColor="text-accent"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Free Users"
          value={data?.free_count?.toLocaleString() ?? "—"}
          subtitle="No subscription"
          icon={UserCheck}
          iconColor="text-muted-foreground"
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Signup Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signups – Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.signup_trend_7d ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                  />
                  <Line type="monotone" dataKey="signups" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Resource Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Totals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: "Users", value: data?.total_users ?? 0 },
                    { name: "Resumes", value: data?.total_resumes ?? 0 },
                    { name: "Applications", value: data?.total_applications ?? 0 },
                    { name: "Pro", value: data?.pro_count ?? 0 },
                    { name: "Premium", value: data?.premium_count ?? 0 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Signups</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_signups ?? []).map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{u.name || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <PlanBadge plan={u.plan} />
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatDistanceToNow(parseISO(u.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
                {(data?.recent_signups ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      No signups yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
