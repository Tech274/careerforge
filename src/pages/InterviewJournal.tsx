import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Trash2, Star, TrendingUp, Calendar, Building, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface JournalEntry {
  id: string;
  company: string;
  role: string;
  date: string;
  round: string;
  outcome: "pending" | "passed" | "rejected" | "offer";
  selfRating: number;
  questionsAsked: string;
  myAnswers: string;
  feedback: string;
  notes: string;
  createdAt: string;
}

const ROUNDS = ["Phone Screen", "Technical", "Behavioral", "System Design", "Case Study", "On-Site", "Final Round", "HR", "Culture Fit"];
const OUTCOMES = [
  { value: "pending", label: "Awaiting Result", color: "bg-secondary text-secondary-foreground" },
  { value: "passed", label: "Passed to Next Round", color: "bg-primary/15 text-primary" },
  { value: "rejected", label: "Rejected", color: "bg-destructive/15 text-destructive" },
  { value: "offer", label: "Offer Received!", color: "bg-accent/15 text-accent" },
];

export default function InterviewJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem("interview-journal") || "[]"); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [openEntry, setOpenEntry] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "", role: "", date: new Date().toISOString().split("T")[0],
    round: "Phone Screen", outcome: "pending" as JournalEntry["outcome"],
    selfRating: 3, questionsAsked: "", myAnswers: "", feedback: "", notes: "",
  });

  const save = (updated: JournalEntry[]) => {
    setEntries(updated);
    localStorage.setItem("interview-journal", JSON.stringify(updated));
  };

  const addEntry = () => {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    const entry: JournalEntry = { id: crypto.randomUUID(), ...form, createdAt: new Date().toISOString() };
    const updated = [entry, ...entries];
    save(updated);
    setShowForm(false);
    setForm({ company: "", role: "", date: new Date().toISOString().split("T")[0], round: "Phone Screen", outcome: "pending", selfRating: 3, questionsAsked: "", myAnswers: "", feedback: "", notes: "" });
    toast.success("Interview logged!");
  };

  const removeEntry = (id: string) => {
    save(entries.filter(e => e.id !== id));
    toast.success("Entry removed");
  };

  const updateOutcome = (id: string, outcome: JournalEntry["outcome"]) => {
    save(entries.map(e => e.id === id ? { ...e, outcome } : e));
  };

  // Stats
  const total = entries.length;
  const passed = entries.filter(e => e.outcome === "passed").length;
  const offers = entries.filter(e => e.outcome === "offer").length;
  const avgRating = total ? (entries.reduce((a, e) => a + e.selfRating, 0) / total).toFixed(1) : "—";

  const outcomeStyle = (o: string) => OUTCOMES.find(x => x.value === o)?.color || "";
  const outcomeLabel = (o: string) => OUTCOMES.find(x => x.value === o)?.label || o;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Interview Journal
              </h1>
              <p className="text-muted-foreground mt-1">Log your real interviews and track patterns over time</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="brand-gradient border-0 gap-2">
              <Plus className="h-4 w-4" /> Log Interview
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Interviews", value: total, icon: Calendar },
            { label: "Rounds Passed", value: passed, icon: TrendingUp },
            { label: "Offers Received", value: offers, icon: Star },
            { label: "Avg Self-Rating", value: `${avgRating}/5`, icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="shadow-card text-center p-4">
              <p className="text-2xl font-bold font-display text-primary">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </Card>
          ))}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Card className="shadow-card border-primary/20">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Log Interview</CardTitle>
                  <CardDescription>Record the details while they're fresh in your memory</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Company *</Label>
                      <Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Stripe" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Role *</Label>
                      <Input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Software Engineer" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Interview Round</Label>
                      <Select value={form.round} onValueChange={v => setForm(p => ({ ...p, round: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROUNDS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Outcome</Label>
                      <Select value={form.outcome} onValueChange={v => setForm(p => ({ ...p, outcome: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {OUTCOMES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Self Rating (1-5)</Label>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} onClick={() => setForm(p => ({ ...p, selfRating: n }))}
                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${form.selfRating >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Questions Asked</Label>
                    <Textarea value={form.questionsAsked} onChange={e => setForm(p => ({ ...p, questionsAsked: e.target.value }))} placeholder="List the questions you were asked..." rows={3} className="resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>How I Answered</Label>
                    <Textarea value={form.myAnswers} onChange={e => setForm(p => ({ ...p, myAnswers: e.target.value }))} placeholder="Notes on how you answered, what went well..." rows={3} className="resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Feedback Received</Label>
                    <Textarea value={form.feedback} onChange={e => setForm(p => ({ ...p, feedback: e.target.value }))} placeholder="Any feedback from the interviewer..." rows={2} className="resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addEntry} className="brand-gradient border-0">Save Entry</Button>
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {entries.length === 0 && !showForm && (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground">No interviews logged yet.</p>
            <p className="text-sm text-muted-foreground">Start logging your interviews to track patterns and improve.</p>
          </div>
        )}

        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="shadow-card">
                <Collapsible open={openEntry === entry.id} onOpenChange={o => setOpenEntry(o ? entry.id : null)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-display font-semibold">{entry.role}</span>
                          <span className="text-muted-foreground">at</span>
                          <span className="font-medium">{entry.company}</span>
                          <Badge className={outcomeStyle(entry.outcome)}>{outcomeLabel(entry.outcome)}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                          <span>{entry.round}</span>
                          <span>•</span>
                          <span>{new Date(entry.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Self: {entry.selfRating}/5</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Select value={entry.outcome} onValueChange={v => updateOutcome(entry.id, v as any)}>
                          <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {OUTCOMES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            {openEntry === entry.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </Button>
                        </CollapsibleTrigger>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeEntry(entry.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="mt-4 space-y-3 border-t pt-4">
                        {entry.questionsAsked && (
                          <div><p className="text-xs font-semibold text-muted-foreground mb-1">Questions Asked</p><p className="text-sm whitespace-pre-wrap">{entry.questionsAsked}</p></div>
                        )}
                        {entry.myAnswers && (
                          <div><p className="text-xs font-semibold text-muted-foreground mb-1">My Answers / Notes</p><p className="text-sm whitespace-pre-wrap">{entry.myAnswers}</p></div>
                        )}
                        {entry.feedback && (
                          <div><p className="text-xs font-semibold text-muted-foreground mb-1">Feedback Received</p><p className="text-sm whitespace-pre-wrap">{entry.feedback}</p></div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
