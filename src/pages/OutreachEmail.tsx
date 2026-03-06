import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Copy, Check, Lightbulb, Mail, RefreshCw } from "lucide-react";

const EMAIL_TYPES = [
  { value: "cold_outreach", label: "Cold Outreach", desc: "Introduce yourself to a recruiter / hiring manager" },
  { value: "referral_request", label: "Referral Request", desc: "Ask a connection to refer you" },
  { value: "follow_up", label: "Application Follow-Up", desc: "Follow up after submitting application" },
  { value: "informational", label: "Informational Interview", desc: "Request a 15-min call to learn about the company" },
];

export default function OutreachEmail() {
  const { resumeData } = useResume();
  const [form, setForm] = useState({ company: "", role: "", recipientName: "", emailType: "cold_outreach", context: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string; tips: string[] } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleGenerate = async () => {
    if (!form.company.trim()) { toast.error("Company name is required"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("outreach-email", {
        body: { resumeData, ...form },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Email generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied!");
  };

  const copyFull = async () => {
    if (!result) return;
    await copy(`Subject: ${result.subject}\n\n${result.body}`, "full");
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Send className="h-8 w-8 text-primary" />
            Outreach Emails
          </h1>
          <p className="text-muted-foreground mt-1">AI-crafted outreach emails personalized from your resume</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Email Details</CardTitle>
              <CardDescription>Fill in the details and AI will craft a personalized email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Email Type</Label>
                <div className="space-y-2">
                  {EMAIL_TYPES.map(t => (
                    <button key={t.value} onClick={() => update("emailType", t.value)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${form.emailType === t.value ? "border-primary bg-primary/5 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Company *</Label>
                <Input value={form.company} onChange={e => update("company", e.target.value)} placeholder="Stripe" />
              </div>
              <div className="space-y-1.5">
                <Label>Role / Position</Label>
                <Input value={form.role} onChange={e => update("role", e.target.value)} placeholder="Senior Engineer (optional)" />
              </div>
              <div className="space-y-1.5">
                <Label>Recipient Name</Label>
                <Input value={form.recipientName} onChange={e => update("recipientName", e.target.value)} placeholder="John Smith (optional)" />
              </div>
              <div className="space-y-1.5">
                <Label>Additional Context</Label>
                <Textarea value={form.context} onChange={e => update("context", e.target.value)} placeholder="e.g. We met at TechConf, mutual connection: Sarah..." rows={2} className="resize-none" />
              </div>
              <Button onClick={handleGenerate} disabled={loading} className="w-full brand-gradient border-0 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? "Generating..." : "Generate Email"}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <div className="space-y-4">
            <AnimatePresence>
              {result ? (
                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <Card className="shadow-elevated border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-display text-lg">Generated Email</CardTitle>
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleGenerate()} title="Regenerate">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={copyFull}>
                            {copied === "full" ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="rounded-lg bg-muted/40 border p-3">
                        <p className="text-xs text-muted-foreground mb-0.5 font-medium">Subject</p>
                        <p className="text-sm font-medium">{result.subject}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 border p-3">
                        <p className="text-xs text-muted-foreground mb-0.5 font-medium">Body</p>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{result.body}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {result.tips?.length > 0 && (
                    <Card className="shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" /> Sending Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {result.tips.map((tip: string, i: number) => (
                            <div key={i} className="flex gap-2 text-sm">
                              <span className="text-primary mt-0.5">•</span>
                              <span className="text-muted-foreground">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center py-20">
                  <div className="text-center space-y-3">
                    <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-muted-foreground text-sm">Your generated email will appear here</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
