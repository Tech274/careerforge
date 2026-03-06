import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Sparkles, Briefcase, User, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: FileText, title: "Smart Resume Builder", description: "Create professional resumes with real-time preview and 4 stunning templates" },
  { icon: Sparkles, title: "Cover Letter Generator", description: "AI-powered cover letters tailored to each job application" },
  { icon: Briefcase, title: "Job Search", description: "Find and track job opportunities all in one place" },
  { icon: User, title: "Public Profile", description: "Share your professional profile with a custom URL" },
];

const benefits = [
  "Real-time resume preview",
  "4 professional templates",
  "Resume strength scoring",
  "PDF export",
  "Cover letter builder",
  "Job search & tracking",
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <h1 className="font-display text-xl font-bold"><span className="text-gradient">Resume</span>Forge</h1>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>Login</Button>
          <Button onClick={() => navigate("/dashboard")} className="brand-gradient border-0">Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-20 md:py-32 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Build your career with confidence
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight text-foreground">
            Create Resumes That <span className="text-gradient">Get You Hired</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
            Professional resume builder with real-time preview, stunning templates, cover letter generator, and job search — everything you need to land your dream job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button size="lg" onClick={() => navigate("/resumes")} className="brand-gradient border-0 text-base px-8 py-6 shadow-hero gap-2">
              Build Your Resume <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")} className="text-base px-8 py-6">
              View Dashboard
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 bg-card">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl border bg-background p-6 hover:shadow-elevated transition-shadow"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 inline-block mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-8">Why ResumeForge?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {benefits.map(b => (
              <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
          <Button size="lg" onClick={() => navigate("/resumes")} className="brand-gradient border-0 mt-10 px-8 py-6 shadow-hero gap-2">
            Start Building Now <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 ResumeForge. Built to help you land your dream job.</p>
      </footer>
    </div>
  );
}
