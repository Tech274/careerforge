import { useResume } from "@/contexts/ResumeContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SummaryEditor() {
  const { resumeData, updateResumeData } = useResume();

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-lg text-foreground">Professional Summary</h3>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-muted-foreground">Summary</Label>
        <Textarea
          value={resumeData.summary}
          onChange={(e) => updateResumeData({ summary: e.target.value })}
          placeholder="A brief professional summary highlighting your experience and goals..."
          rows={4}
          className="bg-background resize-none"
        />
      </div>
    </div>
  );
}
