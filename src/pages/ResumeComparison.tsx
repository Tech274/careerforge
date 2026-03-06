import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitCompare, ArrowLeftRight, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { ResumeData, calculateStrengthScore } from "@/types/resume";

interface ComparisonSource {
  type: "resume" | "version";
  id: string;
  label: string;
  data: ResumeData;
  template: string;
}

function SectionDiff({ label, left, right }: { label: string; left: string; right: string }) {
  const same = left === right;
  return (
    <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/50 last:border-0">
      <div className="text-sm">
        <span className="text-muted-foreground text-xs block mb-0.5">{label}</span>
        <span className={`text-foreground ${!same ? "bg-accent/30 px-1 rounded" : ""}`}>
          {left || <span className="text-muted-foreground italic">Empty</span>}
        </span>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground text-xs block mb-0.5">{label}</span>
        <span className={`text-foreground ${!same ? "bg-primary/10 px-1 rounded" : ""}`}>
          {right || <span className="text-muted-foreground italic">Empty</span>}
        </span>
      </div>
    </div>
  );
}

function ScoreComparison({ leftScore, rightScore }: { leftScore: number; rightScore: number }) {
  const diff = rightScore - leftScore;
  return (
    <div className="grid grid-cols-2 gap-4 py-3">
      <div className="text-center">
        <p className="text-3xl font-bold text-primary">{leftScore}</p>
        <p className="text-xs text-muted-foreground">Strength Score</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-primary">{rightScore}</p>
        <p className="text-xs text-muted-foreground">
          Strength Score
          {diff !== 0 && (
            <Badge variant={diff > 0 ? "default" : "destructive"} className="ml-2 text-xs">
              {diff > 0 ? "+" : ""}{diff}
            </Badge>
          )}
        </p>
      </div>
    </div>
  );
}

function ListDiff({ label, left, right }: { label: string; left: string[]; right: string[] }) {
  const added = right.filter(r => !left.includes(r));
  const removed = left.filter(l => !right.includes(l));
  const kept = left.filter(l => right.includes(l));

  return (
    <div className="py-2 border-b border-border/50 last:border-0">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-wrap gap-1.5">
          {left.map(item => (
            <Badge key={item} variant={removed.includes(item) ? "destructive" : "secondary"} className="text-xs">
              {removed.includes(item) && <MinusCircle className="h-3 w-3 mr-1" />}
              {item}
            </Badge>
          ))}
          {left.length === 0 && <span className="text-xs text-muted-foreground italic">None</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {right.map(item => (
            <Badge key={item} variant={added.includes(item) ? "default" : "secondary"} className="text-xs">
              {added.includes(item) && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {item}
            </Badge>
          ))}
          {right.length === 0 && <span className="text-xs text-muted-foreground italic">None</span>}
        </div>
      </div>
    </div>
  );
}

export default function ResumeComparison() {
  const { savedResumes, versions, currentResumeId } = useResume();
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const sources: ComparisonSource[] = useMemo(() => {
    const items: ComparisonSource[] = [];
    savedResumes.forEach(r => {
      items.push({ type: "resume", id: `resume-${r.id}`, label: r.title, data: r.data, template: r.template });
    });
    versions.forEach(v => {
      items.push({ type: "version", id: `version-${v.id}`, label: `Version ${v.version_number} (${new Date(v.created_at).toLocaleDateString()})`, data: v.resume_data, template: v.template });
    });
    return items;
  }, [savedResumes, versions]);

  const left = sources.find(s => s.id === leftId);
  const right = sources.find(s => s.id === rightId);

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <GitCompare className="h-8 w-8 text-primary" />
            Resume Comparison
          </h1>
          <p className="text-muted-foreground mt-1">Compare resume versions or variants side by side</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <Select value={leftId} onValueChange={setLeftId}>
            <SelectTrigger><SelectValue placeholder="Select first resume..." /></SelectTrigger>
            <SelectContent>
              {sources.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.type === "version" ? "📋 " : "📄 "}{s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={rightId} onValueChange={setRightId}>
            <SelectTrigger><SelectValue placeholder="Select second resume..." /></SelectTrigger>
            <SelectContent>
              {sources.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.type === "version" ? "📋 " : "📄 "}{s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {left && right ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-primary" /> Score Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreComparison leftScore={calculateStrengthScore(left.data)} rightScore={calculateStrengthScore(right.data)} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Personal Information</CardTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Badge variant="outline">{left.label}</Badge>
                  <Badge variant="outline">{right.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <SectionDiff label="Name" left={left.data.personalInfo?.name || ""} right={right.data.personalInfo?.name || ""} />
                <SectionDiff label="Title" left={left.data.personalInfo?.title || ""} right={right.data.personalInfo?.title || ""} />
                <SectionDiff label="Email" left={left.data.personalInfo?.email || ""} right={right.data.personalInfo?.email || ""} />
                <SectionDiff label="Location" left={left.data.personalInfo?.location || ""} right={right.data.personalInfo?.location || ""} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionDiff label="Professional Summary" left={left.data.summary || ""} right={right.data.summary || ""} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">{left.data.experience?.length || 0} positions</p>
                    {(left.data.experience || []).map((exp, i) => (
                      <div key={i} className="mb-2 text-sm">
                        <p className="font-medium text-foreground">{exp.role}</p>
                        <p className="text-muted-foreground text-xs">{exp.company} · {exp.startDate} - {exp.endDate || "Present"}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">{right.data.experience?.length || 0} positions</p>
                    {(right.data.experience || []).map((exp, i) => (
                      <div key={i} className="mb-2 text-sm">
                        <p className="font-medium text-foreground">{exp.role}</p>
                        <p className="text-muted-foreground text-xs">{exp.company} · {exp.startDate} - {exp.endDate || "Present"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ListDiff label="Skills" left={left.data.skills || []} right={right.data.skills || []} />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Template</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionDiff label="Template" left={left.template} right={right.template} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="shadow-card">
            <CardContent className="py-16 text-center">
              <GitCompare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Select two resumes or versions above to compare them side by side.</p>
              {sources.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">Save some resumes first to use comparison.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
