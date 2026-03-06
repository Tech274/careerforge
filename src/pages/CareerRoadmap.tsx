import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Loader2, ExternalLink, CheckCircle, Circle, BookOpen, Youtube, Globe, Award, Zap, Clock } from "lucide-react";

const platformIcons: Record<string, string> = {
  YouTube: "🎬", Coursera: "🎓", Udemy: "📚", Docs: "📄", Book: "📖",
};

export default function CareerRoadmap() {
  const { resumeData } = useResume();
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!targetRole.trim()) { toast.error("Enter a target role"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-roadmap", {
        body: { resumeData, targetRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRoadmap(data);
      toast.success("Career roadmap generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (key: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalResources = roadmap?.phases?.reduce((a: number, p: any) => a + (p.resources?.length || 0), 0) || 0;
  const completedCount = completedSteps.size;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Map className="h-8 w-8 text-primary" />
            Career Roadmap
          </h1>
          <p className="text-muted-foreground mt-1">Get a personalized learning path to reach your target role</p>
        </motion.div>

        <Card className="shadow-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex gap-3">
              <Input
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Data Scientist, DevOps Engineer, Product Manager..."
                className="flex-1"
                onKeyDown={e => e.key === "Enter" && handleGenerate()}
              />
              <Button onClick={handleGenerate} disabled={loading} className="brand-gradient border-0 gap-2 shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
                {loading ? "Generating..." : "Generate Roadmap"}
              </Button>
            </div>
            {resumeData.personalInfo?.name && (
              <p className="text-xs text-muted-foreground">
                Building roadmap for: <span className="font-medium text-foreground">{resumeData.personalInfo.name}</span> based on your resume
              </p>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {roadmap && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="shadow-card text-center p-4">
                  <p className="text-2xl font-bold font-display text-primary">{roadmap.readinessScore || 0}%</p>
                  <p className="text-xs text-muted-foreground">Readiness Score</p>
                </Card>
                <Card className="shadow-card text-center p-4">
                  <p className="text-2xl font-bold font-display text-foreground">{roadmap.estimatedTimeline || "?"}</p>
                  <p className="text-xs text-muted-foreground">Estimated Timeline</p>
                </Card>
                <Card className="shadow-card text-center p-4">
                  <p className="text-2xl font-bold font-display text-foreground">{roadmap.phases?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Learning Phases</p>
                </Card>
                <Card className="shadow-card text-center p-4">
                  <p className="text-2xl font-bold font-display text-foreground">{completedCount}/{totalResources}</p>
                  <p className="text-xs text-muted-foreground">Resources Done</p>
                </Card>
              </div>

              {totalResources > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Overall Progress</span>
                    <span>{Math.round((completedCount / totalResources) * 100)}%</span>
                  </div>
                  <Progress value={(completedCount / totalResources) * 100} className="h-2" />
                </div>
              )}

              {/* Quick Wins */}
              {roadmap.quickWins?.length > 0 && (
                <Card className="shadow-card border-accent/30 bg-accent/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Quick Wins — Start This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {roadmap.quickWins.map((w: string, i: number) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <span className="text-accent mt-0.5">→</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Phases */}
              {roadmap.phases?.map((phase: any, pi: number) => (
                <motion.div key={pi} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.1 }}>
                  <Card className="shadow-card">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {phase.phase}
                            </span>
                            <CardTitle className="font-display text-lg">{phase.title}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />{phase.duration}
                            </Badge>
                          </div>
                          <CardDescription>{phase.description}</CardDescription>
                        </div>
                      </div>
                      {phase.skills?.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {phase.skills.map((s: string) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {phase.resources?.map((r: any, ri: number) => {
                        const key = `${pi}-${ri}`;
                        const done = completedSteps.has(key);
                        return (
                          <div key={ri} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${done ? "bg-accent/10 border-accent/30" : "bg-card border-border"}`}>
                            <button onClick={() => toggleStep(key)} className="mt-0.5 shrink-0">
                              {done ? <CheckCircle className="h-5 w-5 text-accent" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{platformIcons[r.platform] || "🔗"} {r.title}</span>
                                <Badge variant="outline" className={`text-xs ${r.type === "free" ? "text-green-600 border-green-300" : "text-orange-600 border-orange-300"}`}>
                                  {r.type === "free" ? "Free" : "Paid"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{r.platform}</span>
                                {r.duration && <span className="text-xs text-muted-foreground">• {r.duration}</span>}
                              </div>
                            </div>
                            {r.url && (
                              <a href={r.url} target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            )}
                          </div>
                        );
                      })}
                      {phase.milestone && (
                        <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 mt-2">
                          <p className="text-xs font-semibold text-primary mb-0.5">🏁 Phase Milestone</p>
                          <p className="text-sm text-muted-foreground">{phase.milestone}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Certifications */}
              {roadmap.certifications?.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" /> Recommended Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roadmap.certifications.map((c: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                          <Award className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.provider} • {c.cost}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
