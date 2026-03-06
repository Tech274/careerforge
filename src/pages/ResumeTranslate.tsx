import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Loader2, Download, Check, FileText } from "lucide-react";
import jsPDF from "jspdf";

const LANGUAGES = [
  { code: "Spanish", flag: "🇪🇸", speakers: "500M+" },
  { code: "French", flag: "🇫🇷", speakers: "280M+" },
  { code: "German", flag: "🇩🇪", speakers: "100M+" },
  { code: "Portuguese", flag: "🇧🇷", speakers: "250M+" },
  { code: "Japanese", flag: "🇯🇵", speakers: "130M+" },
  { code: "Mandarin", flag: "🇨🇳", speakers: "1.1B+" },
  { code: "Italian", flag: "🇮🇹", speakers: "85M+" },
  { code: "Dutch", flag: "🇳🇱", speakers: "24M+" },
];

export default function ResumeTranslate() {
  const { resumeData } = useResume();
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState<any>(null);
  const [translatedLang, setTranslatedLang] = useState("");

  const handleTranslate = async () => {
    if (!selectedLang) { toast.error("Select a language first"); return; }
    if (!resumeData?.personalInfo?.name) { toast.error("Please build your resume first before translating"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resume-translate", {
        body: { resumeData, targetLanguage: selectedLang },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTranslated(data.translatedResume);
      setTranslatedLang(data.language);
      toast.success(`Resume translated to ${data.language}!`);
    } catch (e: any) {
      toast.error(e.message || "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!translated) return;
    const doc = new jsPDF();
    const info = translated.personalInfo || {};
    let y = 20;
    const lineHeight = 7;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(info.name || "", margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    if (info.title) { doc.text(info.title, margin, y); y += lineHeight; }

    const contactParts = [info.email, info.phone, info.location].filter(Boolean);
    if (contactParts.length) { doc.setFontSize(10); doc.text(contactParts.join(" | "), margin, y); y += lineHeight; }

    // Summary
    if (translated.summary) {
      y += 5;
      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("Summary", margin, y); y += 6;
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(translated.summary, pageWidth - margin * 2);
      doc.text(lines, margin, y); y += lines.length * lineHeight;
    }

    // Experience
    if (translated.experience?.length) {
      y += 5;
      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("Experience", margin, y); y += 6;
      for (const exp of translated.experience) {
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text(`${exp.role} — ${exp.company}`, margin, y); y += 5;
        if (exp.startDate) { doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.text(`${exp.startDate} – ${exp.current ? "Present" : exp.endDate || ""}`, margin, y); y += 5; }
        if (exp.description) {
          doc.setFontSize(10);
          const desc = doc.splitTextToSize(exp.description, pageWidth - margin * 2);
          doc.text(desc, margin, y); y += desc.length * lineHeight;
        }
        y += 2;
        if (y > 270) { doc.addPage(); y = 20; }
      }
    }

    // Skills
    if (translated.skills?.length) {
      y += 5;
      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("Skills", margin, y); y += 6;
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      const skillsText = translated.skills.join(", ");
      const skillLines = doc.splitTextToSize(skillsText, pageWidth - margin * 2);
      doc.text(skillLines, margin, y);
    }

    doc.save(`resume_${translatedLang}.pdf`);
    toast.success(`Downloaded resume in ${translatedLang}!`);
  };

  const lang = LANGUAGES.find(l => l.code === selectedLang);

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            Multi-Language Resume
          </h1>
          <p className="text-muted-foreground mt-1">Export your resume translated into any language with one click</p>
        </motion.div>

        {/* Language Selector */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Select Language</CardTitle>
            <CardDescription>Your resume will be professionally translated while keeping technical terms in English</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => setSelectedLang(lang.code)}
                  className={`p-4 rounded-xl border text-center transition-all ${selectedLang === lang.code ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/40"}`}>
                  <p className="text-3xl mb-1">{lang.flag}</p>
                  <p className="text-sm font-medium">{lang.code}</p>
                  <p className="text-xs text-muted-foreground">{lang.speakers} speakers</p>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={handleTranslate}
                disabled={loading || !selectedLang}
                className="brand-gradient border-0 gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                {loading ? `Translating to ${selectedLang}...` : selectedLang ? `Translate to ${selectedLang}` : "Select a language"}
              </Button>
              {resumeData.personalInfo?.name && (
                <p className="text-xs text-muted-foreground">
                  Translating: <span className="font-medium text-foreground">{resumeData.personalInfo.name}'s resume</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {translated && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="shadow-elevated border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">Resume translated to {translatedLang}!</p>
                      <p className="text-sm text-muted-foreground">Technical terms and proper nouns kept in English</p>
                    </div>
                  </div>
                  <Button onClick={downloadPDF} className="brand-gradient border-0 gap-2">
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-lg">Translation Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {translated.personalInfo && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Personal Info</p>
                      <p className="font-display font-bold text-lg">{translated.personalInfo.name}</p>
                      <p className="text-muted-foreground">{translated.personalInfo.title}</p>
                    </div>
                  )}
                  {translated.summary && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Summary</p>
                      <p className="text-sm leading-relaxed">{translated.summary}</p>
                    </div>
                  )}
                  {translated.experience?.[0] && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Sample — Latest Role</p>
                      <p className="font-medium">{translated.experience[0].role}</p>
                      <p className="text-sm text-muted-foreground">{translated.experience[0].company}</p>
                      <p className="text-sm mt-1 leading-relaxed">{translated.experience[0].description?.substring(0, 200)}…</p>
                    </div>
                  )}
                  {translated.skills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {translated.skills.slice(0, 15).map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
