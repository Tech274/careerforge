import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useResume } from "@/contexts/ResumeContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle, Target, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ATSBreakdown {
  score: number;
  feedback: string;
}

interface ATSResult {
  score: number;
  breakdown: {
    structure: ATSBreakdown;
    content: ATSBreakdown;
    keywords: ATSBreakdown;
    formatting: ATSBreakdown;
  };
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
}

export default function ATSChecker() {
  const { resumeData } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    const hasData = resumeData.personalInfo.name || resumeData.summary || resumeData.experience.length > 0;
    if (!hasData) {
      toast.error("Add resume data first in the Resume Builder");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ats-check", {
        body: { resumeData, jobDescription },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("ATS analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 75) return "text-accent";
    if (pct >= 50) return "text-amber-500";
    return "text-destructive";
  };

  const overallColor = (score: number) => {
    if (score >= 75) return "text-accent";
    if (score >= 50) return "text-amber-500";
    return "text-destructive";
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            ATS Resume Checker
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze your resume for ATS compatibility and get actionable suggestions
          </p>
        </motion.div>

        {/* Job Description Input */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Job Description (optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for keyword matching analysis. Leave empty for a general resume quality check..."
              rows={6}
              className="resize-none"
            />
            <Button
              onClick={analyze}
              disabled={loading}
              className="brand-gradient border-0 gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="shadow-elevated">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">ATS Compatibility Score</p>
                      <p className={`font-display text-6xl font-bold ${overallColor(result.score)}`}>
                        {result.score}
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">out of 100</p>
                    </div>
                    <div className="w-48">
                      <Progress value={result.score} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-2 text-right">
                        {result.score >= 75 ? "Great! Your resume is ATS-ready" :
                         result.score >= 50 ? "Good, but improvements needed" :
                         "Needs significant improvements"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(result.breakdown).map(([key, val], i) => (
                <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="shadow-card">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-display font-semibold capitalize text-foreground">{key}</p>
                        <span className={`font-display font-bold text-lg ${scoreColor(val.score, 25)}`}>
                          {val.score}/25
                        </span>
                      </div>
                      <Progress value={(val.score / 25) * 100} className="h-1.5 mb-2" />
                      <p className="text-sm text-muted-foreground">{val.feedback}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.matchedKeywords?.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" /> Matched Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedKeywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="bg-accent/10 text-accent border-accent/20">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.missingKeywords?.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Missing Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
