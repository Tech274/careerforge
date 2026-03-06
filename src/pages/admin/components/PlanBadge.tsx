import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: "free" | "pro" | "premium";
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const styles: Record<string, string> = {
    free: "bg-secondary text-secondary-foreground border-secondary",
    pro: "bg-primary/15 text-primary border border-primary/20",
    premium: "bg-accent/15 text-accent-foreground border border-accent/30",
  };

  const labels: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    premium: "Premium",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold capitalize",
        styles[plan] ?? styles.free,
        className,
      )}
    >
      {labels[plan] ?? plan}
    </Badge>
  );
}
