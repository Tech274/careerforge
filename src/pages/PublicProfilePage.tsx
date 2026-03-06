import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Globe, Loader2, UserX } from "lucide-react";
import { motion } from "framer-motion";

interface PublicProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  title: string | null;
  location: string | null;
  website: string | null;
  skills: string[] | null;
  avatar_url: string | null;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, username, bio, title, location, website, skills, avatar_url")
        .eq("username", username)
        .eq("is_public", true)
        .maybeSingle();
      
      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data as unknown as PublicProfile);
        // Track visit
        await supabase.from("profile_visits").insert({
          profile_user_id: data.id,
        } as any);
        // Send visit notification
        await supabase.functions.invoke("notify-profile-visit", {
          body: { profile_user_id: data.id, visitor_info: "Web visitor" },
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <UserX className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <h2 className="font-display text-2xl font-bold text-foreground">Profile Not Found</h2>
          <p className="text-muted-foreground">This profile doesn't exist or isn't public.</p>
        </div>
      </div>
    );
  }

  const initials = (profile.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-elevated overflow-hidden">
            <div className="brand-gradient h-28" />
            <CardContent className="relative pt-0 -mt-12 px-6 pb-8">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4">
                <h1 className="font-display text-3xl font-bold text-foreground">{profile.name || "Anonymous"}</h1>
                {profile.title && <p className="text-primary font-medium text-lg">{profile.title}</p>}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>
                  )}
                  {profile.website && (
                    <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Globe className="h-3.5 w-3.5" /> {profile.website}
                    </a>
                  )}
                </div>
              </div>

              {profile.bio && (
                <div className="mt-6">
                  <h3 className="font-display font-semibold text-foreground mb-2">About</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-display font-semibold text-foreground mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(s => (
                      <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground">
          Powered by <span className="font-display font-semibold text-primary">CareerForge</span>
        </p>
      </div>
    </div>
  );
}
