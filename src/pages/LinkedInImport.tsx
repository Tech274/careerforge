import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Loader2, CheckCircle, ArrowRight, User, Briefcase, GraduationCap, Star } from "lucide-react";

export default function LinkedInImport() {
  const { updateResumeData } = useResume();
  const [linkedinText, setLinkedinText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<any>(null);
  const [imported, setImported] = useState(false);

  const handleParse = async () => {
    if (!linkedinText.trim() || linkedinText.trim().length < 100) {
      toast.error("Please paste more LinkedIn profile content (at least 100 characters)");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("linkedin-import", {
        body: { linkedinText },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setParsed(data);
      toast.success("Profile parsed successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to parse LinkedIn data");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!parsed) return;
    updateResumeData(parsed);
    setImported(true);
    toast.success("Resume data imported! Head to Resume Builder to review and edit.");
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Linkedin className="h-8 w-8 text-primary" />
            LinkedIn Import
          </h1>
          <p className="text-muted-foreground mt-1">Import your LinkedIn profile to instantly populate your resume</p>
        </motion.div>

        {/* Instructions */}
        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-foreground mb-3">How to copy your LinkedIn profile:</p>
            <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open your LinkedIn profile in a browser</li>
              <li>Select all text on the page (Ctrl+A / Cmd+A)</li>
              <li>Copy (Ctrl+C / Cmd+C)</li>
              <li>Paste it in the box below</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-3">
              💡 Tip: For best results, scroll down to load all sections before copying.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Paste LinkedIn Profile Text</CardTitle>
            <CardDescription>Paste your copied LinkedIn profile text. AI will extract your experience, education, and skills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={linkedinText}
              onChange={e => setLinkedinText(e.target.value)}
              placeholder="Paste your LinkedIn profile text here..."
              rows={10}
              className="resize-none font-mono text-sm"
              disabled={loading || !!parsed}
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleParse} disabled={loading || !!parsed} className="brand-gradient border-0 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Linkedin className="h-4 w-4" />}
                {loading ? "Parsing..." : "Parse Profile"}
              </Button>
              {parsed && (
                <Button variant="outline" onClick={() => { setParsed(null); setLinkedinText(""); setImported(false); }}>
                  Start Over
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {parsed && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="shadow-elevated border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                <CardContent className="p-5 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Profile Parsed Successfully!</p>
                    <p className="text-sm text-muted-foreground">Review the extracted data below, then import it to your resume.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Personal Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    {parsed.personalInfo?.name && <p><span className="text-muted-foreground">Name:</span> {parsed.personalInfo.name}</p>}
                    {parsed.personalInfo?.title && <p><span className="text-muted-foreground">Title:</span> {parsed.personalInfo.title}</p>}
                    {parsed.personalInfo?.location && <p><span className="text-muted-foreground">Location:</span> {parsed.personalInfo.location}</p>}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {(parsed.experience || []).slice(0, 3).map((e: any, i: number) => (
                      <p key={i} className="text-sm"><span className="font-medium">{e.role}</span> <span className="text-muted-foreground">at {e.company}</span></p>
                    ))}
                    {parsed.experience?.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{parsed.experience.length - 3} more</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" /> Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {(parsed.skills || []).slice(0, 12).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                      {parsed.skills?.length > 12 && (
                        <Badge variant="outline" className="text-xs">+{parsed.skills.length - 12}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {!imported ? (
                <Button onClick={handleImport} className="brand-gradient border-0 gap-2 w-full text-base py-6">
                  Import to Resume Builder <ArrowRight className="h-5 w-5" />
                </Button>
              ) : (
                <Card className="shadow-card border-accent/30 bg-accent/5">
                  <CardContent className="p-5 flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-accent shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Imported!</p>
                      <p className="text-sm text-muted-foreground">Your resume data has been updated. <a href="/resumes" className="text-primary underline">Go to Resume Builder →</a></p>
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
