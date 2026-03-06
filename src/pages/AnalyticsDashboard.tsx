import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useResume } from "@/contexts/ResumeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Loader2, Sparkles, Eye, TrendingUp, AlertTriangle,
  CheckCircle, Target, Briefcase, ArrowRight, Clock, Share2, Copy, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface SkillGap {
  skill: string;
  importance: "high" | "medium" | "low";
  recommendation: string;
}

interface StrongSkill {
  skill: string;
  matchCount: number;
}

interface RoleAlignment {
  role: string;
  matchPercent: number;
}

interface AnalyticsResult {
  skillGaps: SkillGap[];
  strongSkills: StrongSkill[];
  industryInsights: string;
  overallReadiness: number;
  topRecommendations: string[];
  roleAlignment: RoleAlignment[];
}

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: string;
  created_at: string;
  location: string | null;
}

interface ProfileVisit {
  id: string;
  visited_at: string;
  visitor_ip: string | null;
}

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(210, 70%, 55%)", "hsl(45, 85%, 55%)", "hsl(340, 65%, 55%)"];

const importanceBadge = (imp: string) => {
  if (imp === "high") return "destructive" as const;
  if (imp === "medium") return "secondary" as const;
  return "outline" as const;
};

export default function AnalyticsDashboard() {
  const { resumeData } = useResume();
  const { user } = useAuth();
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profileVisits, setProfileVisits] = useState<ProfileVisit[]>([]);
  const [profile, setProfile] = useState<{ username?: string; is_public?: boolean } | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [appsRes, visitsRes, profileRes] = await Promise.all([
        supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profile_visits").select("*").eq("profile_user_id", user.id).order("visited_at", { ascending: false }),
        supabase.from("profiles").select("username, is_public").eq("id", user.id).single(),
      ]);
      if (appsRes.data) setApplications(appsRes.data);
      if (visitsRes.data) setProfileVisits(visitsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
    };
    fetchData();
  }, [user]);

  const analyze = async () => {
    if (applications.length === 0) {
      toast.error("Add some job applications first to analyze gaps");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-analytics", {
        body: { resumeData, applications: applications.map(a => ({ job_title: a.job_title, company: a.company, status: a.status })) },
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

  // Compute stats
  const statusCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusPieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const recentVisits = profileVisits.slice(0, 5);
  const visitsByDay = profileVisits.reduce((acc, v) => {
    const day = new Date(v.visited_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const visitChartData = Object.entries(visitsByDay).reverse().slice(-14).map(([date, visits]) => ({ date, visits }));

  const profileUrl = profile?.username ? `${window.location.origin}/p/${profile.username}` : null;
  const copyProfileLink = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied!");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Your Career Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your profile visitors, application stats, and identify where you lack
            </p>
          </div>
          {profileUrl && (
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm text-muted-foreground font-medium">Share your Profile:</p>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={copyProfileLink} title="Copy link">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => window.open(profileUrl, "_blank")} title="Open profile">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Eye} label="Total Profile Visits" value={profileVisits.length} sub={`${recentVisits.length} recent`} color="text-primary" />
          <StatCard icon={Briefcase} label="Total Applications" value={applications.length} sub={`${statusCounts["applied"] || 0} applied`} color="text-accent" />
          <StatCard icon={TrendingUp} label="Interview Rate" value={`${applications.length ? Math.round(((statusCounts["interview"] || 0) / applications.length) * 100) : 0}%`} sub="of applications" color="text-amber-500" />
          <StatCard icon={CheckCircle} label="Offers" value={statusCounts["offer"] || 0} sub={`${statusCounts["rejected"] || 0} rejected`} color="text-accent" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visit Chart */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Profile Visits Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visitChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={visitChartData}>
                    <defs>
                      <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="visits" stroke="hsl(var(--primary))" fill="url(#visitGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No profile visits yet. Share your public profile to start tracking.</p>
              )}
            </CardContent>
          </Card>

          {/* Application Status Pie */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent" /> Application Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusPieData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                        {statusPieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1.5">
                    {statusPieData.map((entry, i) => (
                      <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-muted-foreground capitalize">{entry.name}</span>
                        <span className="font-semibold text-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No applications tracked yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentVisits.length > 0 ? (
              <ul className="space-y-2">
                {recentVisits.map((v) => (
                  <li key={v.id} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-secondary/50">
                    <Eye className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="text-muted-foreground">
                        Someone visited your Profile
                        {v.visitor_ip && <> from <span className="font-semibold text-foreground">{v.visitor_ip}</span></>}
                      </span>
                      <p className="text-xs text-muted-foreground">{new Date(v.visited_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* AI Gap Analysis */}
        <Card className="shadow-card border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                AI Skill Gap Analysis
              </CardTitle>
              <Button onClick={analyze} disabled={loading} className="brand-gradient border-0 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Analyzing..." : "Analyze Gaps"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Compare your resume against your job applications to identify where you lack</p>
          </CardHeader>
          {!result && !loading && (
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Click "Analyze Gaps" to get AI-powered insights on your career readiness</p>
              </div>
            </CardContent>
          )}
        </Card>

        {result && (
          <div className="space-y-6">
            {/* Readiness Score */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className={`shadow-elevated bg-gradient-to-br ${result.overallReadiness >= 70 ? "from-accent/15 to-accent/5" : result.overallReadiness >= 45 ? "from-amber-500/15 to-amber-500/5" : "from-destructive/15 to-destructive/5"}`}>
                <CardContent className="p-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Career Readiness Score</p>
                    <p className={`font-display text-6xl font-bold ${result.overallReadiness >= 70 ? "text-accent" : result.overallReadiness >= 45 ? "text-amber-500" : "text-destructive"}`}>
                      {result.overallReadiness}%
                    </p>
                  </div>
                  <div className="w-48">
                    <Progress value={result.overallReadiness} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Gaps */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" /> Skills You Lack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.skillGaps?.map((gap, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-lg bg-secondary/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground">{gap.skill}</span>
                        <Badge variant={importanceBadge(gap.importance)} className="text-xs capitalize">{gap.importance}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Strong Skills */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" /> Your Strong Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.strongSkills?.map((s, i) => (
                      <Badge key={i} className="bg-accent/10 text-accent border-accent/20">
                        {s.skill} ({s.matchCount} matches)
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Alignment */}
            {result.roleAlignment?.length > 0 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> Role Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.roleAlignment.map((r, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-sm text-foreground w-40 truncate">{r.role}</span>
                      <Progress value={r.matchPercent} className="h-2 flex-1" />
                      <span className={`text-sm font-bold ${r.matchPercent >= 70 ? "text-accent" : r.matchPercent >= 40 ? "text-amber-500" : "text-destructive"}`}>{r.matchPercent}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Top Recommendations */}
            {result.topRecommendations?.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Top Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.topRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground p-2 rounded-lg bg-secondary/50">
                        <span className="font-display font-bold text-primary mt-0.5">{i + 1}</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Industry Insights */}
            {result.industryInsights && (
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-primary" /> Industry Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.industryInsights}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
