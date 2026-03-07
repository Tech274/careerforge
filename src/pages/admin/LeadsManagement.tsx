import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { AdminKpiCard } from "./components/AdminKpiCard";
import { AdminDateRangePicker } from "./components/AdminDateRangePicker";
import { ConversionFunnel } from "./components/ConversionFunnel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { UserPlus, TrendingUp, Calendar, Zap } from "lucide-react";
import type { LeadsData } from "@/types/admin";
import { formatDistanceToNow, parseISO } from "date-fns";

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

async function fetchLeads(from: string, to: string): Promise<LeadsData> {
  const { data, error } = await supabase.functions.invoke("admin-dashboard", {
    body: { section: "leads", from, to },
  });
  if (error) throw error;
  return data;
}

export default function LeadsManagement() {
  const { from: defFrom, to: defTo } = defaultDateRange();
  const [from, setFrom] = useState(defFrom);
  const [to, setTo] = useState(defTo);

  const { data, isLoading, error } = useQuery<LeadsData>({
    queryKey: ["admin", "leads", from, to],
    queryFn: () => fetchLeads(from, to),
  });

  const handleApply = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
  };

  return (
    <AdminLayout title="Leads & Conversions">
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
          title="Total Signups"
          value={data?.total_signups?.toLocaleString() ?? "—"}
          subtitle="In selected period"
          icon={UserPlus}
          iconColor="text-primary"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Conversion Rate"
          value={data ? `${data.conversion_rate.toFixed(1)}%` : "—"}
          subtitle="Signed up → Paid"
          icon={TrendingUp}
          iconColor="text-green-600"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Leads (7d)"
          value={data?.leads_7d?.toLocaleString() ?? "—"}
          subtitle="New signups this week"
          icon={Calendar}
          iconColor="text-accent"
          loading={isLoading}
        />
        <AdminKpiCard
          title="Upgraded to Paid"
          value={data ? `${data.funnel?.[3]?.count?.toLocaleString() ?? 0}` : "—"}
          subtitle="Pro or Premium plan"
          icon={Zap}
          iconColor="text-yellow-500"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ConversionFunnel stages={data?.funnel ?? []} />
            )}
          </CardContent>
        </Card>

        {/* Signups by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signups by Day</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.signups_by_day ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Signed Up</th>
                  <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Resumes</th>
                  <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Upgraded</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_leads ?? []).map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-medium">{lead.name || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{lead.email}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatDistanceToNow(parseISO(lead.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-2.5 text-center">{lead.resume_count}</td>
                    <td className="px-4 py-2.5 text-center">
                      {lead.has_upgraded ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {(data?.recent_leads ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No leads in this period</td>
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
