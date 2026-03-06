import { useResume } from "@/contexts/ResumeContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Experience } from "@/types/resume";
import { AIRewriteButton } from "./AIRewriteButton";
import { SmartSuggestions } from "./SmartSuggestions";

export function ExperienceEditor() {
  const { resumeData, updateResumeData } = useResume();
  const { experience } = resumeData;

  const addEntry = () => {
    const newEntry: Experience = {
      id: crypto.randomUUID(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    };
    updateResumeData({ experience: [...experience, newEntry] });
  };

  const updateEntry = (id: string, field: string, value: any) => {
    updateResumeData({
      experience: experience.map(e => e.id === id ? { ...e, [field]: value } : e),
    });
  };

  const removeEntry = (id: string) => {
    updateResumeData({ experience: experience.filter(e => e.id !== id) });
  };

  const updateBullet = (entryId: string, idx: number, value: string) => {
    const entry = experience.find(e => e.id === entryId);
    if (!entry) return;
    const bullets = [...entry.bullets];
    bullets[idx] = value;
    updateEntry(entryId, "bullets", bullets);
  };

  const addBullet = (entryId: string) => {
    const entry = experience.find(e => e.id === entryId);
    if (!entry) return;
    updateEntry(entryId, "bullets", [...entry.bullets, ""]);
  };

  const removeBullet = (entryId: string, idx: number) => {
    const entry = experience.find(e => e.id === entryId);
    if (!entry) return;
    updateEntry(entryId, "bullets", entry.bullets.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg text-foreground">Work Experience</h3>
        <Button onClick={addEntry} size="sm" variant="outline" className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
      {experience.map((entry, i) => (
        <div key={entry.id} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Experience {i + 1}</span>
            <Button onClick={() => removeEntry(entry.id)} size="icon" variant="ghost" className="h-7 w-7 text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Company</Label>
              <Input value={entry.company} onChange={e => updateEntry(entry.id, "company", e.target.value)} placeholder="Google" className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Input value={entry.role} onChange={e => updateEntry(entry.id, "role", e.target.value)} placeholder="Software Engineer" className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input value={entry.startDate} onChange={e => updateEntry(entry.id, "startDate", e.target.value)} placeholder="Jan 2020" className="bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input value={entry.endDate} onChange={e => updateEntry(entry.id, "endDate", e.target.value)} placeholder="Present" className="bg-background" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Key Achievements</Label>
            {entry.bullets.map((bullet, idx) => (
              <div key={idx} className="space-y-0">
                <div className="flex gap-2">
                  <Input value={bullet} onChange={e => updateBullet(entry.id, idx, e.target.value)} placeholder="Describe an achievement..." className="bg-background flex-1" />
                  <AIRewriteButton
                    text={bullet}
                    onAccept={(newText) => updateBullet(entry.id, idx, newText)}
                  />
                  {entry.bullets.length > 1 && (
                    <Button onClick={() => removeBullet(entry.id, idx)} size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Button onClick={() => addBullet(entry.id)} size="sm" variant="ghost" className="text-xs text-muted-foreground">
                + Add bullet point
              </Button>
              <SmartSuggestions
                role={entry.role}
                onInsert={(bullet) => {
                  updateEntry(entry.id, "bullets", [...entry.bullets, bullet]);
                }}
              />
            </div>
          </div>
        </div>
      ))}
      {experience.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No experience added yet. Click "Add" to get started.</p>
      )}
    </div>
  );
}
