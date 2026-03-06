import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, CheckCircle2, Brain, ScanSearch, FileCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PARSE_STEPS = [
  { icon: ScanSearch, label: "Reading document...", duration: 2000 },
  { icon: Brain, label: "AI is analyzing your resume...", duration: 4000 },
  { icon: FileCheck, label: "Extracting experience & skills...", duration: 3000 },
  { icon: Sparkles, label: "Structuring your data...", duration: 2000 },
];

function ParsingProgress() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = PARSE_STEPS.reduce((s, st) => s + st.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 100;
      const pct = Math.min((elapsed / totalDuration) * 90, 90); // cap at 90% until done
      setProgress(pct);

      let cumulative = 0;
      for (let i = 0; i < PARSE_STEPS.length; i++) {
        cumulative += PARSE_STEPS[i].duration;
        if (elapsed < cumulative) {
          setStep(i);
          break;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = PARSE_STEPS[step]?.icon || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="shadow-card border-primary/20 bg-primary/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CurrentIcon className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <Loader2 className="h-10 w-10 text-primary/30 animate-spin absolute inset-0" />
            </div>
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-display font-semibold text-sm text-foreground"
                >
                  {PARSE_STEPS[step]?.label}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-muted-foreground">Step {step + 1} of {PARSE_STEPS.length}</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {PARSE_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-1 text-[10px] ${i <= step ? "text-primary font-medium" : "text-muted-foreground/50"}`}>
                {i < step ? <CheckCircle2 className="h-3 w-3" /> : i === step ? <Loader2 className="h-3 w-3 animate-spin" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />}
                <span className="hidden sm:inline">{s.label.replace("...", "").split(" ").slice(0, 2).join(" ")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ResumeImport() {
  const { updateResumeData } = useResume();
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ base64: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setFileLoading(true);
    setUploadedFile(null);

    try {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        setResumeText(text);
        toast.success("File loaded! Click 'Parse Resume' to extract data.");
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const base64 = await fileToBase64(file);
        setUploadedFile({ base64, type: "pdf" });
        setResumeText("");
        toast.success(`PDF "${file.name}" ready! Click 'Parse Resume' to extract data.`);
      } else if (
        file.name.endsWith(".docx") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const base64 = await fileToBase64(file);
        setUploadedFile({ base64, type: "docx" });
        setResumeText("");
        toast.success(`DOCX "${file.name}" ready! Click 'Parse Resume' to extract data.`);
      } else {
        toast.error("Unsupported file type. Please use PDF, DOCX, or TXT.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to read file");
    } finally {
      setFileLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleParse = async () => {
    if (!resumeText.trim() && !uploadedFile) {
      toast.error("Please upload a file or paste your resume text first");
      return;
    }
    setLoading(true);
    try {
      const requestBody: any = {};
      if (uploadedFile) {
        requestBody.fileBase64 = uploadedFile.base64;
        requestBody.fileType = uploadedFile.type;
      } else {
        requestBody.resumeText = resumeText.trim();
      }

      const { data, error } = await supabase.functions.invoke("parse-resume", {
        body: requestBody,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const rd = data.resumeData;
      if (!rd) throw new Error("No data extracted");

      if (rd.experience) {
        rd.experience = rd.experience.map((exp: any) => ({ ...exp, id: crypto.randomUUID?.() || Math.random().toString(36).slice(2) }));
      }
      if (rd.education) {
        rd.education = rd.education.map((edu: any) => ({ ...edu, id: crypto.randomUUID?.() || Math.random().toString(36).slice(2) }));
      }
      if (rd.certifications) {
        rd.certifications = rd.certifications.map((c: any) => ({ ...c, id: crypto.randomUUID?.() || Math.random().toString(36).slice(2) }));
      }
      if (rd.projects) {
        rd.projects = rd.projects.map((p: any) => ({ ...p, id: crypto.randomUUID?.() || Math.random().toString(36).slice(2) }));
      }

      updateResumeData(rd);
      setParsed(true);
      toast.success("Resume parsed successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to parse resume");
    } finally {
      setLoading(false);
    }
  };

  const hasInput = resumeText.trim() || uploadedFile;

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Upload className="h-8 w-8 text-primary" />
            Import Resume
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload a PDF, DOCX, or TXT file — or paste your resume text — and our AI will extract structured data into the builder
          </p>
        </motion.div>

        {loading ? (
          <ParsingProgress />
        ) : (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Upload or Paste Resume</CardTitle>
              <CardDescription>
                Upload a PDF, DOCX, or TXT file. The AI will extract your personal info, experience, education, and skills.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragging
                    ? "border-primary bg-primary/5"
                    : uploadedFile
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {fileLoading ? (
                  <Loader2 className="h-10 w-10 text-primary mx-auto mb-3 animate-spin" />
                ) : uploadedFile ? (
                  <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-3" />
                ) : (
                  <FileText className={`h-10 w-10 mx-auto mb-3 ${dragging ? "text-primary" : "text-muted-foreground/40"}`} />
                )}
                <p className="text-sm text-muted-foreground font-medium">
                  {fileLoading
                    ? "Reading file..."
                    : uploadedFile
                    ? `${uploadedFile.type.toUpperCase()} file ready — click Parse Resume below`
                    : dragging
                    ? "Drop your file here"
                    : "Drag & drop or click to upload PDF, DOCX, or TXT"}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">Or paste your resume text below</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {!uploadedFile && (
                <Textarea
                  placeholder="Paste your full resume text here..."
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              )}

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleParse}
                  disabled={loading || !hasInput}
                  className="brand-gradient border-0 gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Parse Resume
                </Button>
                {uploadedFile && (
                  <Button variant="ghost" size="sm" onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                    Clear file
                  </Button>
                )}
                {resumeText.trim() && !uploadedFile && (
                  <p className="text-xs text-muted-foreground">
                    {resumeText.trim().split(/\s+/).length} words detected
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {parsed && !loading && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="shadow-card border-accent/30">
              <CardContent className="p-6 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
                <h3 className="font-display text-lg font-bold text-foreground">Resume Imported!</h3>
                <p className="text-sm text-muted-foreground">
                  Your resume data has been loaded into the builder. Review and edit as needed.
                </p>
                <Button onClick={() => navigate("/resumes")} className="brand-gradient border-0">
                  Go to Resume Builder
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
