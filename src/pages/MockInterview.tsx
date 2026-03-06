import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, CheckCircle, AlertCircle, ChevronRight, RotateCcw, Star, TrendingUp, Lightbulb, Sparkles } from "lucide-react";

const SAMPLE_QUESTIONS = [
  { question: "Tell me about yourself and your background.", category: "behavioral", difficulty: "easy" },
  { question: "Describe a challenging project you worked on and how you overcame obstacles.", category: "behavioral", difficulty: "medium" },
  { question: "Where do you see yourself in 5 years?", category: "culture", difficulty: "easy" },
  { question: "Tell me about a time you had a conflict with a team member. How did you resolve it?", category: "behavioral", difficulty: "medium" },
  { question: "What's your approach to learning new technologies quickly?", category: "technical", difficulty: "medium" },
  { question: "Describe a situation where you had to meet a tight deadline.", category: "situational", difficulty: "medium" },
  { question: "What is your greatest professional achievement?", category: "behavioral", difficulty: "easy" },
  { question: "How do you handle negative feedback?", category: "culture", difficulty: "medium" },
];

const verdictColors: Record<string, string> = {
  "Excellent": "text-green-600 bg-green-50 border-green-200",
  "Good": "text-blue-600 bg-blue-50 border-blue-200",
  "Fair": "text-yellow-600 bg-yellow-50 border-yellow-200",
  "Needs Work": "text-red-600 bg-red-50 border-red-200",
};

const scoreColor = (s: number) => s >= 80 ? "text-green-600" : s >= 60 ? "text-blue-600" : s >= 40 ? "text-yellow-600" : "text-red-600";

export default function MockInterview() {
  const { resumeData } = useResume();
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [showImproved, setShowImproved] = useState(false);

  const question = SAMPLE_QUESTIONS[currentQ];

  const handleSubmit = async () => {
    if (!answer.trim() || answer.trim().length < 20) {
      toast.error("Please write a more detailed answer (at least 20 characters)");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase.functions.invoke("mock-interview", {
        body: { question: question.question, answer, category: question.category, resumeData },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setFeedback(data);
      setSessionScores(prev => [...prev, data.overallScore || 0]);
    } catch (e: any) {
      toast.error(e.message || "Failed to evaluate answer");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    const next = (currentQ + 1) % SAMPLE_QUESTIONS.length;
    setCurrentQ(next);
    setAnswer("");
    setFeedback(null);
    setShowImproved(false);
  };

  const avgScore = sessionScores.length ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length) : 0;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Mic className="h-8 w-8 text-primary" />
            Mock Interview
          </h1>
          <p className="text-muted-foreground mt-1">Practice answering interview questions and get instant AI feedback</p>
        </motion.div>

        {/* Session Stats */}
        {sessionScores.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="shadow-card text-center p-4">
              <p className="text-2xl font-bold font-display text-primary">{sessionScores.length}</p>
              <p className="text-xs text-muted-foreground">Questions Answered</p>
            </Card>
            <Card className="shadow-card text-center p-4">
              <p className={`text-2xl font-bold font-display ${scoreColor(avgScore)}`}>{avgScore}</p>
              <p className="text-xs text-muted-foreground">Average Score</p>
            </Card>
            <Card className="shadow-card text-center p-4">
              <p className="text-2xl font-bold font-display text-foreground">{Math.max(...sessionScores)}</p>
              <p className="text-xs text-muted-foreground">Best Score</p>
            </Card>
          </div>
        )}

        {/* Question Card */}
        <Card className="shadow-elevated border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs">{question.category}</Badge>
                <Badge variant="outline" className={`capitalize text-xs ${question.difficulty === "hard" ? "border-red-300 text-red-600" : question.difficulty === "medium" ? "border-yellow-300 text-yellow-600" : "border-green-300 text-green-600"}`}>{question.difficulty}</Badge>
                <span className="text-xs text-muted-foreground">Q{currentQ + 1} of {SAMPLE_QUESTIONS.length}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={nextQuestion} className="gap-1 text-xs">
                Skip <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            <CardTitle className="font-display text-xl leading-snug mt-2">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1.5">Your Answer</p>
              <Textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here. Be specific and use examples where possible (STAR method: Situation, Task, Action, Result)..."
                rows={6}
                className="resize-none"
                disabled={loading || !!feedback}
              />
              <p className="text-xs text-muted-foreground mt-1">{answer.length} characters</p>
            </div>
            {!feedback && (
              <Button onClick={handleSubmit} disabled={loading || answer.trim().length < 20} className="brand-gradient border-0 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                {loading ? "Evaluating..." : "Get AI Feedback"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Verdict + Score */}
              <Card className="shadow-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                      <div className="flex items-center gap-3">
                        <span className={`text-5xl font-bold font-display ${scoreColor(feedback.overallScore)}`}>{feedback.overallScore}</span>
                        <span className="text-2xl text-muted-foreground">/100</span>
                        <Badge className={`${verdictColors[feedback.verdict] || ""} border ml-2`}>{feedback.verdict}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(feedback.scores || {}).slice(0, 3).map(([dim, score]: [string, any]) => (
                        <div key={dim} className="text-center">
                          <p className={`text-xl font-bold font-display ${scoreColor(score)}`}>{score}</p>
                          <p className="text-xs text-muted-foreground capitalize">{dim}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {Object.entries(feedback.scores || {}).map(([dim, score]: [string, any]) => (
                      <div key={dim} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground capitalize w-24">{dim}</span>
                        <Progress value={score} className="flex-1 h-1.5" />
                        <span className={`text-xs font-medium w-8 ${scoreColor(score)}`}>{score}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(feedback.strengths || []).map((s: string, i: number) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-foreground">{s}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Improvements */}
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(feedback.improvements || []).map((s: string, i: number) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-orange-500 mt-0.5">→</span>
                        <span className="text-foreground">{s}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Improved Answer */}
              {feedback.improvedAnswer && (
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Stronger Answer Example
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowImproved(!showImproved)} className="text-xs">
                        {showImproved ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </CardHeader>
                  {showImproved && (
                    <CardContent>
                      <div className="rounded-lg bg-primary/5 border border-primary/15 p-4 text-sm text-foreground leading-relaxed">
                        {feedback.improvedAnswer}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Next Question */}
              <Button onClick={nextQuestion} className="brand-gradient border-0 gap-2 w-full">
                Next Question <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
