import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Mail, Eye, Briefcase, Plus, TrendingUp, ClipboardList, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useResume } from "@/contexts/ResumeContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface DashboardStats {
  resumeCount: number;
  applicationCount: number;
  profileViews: number;
  savedJobs: number;
  avgStrength: number;
  recentApplications: { company: string; job_title: string; status: string; applied_at: string | null }[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedResumes, strengthScore } = useResume();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const [appResult, visitResult, appListResult] = await Promise.all([
          supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("profile_visits").select("*", { count: "exact", head: true }).eq("profile_user_id", user.id),
          supabase.from("applications").select("company, job_title, status, applied_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        ]);

        const savedCount = await supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "saved");

        setStats({
          resumeCount: savedResumes.length,
          applicationCount: appResult.count || 0,
          profileViews: visitResult.count || 0,
          savedJobs: savedCount.count || 0,
          avgStrength: strengthScore,
          recentApplications: (appListResult.data || []) as any[],
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, savedResumes.length, strengthScore]);

  const statItems = [
    { label: "Resumes", value: stats?.resumeCount ?? 0, icon: FileText, color: "text-primary" },
    { label: "Applications", value: stats?.applicationCount ?? 0, icon: ClipboardList, color: "text-accent" },
    { label: "Profile Views", value: stats?.profileViews ?? 0, icon: Eye, color: "text-amber-500" },
    { label: "Jobs Saved", value: stats?.savedJobs ?? 0, icon: Briefcase, color: "text-primary" },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case "applied": return "bg-blue-500/10 text-blue-600";
      case "interview": return "bg-accent/10 text-accent";
      case "rejected": return "bg-destructive/10 text-destructive";
      case "offer": return "bg-amber-500/10 text-amber-600";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Here's your career overview.</p>
            </div>
            <Button onClick={() => navigate("/resumes")} className="brand-gradient gap-2 border-0">
              <Plus className="h-4 w-4" /> New Resume
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resume Strength */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Resume Strength
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Score</span>
                <span className="font-display font-bold text-2xl text-accent">{strengthScore}</span>
              </div>
              <Progress value={strengthScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {strengthScore >= 80 ? "Excellent! Your resume is strong." :
                 strengthScore >= 50 ? "Good start. Add more details to improve." :
                 "Add experience, skills, and a summary to boost your score."}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/resumes")}>
                <FileText className="h-4 w-4" /> Create New Resume
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/resume-score")}>
                <TrendingUp className="h-4 w-4" /> Analyze Resume Score
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/jobs")}>
                <Briefcase className="h-4 w-4" /> Search Jobs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : stats?.recentApplications && stats.recentApplications.length > 0 ? (
              <div className="space-y-3">
                {stats.recentApplications.map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-foreground">{app.job_title}</p>
                      <p className="text-xs text-muted-foreground">{app.company}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${statusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No applications yet.{" "}
                <button onClick={() => navigate("/applications")} className="text-primary hover:underline">
                  Track your first application
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
