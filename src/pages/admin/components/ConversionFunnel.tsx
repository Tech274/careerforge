import { cn } from "@/lib/utils";

interface FunnelStage {
  label: string;
  count: number;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  className?: string;
}

const STAGE_COLORS = [
  "bg-primary",
  "bg-blue-500",
  "bg-accent",
  "bg-green-500",
];

export function ConversionFunnel({ stages, className }: ConversionFunnelProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {stages.map((stage, i) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 8);
        const convRate = i > 0 && stages[i - 1].count > 0
          ? ((stage.count / stages[i - 1].count) * 100).toFixed(1)
          : null;

        return (
          <div key={stage.label}>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{stage.label}</span>
                  <span className="text-sm font-bold">{stage.count.toLocaleString()}</span>
                </div>
                {/* Bar */}
                <div className="h-6 bg-muted rounded-md overflow-hidden">
                  <div
                    className={cn("h-full rounded-md transition-all duration-500", STAGE_COLORS[i] ?? "bg-primary")}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            </div>
            {convRate !== null && (
              <div className="ml-8 text-xs text-muted-foreground">
                ↓ {convRate}% conversion from previous stage
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
