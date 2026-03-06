import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, CheckCircle, AlertTriangle, Copy, Check, DollarSign, TrendingUp } from "lucide-react";

export default function OfferAnalyzer() {
  const { resumeData } = useResume();
  const [offerText, setOfferText] = useState("");
  const [targetSalary, setTargetSalary] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!offerText.trim() || offerText.trim().length < 50) {
      toast.error("Please paste your offer letter (at least 50 characters)");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("offer-analyzer", {
        body: { offerText, resumeData, targetSalary: targetSalary ? parseInt(targetSalary) : undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Offer analyzed!");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze offer");
    } finally {
      setLoading(false);
    }
  };

  const copyScript = async () => {
    if (!result?.negotiationScript) return;
    await navigator.clipboard.writeText(result.negotiationScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Negotiation script copied!");
  };

  const scoreColor = (s: number) => s >= 80 ? "text-green-600" : s >= 60 ? "text-blue-600" : s >= 40 ? "text-yellow-600" : "text-red-600";

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Offer Letter Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered offer evaluation with negotiation guidance</p>
        </motion.div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Paste Your Offer</CardTitle>
            <CardDescription>Paste your offer letter or key compensation details for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Offer Letter / Compensation Details *</Label>
              <Textarea
                value={offerText}
                onChange={e => setOfferText(e.target.value)}
                placeholder="Paste your full offer letter or key details: base salary, bonus, equity, benefits, start date, PTO, non-compete clauses..."
                rows={8}
                className="resize-none font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <Label>Your Target Salary (optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={targetSalary} onChange={e => setTargetSalary(e.target.value.replace(/\D/g, ""))} placeholder="130000" className="pl-8" />
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={loading} className="brand-gradient border-0 gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Analyze Offer"}
            </Button>
          </CardContent>
        </Card>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Score & Verdict */}
              <Card className="shadow-elevated border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Offer Score</p>
                      <div className="flex items-center gap-3">
                        <span className={`text-5xl font-bold font-display ${scoreColor(result.overallScore)}`}>{result.overallScore}</span>
                        <span className="text-2xl text-muted-foreground">/100</span>
                        <Badge className="text-sm ml-2 border">{result.verdict}</Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1.5">{result.marketComparison}</Badge>
                  </div>
                  <Progress value={result.overallScore} className="mt-4 h-2" />
                  {result.summary && (
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{result.summary}</p>
                  )}
                </CardContent>
              </Card>

              {/* Extracted Details */}
              {result.extracted && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" /> Compensation Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(result.extracted).filter(([, v]) => v).map(([k, v]: [string, any]) => (
                        <div key={k} className="p-3 rounded-lg border bg-card">
                          <p className="text-xs text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</p>
                          <p className="text-sm font-medium mt-0.5">{typeof v === "number" ? `$${v.toLocaleString()}` : String(v)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Green Flags */}
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Green Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(result.greenFlags || []).map((f: string, i: number) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Red Flags */}
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Red Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(result.redFlags || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No red flags identified</p>
                    ) : (
                      (result.redFlags || []).map((f: string, i: number) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Negotiation Points */}
              {result.negotiationPoints?.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" /> Negotiation Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.negotiationPoints.map((p: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{p.item}</span>
                          <Badge variant="outline" className="text-xs">Current: {p.current}</Badge>
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">{p.suggestion}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{p.reasoning}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Negotiation Script */}
              {result.negotiationScript && (
                <Card className="shadow-card border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-display text-lg">Negotiation Script</CardTitle>
                      <Button size="sm" variant="outline" onClick={copyScript} className="gap-2">
                        {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-primary/5 border border-primary/15 p-4 text-sm leading-relaxed italic text-foreground">
                      "{result.negotiationScript}"
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
