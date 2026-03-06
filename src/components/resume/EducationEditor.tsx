import { useResume } from "@/contexts/ResumeContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Education } from "@/types/resume";

export function EducationEditor() {
  const { resumeData, updateResumeData } = useResume();
  const { education } = resumeData;

  const addEntry = () => {
    const entry: Education = { id: crypto.randomUUID(), institution: "", degree: "", year: "" };
    updateResumeData({ education: [...education, entry] });
  };

  const updateEntry = (id: string, field: string, value: string) => {
    updateResumeData({ education: education.map(e => e.id === id ? { ...e, [field]: value } : e) });
  };

  const removeEntry = (id: string) => {
    updateResumeData({ education: education.filter(e => e.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg text-foreground">Education</h3>
        <Button onClick={addEntry} size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button>
      </div>
      {education.map((entry, i) => (
        <div key={entry.id} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Education {i + 1}</span>
            <Button onClick={() => removeEntry(entry.id)} size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Institution</Label><Input value={entry.institution} onChange={e => updateEntry(entry.id, "institution", e.target.value)} placeholder="MIT" className="bg-background" /></div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Degree</Label><Input value={entry.degree} onChange={e => updateEntry(entry.id, "degree", e.target.value)} placeholder="B.S. Computer Science" className="bg-background" /></div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Year</Label><Input value={entry.year} onChange={e => updateEntry(entry.id, "year", e.target.value)} placeholder="2020" className="bg-background" /></div>
          </div>
        </div>
      ))}
      {education.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No education added yet.</p>}
    </div>
  );
}
