import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Loader2, Copy, Check, Trash2, Mail } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useResume } from "@/contexts/ResumeContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CoverLetter {
  id: string;
  jobTitle: string;
  company: string;
  hiringManager: string;
  jobDescription: string;
  tone: string;
  subject: string;
  body: string;
  createdAt: string;
}

const toneOptions = [
  { value: "professional", label: "Professional", desc: "Formal & polished" },
  { value: "friendly", label: "Friendly", desc: "Warm & personable" },
  { value: "bold", label: "Bold", desc: "Assertive & memorable" },
];

export default function CoverLetters() {
  const { resumeData } = useResume();
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [form, setForm] = useState({
    jobTitle: "", company: "", hiringManager: "", jobDescription: "", tone: "professional",
  });

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleGenerate = async () => {
    if (!form.jobTitle.trim() || !form.company.trim()) {
      toast.error("Job title and company are required");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("cover-letter", {
        body: { resumeData, ...form },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const newLetter: CoverLetter = {
        id: crypto.randomUUID(),
        ...form,
        subject: data.subject || `Cover Letter — ${form.jobTitle} at ${form.company}`,
        body: data.body || "",
        createdAt: new Date().toISOString(),
      };
      setLetters(prev => [newLetter, ...prev]);
      setIsCreating(false);
      setForm({ jobTitle: "", company: "", hiringManager: "", jobDescription: "", tone: "professional" });
      toast.success("Cover letter generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManual = () => {
    if (!form.jobTitle.trim() || !form.company.trim()) {
      toast.error("Job title and company are required");
      return;
    }
    const newLetter: CoverLetter = {
      id: crypto.randomUUID(),
      ...form,
      subject: `Cover Letter — ${form.jobTitle} at ${form.company}`,
      body: "",
      createdAt: new Date().toISOString(),
    };
    setLetters(prev => [newLetter, ...prev]);
    setIsCreating(false);
    setForm({ jobTitle: "", company: "", hiringManager: "", jobDescription: "", tone: "professional" });
    toast.success("Cover letter saved!");
  };

  const copyLetter = async (letter: CoverLetter) => {
    const text = `Subject: ${letter.subject}\n\n${letter.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(letter.id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const deleteLetter = (id: string) => {
    setLetters(prev => prev.filter(l => l.id !== id));
    toast.success("Cover letter deleted");
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <Mail className="h-8 w-8 text-primary" />
                Cover Letters
              </h1>
              <p className="text-muted-foreground mt-1">AI-powered cover letters personalized to each role</p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="brand-gradient gap-2 border-0">
              <Plus className="h-4 w-4" /> New Cover Letter
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {isCreating && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Card className="shadow-elevated border-primary/20">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> New Cover Letter
                  </CardTitle>
                  <CardDescription>Fill in details and let AI craft a personalized letter from your resume</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Job Title *</Label>
                      <Input value={form.jobTitle} onChange={e => update("jobTitle", e.target.value)} placeholder="Software Engineer" className="bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Company *</Label>
                      <Input value={form.company} onChange={e => update("company", e.target.value)} placeholder="Google" className="bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Hiring Manager</Label>
                      <Input value={form.hiringManager} onChange={e => update("hiringManager", e.target.value)} placeholder="Jane Smith (optional)" className="bg-background" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tone</Label>
                    <div className="flex gap-3 flex-wrap">
                      {toneOptions.map(t => (
                        <button key={t.value} onClick={() => update("tone", t.value)}
                          className={`px-4 py-2 rounded-lg border text-sm transition-colors ${form.tone === t.value ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                          <span className="font-medium">{t.label}</span>
                          <span className="ml-1 text-xs opacity-70">— {t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Job Description <span className="text-xs text-muted-foreground">(optional but recommended)</span></Label>
                    <Textarea value={form.jobDescription} onChange={e => update("jobDescription", e.target.value)} placeholder="Paste the job description for a more targeted letter..." rows={4} className="bg-background resize-none" />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleGenerate} disabled={loading} className="brand-gradient border-0 gap-2">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {loading ? "Generating..." : "AI Generate"}
                    </Button>
                    <Button variant="outline" onClick={handleSaveManual}>Save Blank</Button>
                    <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {letters.length === 0 && !isCreating && (
          <div className="text-center py-16 space-y-3">
            <Mail className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">No cover letters yet.</p>
            <p className="text-sm text-muted-foreground">Click "New Cover Letter" to generate your first AI-powered letter.</p>
          </div>
        )}

        <div className="space-y-4">
          {letters.map((letter, i) => (
            <motion.div key={letter.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-display text-lg">{letter.jobTitle} at {letter.company}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {letter.hiringManager && <span className="text-sm text-muted-foreground">To: {letter.hiringManager}</span>}
                        <Badge variant="outline" className="capitalize text-xs">{letter.tone}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(letter.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => copyLetter(letter)}>
                        {copied === letter.id ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteLetter(letter.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {letter.subject && (
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                      <span className="text-xs uppercase tracking-wide">Subject:</span> {letter.subject}
                    </p>
                  )}
                </CardHeader>
                {letter.body && (
                  <CardContent>
                    <div className="rounded-lg bg-muted/40 border border-border p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {letter.body}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
