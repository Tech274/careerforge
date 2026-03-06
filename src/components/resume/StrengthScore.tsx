import { useResume } from "@/contexts/ResumeContext";
import { Progress } from "@/components/ui/progress";

export function StrengthScore() {
  const { strengthScore } = useResume();
  
  const color = strengthScore >= 80 ? "text-accent" : strengthScore >= 50 ? "text-amber-500" : "text-destructive";
  const label = strengthScore >= 80 ? "Excellent" : strengthScore >= 50 ? "Good" : "Needs Work";

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-semibold text-foreground">Resume Strength</h4>
        <span className={`font-display font-bold text-2xl ${color}`}>{strengthScore}</span>
      </div>
      <Progress value={strengthScore} className="h-2" />
      <p className={`text-sm font-medium ${color}`}>{label}</p>
    </div>
  );
}
