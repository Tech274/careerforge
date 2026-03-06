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
import { MessageSquare, Loader2, ChevronDown, ChevronUp, Lightbulb, Target, Brain, Users } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  tip: string;
  sampleAnswer: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  behavioral: <Users className="h-4 w-4" />,
  technical: <Brain className="h-4 w-4" />,
  situational: <Target className="h-4 w-4" />,
  culture: <Lightbulb className="h-4 w-4" />,
};

const difficultyColors: Record<string, string> = {
  easy: "bg-accent/20 text-accent border-accent/30",
  medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  hard: "bg-destructive/20 text-destructive border-destructive/30",
};

function QuestionCard({ q, index }: { q: InterviewQuestion; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="shadow-card">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 mt-0.5">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm leading-relaxed">{q.question}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs capitalize gap-1">
                    {categoryIcons[q.category] || categoryIcons.behavioral}
                    {q.category}
                  </Badge>
                  <Badge variant="outline" className={`text-xs capitalize ${difficultyColors[q.difficulty] || ""}`}>
                    {q.difficulty}
                  </Badge>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="mt-4 ml-11 space-y-3">
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                  <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" /> Tip
                  </p>
                  <p className="text-sm text-muted-foreground">{q.tip}</p>
                </div>
                <div className="rounded-lg bg-muted/50 border border-border p-3">
                  <p className="text-xs font-semibold text-foreground mb-1">Sample Answer Outline</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.sampleAnswer}</p>
                </div>
              </div>
            </CollapsibleContent>
          </CardContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
}

export default function InterviewPrep() {
  const { resumeData } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("interview-prep", {
        body: { resumeData, jobDescription: jobDescription.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setQuestions(data.questions || []);
      if ((data.questions || []).length === 0) toast.error("No questions generated");
      else toast.success(`Generated ${data.questions.length} practice questions!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(questions.map(q => q.category)))];
  const filtered = filter === "all" ? questions : questions.filter(q => q.category === filter);

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            Interview Prep
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-generated practice questions based on your resume and target job
          </p>
        </motion.div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Generate Questions</CardTitle>
            <CardDescription>
              Questions are tailored to your current resume. Optionally add a job description for more targeted prep.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Job Description (optional)</p>
              <Textarea
                placeholder="Paste the job description here for targeted interview questions..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="brand-gradient border-0 gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {loading ? "Generating..." : "Generate Practice Questions"}
              </Button>
              {resumeData.personalInfo?.name && (
                <p className="text-xs text-muted-foreground">
                  Using resume: <span className="font-medium text-foreground">{resumeData.personalInfo.name}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "outline"}
                  size="sm"
                  className={`capitalize text-xs ${filter === cat ? "brand-gradient border-0" : ""}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat === "all" ? `All (${questions.length})` : `${cat} (${questions.filter(q => q.category === cat).length})`}
                </Button>
              ))}
            </div>

            <AnimatePresence>
              <div className="space-y-3">
                {filtered.map((q, i) => (
                  <QuestionCard key={i} q={q} index={i} />
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>
    </AppLayout>
  );
}
