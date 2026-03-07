import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { AdminKpiCard } from "./components/AdminKpiCard";
import { AdminDateRangePicker } from "./components/AdminDateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import type { FinancialData } from "@/types/admin";

const PIE_COLORS = ["hsl(var(--muted-foreground))", "hsl(var(--primary))", "hsl(var(--accent))"];

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

async function fetchFinancial(from: string, to: string): Promise<FinancialData> {
  const { data, error } = await supabase.functions.invoke("admin-dashboard", {
    body: { section: "financial", from, to },
  });
  if (error) throw error;
  return data;
}

function fmtUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export default function FinancialDashboard() {
  const { from: defFrom, to: defTo } = defaultDateRange();
  const [from, setFrom] = useState(defFrom);
  const [to, setTo] = useState(defTo);

  const { data, isLoading, error } = useQuery<FinancialData>({
    queryKey: ["admin", "financial", from, to],
    queryFn: () => fetchFinancial(from, to),
  });

  const handleApply = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
  };

  return (
    <AdminLayout title="Financial Dashboard">
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
          title="MRR"
          value={data ? fmtUsd(data.mrr_usd) : "—"}
          subtitle="Monthly recurring revenue"
          icon={DollarSign}
          iconColor="text-green-600"
          loading={isLoading}
        />
        <AdminKpiCard
          title="ARR"
          value={data ? fmtUsd(data.arr_usd) : "—"}
          subtitle="Annual run rate"
          icon={TrendingUp}
          iconColor="text-primary"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Revenue (Period)"
          value={data ? fmtUsd(data.total_revenue_30d) : "—"}
          subtitle="Charged in selected range"
          icon={DollarSign}
          iconColor="text-accent"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Churn Rate"
          value={data ? `${data.churn_rate.toFixed(1)}%` : "—"}
          subtitle={`${data?.canceled_last_30d ?? 0} canceled this period`}
          icon={TrendingDown}
          iconColor="text-destructive"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue + New Subs Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue & New Subscribers by Month</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={data?.revenue_by_month ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                    formatter={(v: number, name: string) => [name === "revenue" ? fmtUsd(v) : v, name === "revenue" ? "Revenue" : "New Subs"]}
                  />
                  <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Line yAxisId="right" type="monotone" dataKey="new_subs" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {isLoading ? (
              <Skeleton className="h-48 w-48 rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data?.plan_distribution ?? []}
                    dataKey="count"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ plan, percent }) => `${plan} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(data?.plan_distribution ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
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

      {/* Subscriber breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <AdminKpiCard
          title="Free Users"
          value={data?.free_count?.toLocaleString() ?? "—"}
          subtitle="No active subscription"
          icon={Users}
          iconColor="text-muted-foreground"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Pro Subscribers"
          value={data?.pro_count?.toLocaleString() ?? "—"}
          subtitle={`${fmtUsd((data?.pro_count ?? 0) * 14.99)} / mo`}
          icon={TrendingUp}
          iconColor="text-primary"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Premium Subscribers"
          value={data?.premium_count?.toLocaleString() ?? "—"}
          subtitle={`${fmtUsd((data?.premium_count ?? 0) * 29.99)} / mo`}
          icon={TrendingUp}
          iconColor="text-accent"
          loading={isLoading}
        />
      </div>

      {/* Revenue by month table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Month</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">New Subs</th>
                </tr>
              </thead>
              <tbody>
                {(data?.revenue_by_month ?? []).map((row) => (
                  <tr key={row.month} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-medium">{row.month}</td>
                    <td className="px-4 py-2.5 text-right">{fmtUsd(row.revenue)}</td>
                    <td className="px-4 py-2.5 text-right">{row.new_subs}</td>
                  </tr>
                ))}
                {(data?.revenue_by_month ?? []).length === 0 && (
                  <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No data available</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
