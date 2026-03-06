import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Loader2, CheckCircle, AlertCircle, Zap, TrendingUp, XCircle } from "lucide-react";

const verdictStyles: Record<string, { bg: string; text: string; border: string }> = {
  "Strong Match": { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
  "Good Match": { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  "Partial Match": { bg: "bg-yellow-50 dark:bg-yellow-950/30", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-800" },
  "Long Shot": { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
};

const scoreColor = (s: number) => s >= 80 ? "text-green-600" : s >= 60 ? "text-blue-600" : s >= 40 ? "text-yellow-600" : "text-red-600";

export default function JobMatchScore() {
  const { resumeData } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleMatch = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 100) {
      toast.error("Please paste a full job description (at least 100 characters)");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-match", {
        body: { resumeData, jobDescription },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Match score calculated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to calculate match score");
    } finally {
      setLoading(false);
    }
  };

  const verdictStyle = result ? (verdictStyles[result.verdict] || verdictStyles["Partial Match"]) : null;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Job Match Score
          </h1>
          <p className="text-muted-foreground mt-1">Instantly see how well your resume matches a job before applying</p>
        </motion.div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Paste Job Description</CardTitle>
            <CardDescription>AI will compare it against your current resume and give a detailed match analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="resize-none"
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleMatch} disabled={loading} className="brand-gradient border-0 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                {loading ? "Calculating..." : "Calculate Match"}
              </Button>
              {resumeData.personalInfo?.name && (
                <p className="text-xs text-muted-foreground">
                  Matching against: <span className="font-medium text-foreground">{resumeData.personalInfo.name}'s resume</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Big Score */}
              <Card className={`shadow-elevated border ${verdictStyle?.border || ""} ${verdictStyle?.bg || ""}`}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between flex-wrap gap-6">
                    <div className="text-center">
                      <p className={`text-7xl font-bold font-display ${scoreColor(result.overallMatch)}`}>{result.overallMatch}%</p>
                      <p className="text-muted-foreground text-sm mt-1">Overall Match</p>
                    </div>
                    <div className="flex-1 space-y-3 max-w-sm">
                      <Badge className={`text-base px-4 py-2 border ${verdictStyle?.border || ""} ${verdictStyle?.text || ""} bg-transparent`}>
                        {result.verdict}
                      </Badge>
                      <p className={`text-sm font-medium ${verdictStyle?.text || ""}`}>
                        Recommendation: {result.applyRecommendation}
                      </p>
                    </div>
                  </div>
                  <Progress value={result.overallMatch} className="mt-6 h-3" />
                </CardContent>
              </Card>

              {/* Dimension Breakdown */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-lg">Match Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(result.dimensions || {}).map(([dim, details]: [string, any]) => (
                    <div key={dim}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{dim.replace(/([A-Z])/g, " $1")}</span>
                        <span className={`text-sm font-bold ${scoreColor(details.score)}`}>{details.score}%</span>
                      </div>
                      <Progress value={details.score} className="h-2 mb-1" />
                      {details.assessment && (
                        <p className="text-xs text-muted-foreground">{details.assessment}</p>
                      )}
                      {details.matched?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {details.matched.map((s: string) => (
                            <Badge key={s} variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">{s}</Badge>
                          ))}
                        </div>
                      )}
                      {details.missing?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {details.missing.map((s: string) => (
                            <Badge key={s} variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                {result.keyStrengths?.length > 0 && (
                  <Card className="shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Your Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.keyStrengths.map((s: string, i: number) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Gaps */}
                {result.gaps?.length > 0 && (
                  <Card className="shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                        <XCircle className="h-4 w-4" /> Gaps to Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.gaps.map((g: string, i: number) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{g}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Quick Fixes */}
              {result.quickFixes?.length > 0 && (
                <Card className="shadow-card border-accent/30 bg-accent/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-accent flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Quick Fixes to Improve Your Match
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.quickFixes.map((f: string, i: number) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <Zap className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
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
