import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Bookmark,
  ExternalLink,
  Briefcase,
  Loader2,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useResume } from "@/contexts/ResumeContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type PortalId =
  | "linkedin"
  | "naukri"
  | "glassdoor"
  | "indeed"
  | "ambitionbox"
  | "iamjobs"
  | "iitjobs"
  | "darwinbox"
  | "bullhorn";

interface GeneratedJob {
  id: string;
  portal: PortalId;
  title: string;
  company: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Remote" | "Internship";
  experienceLevel: "0-2 years" | "2-5 years" | "5+ years";
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: "INR" | "USD";
  salaryDisplay: string;
  description: string;
  skills: string[];
  postedDaysAgo: number;
  postedDisplay: string;
  matchScore: number | null;
  applyUrl: string;
  isHot: boolean;
}

interface JobSearchResponse {
  jobs: GeneratedJob[];
  totalCount: number;
  page: number;
  pageSize: number;
  query: string;
}

interface PortalConfig {
  id: PortalId | "all";
  label: string;
  color: string;
  textColor: string;
  dotColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PORTAL_CONFIGS: PortalConfig[] = [
  { id: "all",         label: "All Portals",  color: "bg-foreground/10",                   textColor: "text-foreground",                  dotColor: "bg-foreground/60"  },
  { id: "linkedin",    label: "LinkedIn",     color: "bg-blue-100 dark:bg-blue-950/40",     textColor: "text-blue-700 dark:text-blue-400",    dotColor: "bg-blue-500"    },
  { id: "naukri",      label: "Naukri",       color: "bg-orange-100 dark:bg-orange-950/40", textColor: "text-orange-700 dark:text-orange-400", dotColor: "bg-orange-500"  },
  { id: "glassdoor",   label: "Glassdoor",    color: "bg-green-100 dark:bg-green-950/40",   textColor: "text-green-700 dark:text-green-400",   dotColor: "bg-green-500"   },
  { id: "indeed",      label: "Indeed",       color: "bg-purple-100 dark:bg-purple-950/40", textColor: "text-purple-700 dark:text-purple-400", dotColor: "bg-purple-500"  },
  { id: "ambitionbox", label: "AmbitionBox",  color: "bg-pink-100 dark:bg-pink-950/40",     textColor: "text-pink-700 dark:text-pink-400",     dotColor: "bg-pink-500"    },
  { id: "iamjobs",     label: "IAM Jobs",     color: "bg-cyan-100 dark:bg-cyan-950/40",     textColor: "text-cyan-700 dark:text-cyan-400",     dotColor: "bg-cyan-500"    },
  { id: "iitjobs",     label: "IIT Jobs",     color: "bg-indigo-100 dark:bg-indigo-950/40", textColor: "text-indigo-700 dark:text-indigo-400", dotColor: "bg-indigo-500"  },
  { id: "darwinbox",   label: "DarwinBox",    color: "bg-teal-100 dark:bg-teal-950/40",     textColor: "text-teal-700 dark:text-teal-400",     dotColor: "bg-teal-500"    },
  { id: "bullhorn",    label: "Bullhorn",     color: "bg-rose-100 dark:bg-rose-950/40",     textColor: "text-rose-700 dark:text-rose-400",     dotColor: "bg-rose-500"    },
];

const ALL_PORTAL_IDS: PortalId[] = [
  "linkedin", "naukri", "glassdoor", "indeed",
  "ambitionbox", "iamjobs", "iitjobs", "darwinbox", "bullhorn",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-64 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-4/5 rounded" />
            <div className="flex gap-2 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-5 w-16 rounded-full" />
              ))}
            </div>
          </div>
          <div className="ml-2 space-y-2 shrink-0">
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="h-8 w-28 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JobCard({
  job,
  isSaved,
  onSave,
  portalConfig,
  index,
}: {
  job: GeneratedJob;
  isSaved: boolean;
  onSave: (job: GeneratedJob) => void;
  portalConfig: PortalConfig;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
    >
      <Card className="shadow-card hover:shadow-elevated transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Left: content */}
            <div className="flex-1 min-w-0">
              {/* Row 1: portal badge + hot + match */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${portalConfig.color} ${portalConfig.textColor}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${portalConfig.dotColor}`} />
                  {portalConfig.label}
                </span>

                {job.isHot && (
                  <Badge className="text-xs bg-red-100 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 border">
                    🔥 Hot
                  </Badge>
                )}

                {job.matchScore !== null && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      job.matchScore >= 75
                        ? "text-green-600 border-green-300 dark:text-green-400 dark:border-green-700"
                        : job.matchScore >= 50
                        ? "text-yellow-600 border-yellow-300 dark:text-yellow-400 dark:border-yellow-700"
                        : "text-muted-foreground"
                    }`}
                  >
                    {job.matchScore}% match
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="font-display font-semibold text-base text-foreground leading-snug">
                {job.title}
              </h3>

              {/* Company + location + salary */}
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-sm">
                <span className="text-primary font-medium">{job.company}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {job.location}
                </span>
                {job.salaryDisplay && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5 shrink-0" />
                    {job.salaryDisplay}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {job.description}
              </p>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {job.postedDisplay}
                </span>
                <span>{job.jobType}</span>
                <span>{job.experienceLevel}</span>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                size="sm"
                variant={isSaved ? "default" : "outline"}
                onClick={() => onSave(job)}
                disabled={isSaved}
                className="gap-1.5 text-xs h-8 px-3"
              >
                <Bookmark className="h-3.5 w-3.5" />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs h-8 px-3"
                asChild
              >
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Apply
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ hasSearched }: { hasSearched: boolean }) {
  if (!hasSearched) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-16 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">
            Find your next opportunity
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Search by role and location, or click Search to discover jobs matched
            to your resume skills automatically.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-dashed">
      <CardContent className="p-12 text-center">
        <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="font-display font-medium text-foreground">No jobs found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try broadening your search or selecting different portals.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Jobs() {
  const { resumeData } = useResume();
  const userSkills = resumeData?.skills ?? [];
  const userTitle = resumeData?.personalInfo?.title ?? "";
  const userLocation = resumeData?.personalInfo?.location ?? "";

  // Search inputs
  const [query, setQuery] = useState("");
  const [locationInput, setLocationInput] = useState("");

  // Filters
  const [selectedPortal, setSelectedPortal] = useState<PortalId | "all">("all");
  const [jobType, setJobType] = useState("all");
  const [experienceLevel, setExpLevel] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  // Results
  const [jobs, setJobs] = useState<GeneratedJob[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Pre-seed location from resume on mount
  useEffect(() => {
    if (userLocation && !locationInput) {
      setLocationInput(userLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  const handleSearch = async (page = 1, appendMode = false) => {
    if (page === 1) {
      setLoading(true);
      setError(null);
      if (!appendMode) setJobs([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const portals =
        selectedPortal === "all" ? ALL_PORTAL_IDS : [selectedPortal];

      const { data, error: fnError } = await supabase.functions.invoke(
        "job-search",
        {
          body: {
            query: query.trim() || userTitle || "",
            location: locationInput.trim() || userLocation || "",
            portals,
            jobType,
            experienceLevel,
            sortBy,
            page,
            pageSize: 10,
            userSkills,
            userTitle,
            userLocation,
          },
        }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const response = data as JobSearchResponse;
      const newJobs = Array.isArray(response.jobs) ? response.jobs : [];

      if (appendMode) {
        setJobs((prev) => [...prev, ...newJobs]);
      } else {
        setJobs(newJobs);
      }

      setTotalCount(response.totalCount || newJobs.length);
      setCurrentPage(page);
      setHasMore(
        newJobs.length === 10 && page * 10 < (response.totalCount || 0)
      );
      setHasSearched(true);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to fetch jobs. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => handleSearch(currentPage + 1, true);

  const saveToApplications = (job: GeneratedJob) => {
    const portalLabel =
      PORTAL_CONFIGS.find((p) => p.id === job.portal)?.label ?? job.portal;

    const existing: object[] = (() => {
      try {
        return JSON.parse(
          localStorage.getItem("career_forge_applications") || "[]"
        );
      } catch {
        return [];
      }
    })();

    const entry = {
      id: crypto.randomUUID(),
      job_title: job.title,
      company: job.company,
      location: job.location,
      apply_link: job.applyUrl,
      status: "saved",
      notes: `Source: ${portalLabel} | Skills: ${job.skills.join(", ")}`,
      applied_at: null,
      created_at: new Date().toISOString(),
      follow_up_date: null,
      expected_salary: job.salaryDisplay,
      offered_salary: "",
      salary_data: null,
    };

    localStorage.setItem(
      "career_forge_applications",
      JSON.stringify([entry, ...existing])
    );

    setSavedJobIds((prev) => new Set([...prev, job.id]));
    toast.success(`"${job.title}" saved to Applications`);
  };

  const filtersActive =
    jobType !== "all" || experienceLevel !== "all" || sortBy !== "relevance";

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-5">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                Job Search
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Discover opportunities across 9 job portals, personalised to your resume
              </p>
            </div>
            {jobs.length > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                {totalCount.toLocaleString()} openings found
              </Badge>
            )}
          </div>
        </motion.div>

        {/* ── Portal Filter Chips ─────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {PORTAL_CONFIGS.map((portal) => (
            <button
              key={portal.id}
              onClick={() => setSelectedPortal(portal.id as PortalId | "all")}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                border transition-all duration-150 whitespace-nowrap ${
                selectedPortal === portal.id
                  ? `${portal.color} ${portal.textColor} border-current shadow-sm`
                  : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {portal.id !== "all" && (
                <span className={`h-1.5 w-1.5 rounded-full ${portal.dotColor}`} />
              )}
              {portal.label}
            </button>
          ))}
        </div>

        {/* ── Search Card ─────────────────────────────────────────────── */}
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-3">
            {/* Search inputs + button */}
            <div className="flex gap-3 flex-wrap md:flex-nowrap">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
                  placeholder={
                    userTitle
                      ? `e.g. ${userTitle}, Data Scientist…`
                      : "Role, job title, or keyword…"
                  }
                  className="pl-10"
                />
              </div>
              <div className="relative w-full md:w-52">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
                  placeholder={userLocation || "City or Remote"}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => handleSearch(1)}
                disabled={loading}
                className="brand-gradient border-0 gap-2 shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? "Searching…" : "Search Jobs"}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center">
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Select value={experienceLevel} onValueChange={setExpLevel}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience</SelectItem>
                  <SelectItem value="0-2">0–2 years</SelectItem>
                  <SelectItem value="2-5">2–5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-38 h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                </SelectContent>
              </Select>

              {filtersActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => {
                    setJobType("all");
                    setExpLevel("all");
                    setSortBy("relevance");
                  }}
                >
                  Reset filters
                </Button>
              )}
            </div>

            {/* Resume skills hint */}
            {userSkills.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Matching against your resume skills:&nbsp;
                {userSkills.slice(0, 5).map((s) => (
                  <Badge key={s} variant="outline" className="ml-1 text-xs">
                    {s}
                  </Badge>
                ))}
                {userSkills.length > 5 && (
                  <span className="ml-1">+{userSkills.length - 5} more</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Error State ─────────────────────────────────────────────── */}
        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">{error}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Check your connection and try again.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSearch(1)}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Job Cards / Skeletons / Empty ───────────────────────────── */}
        <div className="space-y-3">
          {loading && !jobs.length &&
            Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}

          {!loading && !error && jobs.length === 0 && (
            <EmptyState hasSearched={hasSearched} />
          )}

          {jobs.map((job, index) => {
            const portalConfig =
              PORTAL_CONFIGS.find((p) => p.id === job.portal) ??
              PORTAL_CONFIGS[0];
            return (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.has(job.id)}
                onSave={saveToApplications}
                portalConfig={portalConfig}
                index={index}
              />
            );
          })}

          {/* Load More */}
          {hasMore && !loading && (
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more…
                  </>
                ) : (
                  `Load more (${(totalCount - jobs.length).toLocaleString()} remaining)`
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
