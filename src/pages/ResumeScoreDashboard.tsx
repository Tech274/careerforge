import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useResume } from "@/contexts/ResumeContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Loader2, Sparkles, BookOpen, Zap, CheckSquare, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ScoreDimension {
  score: number;
  feedback: string;
  tips: string[];
}

interface ScoreResult {
  overall: number;
  readability: ScoreDimension;
  impactLanguage: ScoreDimension;
  completeness: ScoreDimension;
  atsCompatibility: ScoreDimension;
  topSuggestions: string[];
}

const dimensionConfig = [
  { key: "readability" as const, label: "Readability", icon: BookOpen, color: "text-blue-500" },
  { key: "impactLanguage" as const, label: "Impact Language", icon: Zap, color: "text-amber-500" },
  { key: "completeness" as const, label: "Completeness", icon: CheckSquare, color: "text-accent" },
  { key: "atsCompatibility" as const, label: "ATS Compatibility", icon: ShieldCheck, color: "text-primary" },
];

export default function ResumeScoreDashboard() {
  const { resumeData } = useResume();
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    const hasData = resumeData.personalInfo.name || resumeData.summary || resumeData.experience.length > 0;
    if (!hasData) {
      toast.error("Add resume data first in the Resume Builder");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-score", {
        body: { resumeData },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  const scoreGradient = (score: number) => {
    if (score >= 80) return "from-accent/20 to-accent/5";
    if (score >= 60) return "from-amber-500/20 to-amber-500/5";
    return "from-destructive/20 to-destructive/5";
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                Resume Score Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Get AI-powered analytics on your resume across key dimensions
              </p>
            </div>
            <Button onClick={analyze} disabled={loading} className="brand-gradient border-0 gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </div>
        </motion.div>

        {!result && !loading && (
          <Card className="shadow-card">
            <CardContent className="py-16 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-2">No analysis yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Analyze Resume" to get a detailed breakdown of your resume quality
              </p>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className={`shadow-elevated bg-gradient-to-br ${scoreGradient(result.overall)}`}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Overall Resume Score</p>
                      <p className={`font-display text-7xl font-bold ${scoreColor(result.overall)}`}>
                        {result.overall}
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">out of 100</p>
                    </div>
                    <div className="w-56 space-y-2">
                      <Progress value={result.overall} className="h-3" />
                      <p className="text-xs text-muted-foreground text-right">
                        {result.overall >= 80 ? "🎉 Excellent resume!" :
                         result.overall >= 60 ? "👍 Good, with room to improve" :
                         "⚠️ Significant improvements needed"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dimension Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dimensionConfig.map((dim, i) => {
                const data = result[dim.key];
                if (!data) return null;
                return (
                  <motion.div key={dim.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="shadow-card h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-base flex items-center justify-between">
                          <span className={`flex items-center gap-2 ${dim.color}`}>
                            <dim.icon className="h-4 w-4" /> {dim.label}
                          </span>
                          <span className={`font-display font-bold text-xl ${scoreColor(data.score)}`}>
                            {data.score}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Progress value={data.score} className="h-1.5" />
                        <p className="text-sm text-muted-foreground">{data.feedback}</p>
                        {data.tips?.length > 0 && (
                          <ul className="space-y-1">
                            {data.tips.map((tip, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Top Suggestions */}
            {result.topSuggestions?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Top Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.topSuggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground p-2 rounded-lg bg-secondary/50">
                          <span className="font-display font-bold text-primary mt-0.5">{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
