import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapPin, Globe, Eye, Save, Loader2, ExternalLink, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  title: string;
  location: string;
  website: string;
  skills: string[];
  is_public: boolean;
  avatar_url: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: "", username: "", bio: "", title: "", location: "", website: "", skills: [], is_public: false, avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile({
          name: (data as any).name || "",
          username: (data as any).username || "",
          bio: (data as any).bio || "",
          title: (data as any).title || "",
          location: (data as any).location || "",
          website: (data as any).website || "",
          skills: (data as any).skills || [],
          is_public: (data as any).is_public || false,
          avatar_url: (data as any).avatar_url || "",
        });
      }
      // Get visit count
      const { count } = await supabase
        .from("profile_visits")
        .select("*", { count: "exact", head: true })
        .eq("profile_user_id", user.id);
      setVisitCount(count || 0);
      setLoading(false);
    };
    load();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          username: profile.username,
          bio: profile.bio,
          title: profile.title,
          location: profile.location,
          website: profile.website,
          skills: profile.skills,
          is_public: profile.is_public,
        } as any)
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile saved!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => {
    setProfile(p => ({ ...p, skills: p.skills.filter(sk => sk !== s) }));
  };

  const publicUrl = `${window.location.origin}/p/${profile.username}`;
  const initials = (profile.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your public professional profile</p>
            </div>
            <Button onClick={save} disabled={saving} className="brand-gradient border-0 gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="flex gap-4">
          <Card className="shadow-card flex-1">
            <CardContent className="p-4 flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <div>
                <p className="font-display font-bold text-xl text-foreground">{visitCount}</p>
                <p className="text-xs text-muted-foreground">Profile Views</p>
              </div>
            </CardContent>
          </Card>
          {profile.is_public && (
            <Card className="shadow-card flex-1">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Public URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-primary truncate flex-1">{publicUrl}</code>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Copied!"); }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="h-6 w-6"><ExternalLink className="h-3 w-3" /></Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Profile Form */}
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-4 mb-2">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground font-display text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-muted-foreground">Public Profile</Label>
                  <Switch checked={profile.is_public} onCheckedChange={(v) => setProfile(p => ({ ...p, is_public: v }))} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile.is_public ? "Your profile is visible at the public URL" : "Your profile is private"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Username</Label>
                <Input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} placeholder="johndoe" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Professional Title</Label>
                <Input value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} placeholder="Software Engineer" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Location</Label>
                <Input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} placeholder="New York, NY" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs text-muted-foreground">Website</Label>
                <Input value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bio</Label>
              <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell the world about yourself..." rows={4} className="resize-none" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Skills</Label>
              <div className="flex gap-2">
                <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill..." onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                <Button onClick={addSkill} variant="outline" size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map(s => (
                  <Badge key={s} variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => removeSkill(s)}>
                    {s} ×
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
