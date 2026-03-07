import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { AdminKpiCard } from "./components/AdminKpiCard";
import { AdminDateRangePicker } from "./components/AdminDateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, defs, linearGradient,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Eye, Users, Activity, UserCheck } from "lucide-react";
import type { TrafficData } from "@/types/admin";

const DEVICE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(45, 85%, 55%)",
];

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

async function fetchTraffic(from: string, to: string): Promise<TrafficData> {
  const { data, error } = await supabase.functions.invoke("admin-dashboard", {
    body: { section: "traffic", from, to },
  });
  if (error) throw error;
  return data;
}

export default function TrafficAnalytics() {
  const { from: defFrom, to: defTo } = defaultDateRange();
  const [from, setFrom] = useState(defFrom);
  const [to, setTo] = useState(defTo);

  const { data, isLoading, error } = useQuery<TrafficData>({
    queryKey: ["admin", "traffic", from, to],
    queryFn: () => fetchTraffic(from, to),
  });

  const handleApply = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
  };

  const deviceData = data
    ? [
        { name: "Desktop", value: data.device_breakdown.desktop },
        { name: "Mobile", value: data.device_breakdown.mobile },
        { name: "Tablet", value: data.device_breakdown.tablet },
      ]
    : [];

  return (
    <AdminLayout title="Traffic Analytics">
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
          title="Total Page Views"
          value={data?.total_views?.toLocaleString() ?? "—"}
          subtitle="In selected period"
          icon={Eye}
          iconColor="text-primary"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Unique Sessions"
          value={data?.unique_sessions?.toLocaleString() ?? "—"}
          subtitle="Distinct session IDs"
          icon={Users}
          iconColor="text-accent"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Avg Daily Views"
          value={data?.avg_daily_views?.toFixed(0) ?? "—"}
          subtitle="Views per day"
          icon={Activity}
          iconColor="text-blue-500"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Auth Rate"
          value={data ? `${data.auth_rate.toFixed(1)}%` : "—"}
          subtitle="Logged-in visitors"
          icon={UserCheck}
          iconColor="text-green-600"
          loading={isLoading}
        />
      </div>

      {/* Area Chart — Views by Day */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Page Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={data?.views_by_day ?? []}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#trafficGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={(data?.top_pages ?? []).slice(0, 10)}
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="path"
                    width={130}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v: string) => (v.length > 18 ? v.slice(0, 18) + "…" : v)}
                  />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {isLoading ? (
              <Skeleton className="h-48 w-48 rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {deviceData.map((_, i) => (
                      <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
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
    </AdminLayout>
  );
}
