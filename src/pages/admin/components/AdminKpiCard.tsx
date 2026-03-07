import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;        // positive = up, negative = down
  trendLabel?: string;   // e.g. "vs last month"
  loading?: boolean;
}

export function AdminKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  trendLabel,
  loading = false,
}: AdminKpiCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  const trendPositive = trend !== undefined && trend >= 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className={cn("p-2 rounded-lg bg-primary/10", iconColor.replace("text-", "bg-").replace("primary", "primary/10"))}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {(subtitle || trend !== undefined) && (
          <div className="mt-1 flex items-center gap-2">
            {trend !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
                  trendPositive && "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
                  trendNegative && "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
                )}
              >
                {trendPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend)}%
              </span>
            )}
            {(subtitle || trendLabel) && (
              <p className="text-xs text-muted-foreground">{subtitle ?? trendLabel}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
