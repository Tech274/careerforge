import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ExternalLink, Trash2, ClipboardList, Search, Bell, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useResume } from "@/contexts/ResumeContext";

interface Application {
  id: string;
  job_title: string;
  company: string;
  location: string;
  apply_link: string;
  status: "saved" | "applied" | "interview" | "offer" | "rejected";
  notes: string;
  applied_at: string | null;
  created_at: string;
  follow_up_date: string | null;
  expected_salary: string;
  offered_salary: string;
  salary_data: { low: number; median: number; high: number; negotiationTip: string } | null;
}

const statusColors: Record<string, string> = {
  saved: "bg-secondary text-secondary-foreground",
  applied: "bg-primary/15 text-primary",
  interview: "bg-accent/15 text-accent",
  offer: "bg-accent text-accent-foreground",
  rejected: "bg-destructive/15 text-destructive",
};

const statusLabels: Record<string, string> = {
  saved: "Saved", applied: "Applied", interview: "Interview", offer: "Offer", rejected: "Rejected",
};

function FollowUpBadge({ date }: { date: string | null }) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return <Badge className="text-xs bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400">⚠️ Follow up overdue</Badge>;
  if (diff === 0) return <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-300">⏰ Follow up today</Badge>;
  if (diff <= 3) return <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">🔔 Follow up in {diff}d</Badge>;
  return <Badge variant="outline" className="text-xs">📅 Follow up {d.toLocaleDateString()}</Badge>;
}

export default function Applications() {
  const { resumeData } = useResume();
  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loadingSalary, setLoadingSalary] = useState<string | null>(null);
  const [openSalary, setOpenSalary] = useState<string | null>(null);
  const [form, setForm] = useState({
    job_title: "", company: "", location: "", apply_link: "", notes: "",
    follow_up_date: "", expected_salary: "",
  });

  const addApplication = () => {
    if (!form.job_title.trim() || !form.company.trim()) {
      toast.error("Job title and company are required");
      return;
    }
    const app: Application = {
      id: crypto.randomUUID(),
      job_title: form.job_title, company: form.company, location: form.location,
      apply_link: form.apply_link, notes: form.notes,
      status: "saved", applied_at: null, created_at: new Date().toISOString(),
      follow_up_date: form.follow_up_date || null,
      expected_salary: form.expected_salary, offered_salary: "", salary_data: null,
    };
    setApplications(prev => [app, ...prev]);
    setForm({ job_title: "", company: "", location: "", apply_link: "", notes: "", follow_up_date: "", expected_salary: "" });
    setShowForm(false);
    toast.success("Application tracked!");
  };

  const updateStatus = (id: string, status: Application["status"]) => {
    setApplications(prev =>
      prev.map(a => a.id === id ? { ...a, status, applied_at: status === "applied" ? new Date().toISOString() : a.applied_at } : a)
    );
    toast.success(`Status updated to ${statusLabels[status]}`);
  };

  const removeApplication = (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
    toast.success("Application removed");
  };

  const fetchSalary = async (app: Application) => {
    if (app.salary_data) { setOpenSalary(openSalary === app.id ? null : app.id); return; }
    setLoadingSalary(app.id);
    try {
      const { data, error } = await supabase.functions.invoke("salary-estimate", {
        body: { jobTitle: app.job_title, company: app.company, location: app.location, resumeData },
      });
      if (error) throw error;
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, salary_data: data } : a));
      setOpenSalary(app.id);
      toast.success("Salary range loaded!");
    } catch (e: any) {
      toast.error(e.message || "Failed to load salary data");
    } finally {
      setLoadingSalary(null);
    }
  };

  const updateOfferedSalary = (id: string, val: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, offered_salary: val } : a));
  };

  const filtered = applications.filter(a => {
    const matchesFilter = filter === "all" || a.status === filter || (filter === "followup" && a.follow_up_date);
    const matchesSearch = !search || a.job_title.toLowerCase().includes(search.toLowerCase()) || a.company.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: applications.length,
    saved: applications.filter(a => a.status === "saved").length,
    applied: applications.filter(a => a.status === "applied").length,
    interview: applications.filter(a => a.status === "interview").length,
    offer: applications.filter(a => a.status === "offer").length,
    rejected: applications.filter(a => a.status === "rejected").length,
    followup: applications.filter(a => {
      if (!a.follow_up_date) return false;
      const diff = Math.ceil((new Date(a.follow_up_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diff <= 3;
    }).length,
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <ClipboardList className="h-8 w-8 text-primary" />
                Applications
              </h1>
              <p className="text-muted-foreground mt-1">Track job applications with salary benchmarks and follow-up reminders</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="brand-gradient border-0 gap-2">
              <Plus className="h-4 w-4" /> Track Application
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {([
            ["all", "All"], ["saved", "Saved"], ["applied", "Applied"], ["interview", "Interview"],
            ["offer", "Offer"], ["rejected", "Rejected"], ["followup", "Follow-ups"],
          ] as const).map(([s, label]) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-lg p-3 text-center transition-colors border ${filter === s ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              <p className="font-display font-bold text-xl text-foreground">{counts[s as keyof typeof counts] ?? 0}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </button>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Card className="shadow-card">
              <CardHeader><CardTitle className="font-display text-lg">New Application</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Job Title *</Label>
                    <Input value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} placeholder="Senior Frontend Engineer" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Company *</Label>
                    <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Stripe" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote / San Francisco" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Apply Link</Label>
                    <Input value={form.apply_link} onChange={e => setForm({ ...form, apply_link: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Bell className="h-3 w-3" /> Follow-up Date</Label>
                    <Input type="date" value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Expected Salary</Label>
                    <Input value={form.expected_salary} onChange={e => setForm({ ...form, expected_salary: e.target.value })} placeholder="$120,000" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Referral from John, deadline March 15..." rows={2} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addApplication} className="brand-gradient border-0">Save</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications..." className="pl-10" />
        </div>

        {/* Application List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                {applications.length === 0
                  ? 'No applications tracked yet. Click "Track Application" to get started.'
                  : "No applications match your filter."}
              </CardContent>
            </Card>
          )}
          {filtered.map((app, i) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-foreground">{app.job_title}</h3>
                        <Badge className={statusColors[app.status]}>{statusLabels[app.status]}</Badge>
                        <FollowUpBadge date={app.follow_up_date} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {app.company}{app.location && ` • ${app.location}`}
                      </p>
                      {app.notes && <p className="text-xs text-muted-foreground mt-1">{app.notes}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Added {new Date(app.created_at).toLocaleDateString()}
                        {app.applied_at && ` • Applied ${new Date(app.applied_at).toLocaleDateString()}`}
                      </p>
                      {/* Salary row */}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
                        {app.expected_salary && (
                          <span className="text-muted-foreground">Expected: <strong>{app.expected_salary}</strong></span>
                        )}
                        {app.status === "offer" && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Offered:</span>
                            <Input value={app.offered_salary} onChange={e => updateOfferedSalary(app.id, e.target.value)} placeholder="Enter amount" className="h-5 text-xs w-28 px-1.5" />
                          </div>
                        )}
                        {app.offered_salary && app.status !== "offer" && (
                          <span className="text-muted-foreground">Offered: <strong>{app.offered_salary}</strong></span>
                        )}
                      </div>
                      {/* Salary benchmark */}
                      {app.salary_data && openSalary === app.id && (
                        <div className="mt-2 p-2.5 rounded-lg bg-muted/50 border text-xs">
                          <div className="flex gap-4 mb-1 font-medium">
                            <span>Low: ${app.salary_data.low?.toLocaleString()}</span>
                            <span className="text-primary">Median: ${app.salary_data.median?.toLocaleString()}</span>
                            <span>High: ${app.salary_data.high?.toLocaleString()}</span>
                          </div>
                          {app.salary_data.negotiationTip && (
                            <p className="text-muted-foreground">💡 {app.salary_data.negotiationTip}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select value={app.status} onValueChange={v => updateStatus(app.id, v as Application["status"])}>
                        <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => fetchSalary(app)} title="Salary estimate">
                        {loadingSalary === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <DollarSign className="h-3.5 w-3.5" />}
                      </Button>
                      {app.apply_link && (
                        <Button size="icon" variant="outline" className="h-8 w-8" asChild>
                          <a href={app.apply_link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeApplication(app.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
