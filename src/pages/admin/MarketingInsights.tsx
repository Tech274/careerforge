import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { AdminKpiCard } from "./components/AdminKpiCard";
import { AdminDateRangePicker } from "./components/AdminDateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { FileText, Briefcase, Globe, Eye } from "lucide-react";
import type { FeatureUsageData } from "@/types/admin";

const STATUS_COLORS: Record<string, string> = {
  saved:       "hsl(var(--muted-foreground))",
  applied:     "hsl(var(--primary))",
  interviewing:"hsl(45, 85%, 55%)",
  interview:   "hsl(45, 85%, 55%)",
  offer:       "hsl(var(--accent))",
  rejected:    "hsl(var(--destructive))",
};

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

async function fetchFeatureUsage(from: string, to: string): Promise<FeatureUsageData> {
  const { data, error } = await supabase.functions.invoke("admin-dashboard", {
    body: { section: "feature_usage", from, to },
  });
  if (error) throw error;
  return data;
}

export default function MarketingInsights() {
  const { from: defFrom, to: defTo } = defaultDateRange();
  const [from, setFrom] = useState(defFrom);
  const [to, setTo] = useState(defTo);

  const { data, isLoading, error } = useQuery<FeatureUsageData>({
    queryKey: ["admin", "feature_usage", from, to],
    queryFn: () => fetchFeatureUsage(from, to),
  });

  const handleApply = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
  };

  return (
    <AdminLayout title="Marketing Insights">
      <div className="flex justify-end mb-6">
        <AdminDateRangePicker from={from} to={to} onApply={handleApply} />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {(error as Error).message}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminKpiCard
          title="Avg Resumes/User"
          value={data?.avg_resumes_per_user?.toFixed(1) ?? "—"}
          subtitle="Resume engagement"
          icon={FileText}
          iconColor="text-primary"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Avg Apps/User"
          value={data?.avg_apps_per_user?.toFixed(1) ?? "—"}
          subtitle="Application engagement"
          icon={Briefcase}
          iconColor="text-accent"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Public Profiles"
          value={data?.public_profiles?.toLocaleString() ?? "—"}
          subtitle="Profiles set to public"
          icon={Globe}
          iconColor="text-green-600"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Profile Visits (30d)"
          value={data?.profile_visits_30d?.toLocaleString() ?? "—"}
          subtitle="Unique profile views"
          icon={Eye}
          iconColor="text-blue-500"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Template Popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={(data?.template_popularity ?? []).slice(0, 12)}
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="template"
                    width={90}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v: string) => (v.length > 12 ? v.slice(0, 12) + "…" : v)}
                  />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {isLoading ? (
              <Skeleton className="h-48 w-48 rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data?.applications_by_status ?? []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(data?.applications_by_status ?? []).map((entry, i) => (
                      <Cell
                        key={i}
                        fill={STATUS_COLORS[entry.status?.toLowerCase()] ?? `hsl(${i * 60}, 60%, 55%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumes Created by Month */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Resumes Created by Month</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data?.resumes_by_month ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Feature Usage Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminKpiCard
          title="Resume Versions"
          value={data?.total_resume_versions?.toLocaleString() ?? "—"}
          subtitle="Total version history entries"
          icon={FileText}
          iconColor="text-muted-foreground"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Resume Variants"
          value={data?.total_resume_variants?.toLocaleString() ?? "—"}
          subtitle="Tailored variants created"
          icon={FileText}
          iconColor="text-muted-foreground"
          loading={isLoading}
        />
      </div>
    </AdminLayout>
  );
}
