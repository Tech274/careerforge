import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Bookmark, ExternalLink } from "lucide-react";
import { useState } from "react";

const mockJobs = [
  { id: "1", title: "Senior Frontend Engineer", company: "Stripe", location: "Remote", description: "Build beautiful payment UIs used by millions of businesses worldwide.", postedDate: "2 days ago", applyLink: "#" },
  { id: "2", title: "Full Stack Developer", company: "Vercel", location: "San Francisco, CA", description: "Work on Next.js and the future of web development.", postedDate: "1 week ago", applyLink: "#" },
  { id: "3", title: "Product Designer", company: "Figma", location: "New York, NY", description: "Design collaborative tools that empower teams to create together.", postedDate: "3 days ago", applyLink: "#" },
  { id: "4", title: "Backend Engineer", company: "Supabase", location: "Remote", description: "Build open-source database infrastructure used by thousands of developers.", postedDate: "5 days ago", applyLink: "#" },
  { id: "5", title: "DevOps Engineer", company: "GitLab", location: "Remote", description: "Scale CI/CD pipelines and infrastructure for millions of developers.", postedDate: "1 day ago", applyLink: "#" },
];

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const filtered = mockJobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSave = (id: string) => {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Job Search</h1>
          <p className="text-muted-foreground text-sm mt-1">Find your next opportunity</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, company, or location..."
            className="pl-10 bg-card"
          />
        </div>

        <div className="space-y-4">
          {filtered.map(job => (
            <Card key={job.id} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-lg text-foreground">{job.title}</h3>
                    <p className="text-primary font-medium text-sm">{job.company}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">{job.postedDate}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="icon"
                      variant={savedJobs.includes(job.id) ? "default" : "outline"}
                      onClick={() => toggleSave(job.id)}
                      className="h-8 w-8"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
