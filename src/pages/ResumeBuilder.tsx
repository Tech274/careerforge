import { AppLayout } from "@/components/layout/AppLayout";
import { PersonalInfoEditor } from "@/components/resume/PersonalInfoEditor";
import { SummaryEditor } from "@/components/resume/SummaryEditor";
import { ExperienceEditor } from "@/components/resume/ExperienceEditor";
import { EducationEditor } from "@/components/resume/EducationEditor";
import { SkillsEditor } from "@/components/resume/SkillsEditor";
import { StrengthScore } from "@/components/resume/StrengthScore";
import { TemplateSelector } from "@/components/resume/TemplateSelector";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { VersionHistory } from "@/components/resume/VersionHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useResume } from "@/contexts/ResumeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Plus, Trash2, Loader2, FileText, Clock, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

function SavedResumesList() {
  const { savedResumes, loadResume, deleteResume, duplicateResume, currentResumeId, loading } = useResume();

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  if (savedResumes.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Saved Resumes</p>
      {savedResumes.map(r => (
        <Card key={r.id} className={`cursor-pointer transition-colors ${currentResumeId === r.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}>
          <CardContent className="p-3 flex items-center justify-between">
            <button onClick={() => loadResume(r.id)} className="flex items-center gap-2 text-left flex-1 min-w-0">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</p>
              </div>
            </button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); duplicateResume(r.id); }} title="Duplicate">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteResume(r.id); }} title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BuilderContent() {
  const { saveResume, saving, createNewResume, currentResumeId, resumeData, template } = useResume();
  const { user } = useAuth();
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevDataRef = useRef<string>("");

  // Auto-save every 30 seconds if data changed
  useEffect(() => {
    if (!user) return;
    const dataSnapshot = JSON.stringify({ resumeData, template });

    autoSaveTimer.current = setInterval(() => {
      const current = JSON.stringify({ resumeData, template });
      if (current !== prevDataRef.current && prevDataRef.current !== "") {
        // Data changed since last check, auto-save
        saveResume().then(() => {
          setLastAutoSave(new Date());
          prevDataRef.current = current;
        });
      } else {
        prevDataRef.current = current;
      }
    }, 30000);

    prevDataRef.current = dataSnapshot;

    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [user, resumeData, template, saveResume]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-1/2 border-r">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Resume Builder</h2>
                <p className="text-muted-foreground text-sm mt-1">Fill in your details and see your resume update in real-time</p>
              </div>
              <div className="flex gap-2">
                <VersionHistory />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={createNewResume}>
                  <Plus className="h-3.5 w-3.5" /> New
                </Button>
                <Button size="sm" className="gap-1.5 brand-gradient border-0" onClick={() => saveResume()} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {currentResumeId ? 'Save' : 'Save New'}
                </Button>
              </div>
            </div>
            <SavedResumesList />
            <StrengthScore />
            <TemplateSelector />
            <PersonalInfoEditor />
            <SummaryEditor />
            <ExperienceEditor />
            <EducationEditor />
            <SkillsEditor />
          </div>
        </ScrollArea>
      </div>
      <div className="w-1/2">
        <ScrollArea className="h-full">
          <div className="p-6">
            <ResumePreview />
              </div>
              {lastAutoSave && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Auto-saved {lastAutoSave.toLocaleTimeString()}
                </div>
              )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <AppLayout>
      <BuilderContent />
    </AppLayout>
  );
}
