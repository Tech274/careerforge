import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useResume } from "@/contexts/ResumeContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Copy, Check, Sparkles, Loader2, User, Briefcase, Hash } from "lucide-react";
import { toast } from "sonner";

interface LinkedInResult {
  headline?: string;
  about?: string;
  experience?: { company: string; role: string; description: string }[];
  keywords?: string[];
}

export default function LinkedInOptimizer() {
  const { resumeData } = useResume();
  const [result, setResult] = useState<LinkedInResult>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const optimize = async (section?: string) => {
    setLoading(section || "all");
    try {
      const { data, error } = await supabase.functions.invoke("linkedin-optimize", {
        body: { resumeData, section },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult((prev) => ({ ...prev, ...data }));
      toast.success(`${section || "Full profile"} optimized!`);
    } catch (e: any) {
      toast.error(e.message || "Optimization failed");
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => copyToClipboard(text, field)}
      className="gap-1.5 text-muted-foreground"
    >
      {copiedField === field ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
      {copiedField === field ? "Copied" : "Copy"}
    </Button>
  );

  const hasResumeData = resumeData.personalInfo.name || resumeData.summary || resumeData.experience.length > 0;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <Linkedin className="h-8 w-8 text-primary" />
                LinkedIn Optimizer
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate LinkedIn-ready content from your resume data
              </p>
            </div>
            <Button
              onClick={() => optimize()}
              disabled={!hasResumeData || loading !== null}
              className="brand-gradient border-0 gap-2"
            >
              {loading === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Optimize All
            </Button>
          </div>
        </motion.div>

        {!hasResumeData && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Fill in your resume data first in the Resume Builder, then come back to optimize your LinkedIn profile.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.href = "/resumes"}>
                Go to Resume Builder
              </Button>
            </CardContent>
          </Card>
        )}

        {hasResumeData && (
          <div className="space-y-6">
            {/* Headline */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="shadow-card">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="font-display text-lg">Headline</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {result.headline && <CopyBtn text={result.headline} field="headline" />}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => optimize("headline")}
                      disabled={loading !== null}
                      className="gap-1.5"
                    >
                      {loading === "headline" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      Generate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.headline ? (
                    <p className="text-foreground font-medium bg-secondary/50 rounded-lg p-4">{result.headline}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm">Click Generate to create a compelling LinkedIn headline.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="shadow-card">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="font-display text-lg">About Section</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {result.about && <CopyBtn text={result.about} field="about" />}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => optimize("about")}
                      disabled={loading !== null}
                      className="gap-1.5"
                    >
                      {loading === "about" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      Generate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.about ? (
                    <div className="bg-secondary/50 rounded-lg p-4 whitespace-pre-wrap text-foreground">{result.about}</div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Generate a professional About section for your LinkedIn profile.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Experience */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="shadow-card">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <CardTitle className="font-display text-lg">Experience</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => optimize("experience")}
                    disabled={loading !== null}
                    className="gap-1.5"
                  >
                    {loading === "experience" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Optimize
                  </Button>
                </CardHeader>
                <CardContent>
                  {result.experience && result.experience.length > 0 ? (
                    <div className="space-y-4">
                      {result.experience.map((exp, i) => (
                        <div key={i} className="bg-secondary/50 rounded-lg p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-foreground">{exp.role}</p>
                              <p className="text-sm text-muted-foreground">{exp.company}</p>
                            </div>
                            <CopyBtn text={exp.description} field={`exp-${i}`} />
                          </div>
                          <p className="text-sm text-foreground mt-2">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Optimize your experience entries for LinkedIn.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Keywords */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="shadow-card">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    <CardTitle className="font-display text-lg">Keywords</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => optimize("keywords")}
                    disabled={loading !== null}
                    className="gap-1.5"
                  >
                    {loading === "keywords" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Suggest
                  </Button>
                </CardHeader>
                <CardContent>
                  {result.keywords && result.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((kw, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => copyToClipboard(kw, `kw-${i}`)}
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Get high-performing keyword suggestions for your profile.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
