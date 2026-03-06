import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ResumeProvider } from "@/contexts/ResumeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import CoverLetters from "./pages/CoverLetters";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import LinkedInOptimizer from "./pages/LinkedInOptimizer";
import Applications from "./pages/Applications";
import ATSChecker from "./pages/ATSChecker";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResumeScoreDashboard from "./pages/ResumeScoreDashboard";
import ResumeTailoring from "./pages/ResumeTailoring";
import ResumeComparison from "./pages/ResumeComparison";
import InterviewPrep from "./pages/InterviewPrep";
import ResumeImport from "./pages/ResumeImport";
import PublicProfilePage from "./pages/PublicProfilePage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
// New Feature Pages
import MockInterview from "./pages/MockInterview";
import CareerRoadmap from "./pages/CareerRoadmap";
import OutreachEmail from "./pages/OutreachEmail";
import OfferAnalyzer from "./pages/OfferAnalyzer";
import LinkedInImport from "./pages/LinkedInImport";
import JobMatchScore from "./pages/JobMatchScore";
import QRBusinessCard from "./pages/QRBusinessCard";
import InterviewJournal from "./pages/InterviewJournal";
import ResumeTranslate from "./pages/ResumeTranslate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <ResumeProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/p/:username" element={<PublicProfilePage />} />

              {/* Protected Routes — Resume */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/resumes" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
              <Route path="/resume-import" element={<ProtectedRoute><ResumeImport /></ProtectedRoute>} />
              <Route path="/resume-score" element={<ProtectedRoute><ResumeScoreDashboard /></ProtectedRoute>} />
              <Route path="/ats-checker" element={<ProtectedRoute><ATSChecker /></ProtectedRoute>} />
              <Route path="/resume-tailoring" element={<ProtectedRoute><ResumeTailoring /></ProtectedRoute>} />
              <Route path="/resume-comparison" element={<ProtectedRoute><ResumeComparison /></ProtectedRoute>} />
              <Route path="/resume-translate" element={<ProtectedRoute><ResumeTranslate /></ProtectedRoute>} />

              {/* Protected Routes — Career Tools */}
              <Route path="/cover-letters" element={<ProtectedRoute><CoverLetters /></ProtectedRoute>} />
              <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
              <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
              <Route path="/interview-journal" element={<ProtectedRoute><InterviewJournal /></ProtectedRoute>} />
              <Route path="/linkedin" element={<ProtectedRoute><LinkedInOptimizer /></ProtectedRoute>} />
              <Route path="/linkedin-import" element={<ProtectedRoute><LinkedInImport /></ProtectedRoute>} />
              <Route path="/career-roadmap" element={<ProtectedRoute><CareerRoadmap /></ProtectedRoute>} />
              <Route path="/outreach-email" element={<ProtectedRoute><OutreachEmail /></ProtectedRoute>} />
              <Route path="/offer-analyzer" element={<ProtectedRoute><OfferAnalyzer /></ProtectedRoute>} />
              <Route path="/job-match" element={<ProtectedRoute><JobMatchScore /></ProtectedRoute>} />

              {/* Protected Routes — Jobs & Applications */}
              <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />

              {/* Protected Routes — Analytics & Profile */}
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
              <Route path="/qr-card" element={<ProtectedRoute><QRBusinessCard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ResumeProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
