import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useResume } from "@/contexts/ResumeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Loader2, Target, CheckCircle, FileText, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ResumeData } from "@/types/resume";

interface TailorResult {
  tailoredResume: ResumeData;
  extractedKeywords: string[];
  matchScore: number;
}

export default function ResumeTailoring() {
  const { resumeData, savedResumes } = useResume();
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const tailor = async () => {
    const hasData = resumeData.personalInfo.name || resumeData.summary || resumeData.experience.length > 0;
    if (!hasData) {
      toast.error("Build your master resume first in the Resume Builder");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Paste a job description to tailor against");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-tailor", {
        body: { resumeData, jobDescription },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Resume tailored successfully!");
    } catch (e: any) {
      toast.error(e.message || "Tailoring failed");
    } finally {
      setLoading(false);
    }
  };

  const saveVariant = async () => {
    if (!result?.tailoredResume || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("resume_variants").insert({
        user_id: user.id,
        resume_id: savedResumes[0]?.id || crypto.randomUUID(),
        resume_data: result.tailoredResume as any,
        job_description: jobDescription,
        title: `Tailored - ${result.tailoredResume.personalInfo?.title || "Resume"}`,
      } as any);
      if (error) throw error;
      toast.success("Tailored variant saved!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save variant");
    } finally {
      setSaving(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return "text-accent";
    if (score >= 50) return "text-amber-500";
    return "text-destructive";
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-primary" />
            Resume Tailoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Paste a job description to generate a resume tailored specifically for that role
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={12}
                className="resize-none"
              />
              <Button onClick={tailor} disabled={loading} className="w-full brand-gradient border-0 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Tailoring..." : "Tailor My Resume"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {!result && !loading && (
              <Card className="shadow-card">
                <CardContent className="py-16 text-center">
                  <Wand2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-foreground mb-2">No tailored resume yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Paste a job description and click "Tailor My Resume" to generate a targeted version
                  </p>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                {/* Match Score */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="shadow-elevated">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Match Score</p>
                          <p className={`font-display text-5xl font-bold ${scoreColor(result.matchScore)}`}>
                            {result.matchScore}%
                          </p>
                        </div>
                        <div className="w-40">
                          <Progress value={result.matchScore} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Keywords */}
                {result.extractedKeywords?.length > 0 && (
                  <Card className="shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" /> Extracted Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1.5">
                        {result.extractedKeywords.map((kw, i) => (
                          <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tailored Summary Preview */}
                {result.tailoredResume?.summary && (
                  <Card className="shadow-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" /> Tailored Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{result.tailoredResume.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={saveVariant} disabled={saving} className="flex-1 gap-2" variant="outline">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                    Save as Variant
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
