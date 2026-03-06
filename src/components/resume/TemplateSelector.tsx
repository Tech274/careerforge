import { useResume } from "@/contexts/ResumeContext";
import { TemplateName } from "@/types/resume";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type Category = "all" | "professional" | "creative" | "technical" | "academic" | "minimal";

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "professional", label: "Professional" },
  { key: "creative", label: "Creative" },
  { key: "technical", label: "Technical" },
  { key: "minimal", label: "Minimal" },
  { key: "academic", label: "Academic" },
];

interface TemplateOption {
  name: TemplateName;
  label: string;
  description: string;
  category: Category;
  colors: string[]; // mini thumbnail color blocks
}

const templateOptions: TemplateOption[] = [
  { name: "modern", label: "Modern", description: "Clean with accent colors", category: "professional", colors: ["#6366f1", "#f8fafc", "#e2e8f0"] },
  { name: "professional", label: "Professional", description: "Gradient header, bold sections", category: "professional", colors: ["#1e293b", "#3b82f6", "#f1f5f9"] },
  { name: "minimalist", label: "Minimalist", description: "Centered, elegant simplicity", category: "minimal", colors: ["#f8fafc", "#94a3b8", "#e2e8f0"] },
  { name: "corporate", label: "Corporate", description: "Two-column, sidebar layout", category: "professional", colors: ["#1e3a5f", "#f8fafc", "#e2e8f0"] },
  { name: "executive", label: "Executive", description: "Dark header, gold accents", category: "professional", colors: ["#111827", "#f59e0b", "#f8fafc"] },
  { name: "creative", label: "Creative", description: "Rose-purple gradient, playful", category: "creative", colors: ["#f43f5e", "#a855f7", "#fdf2f8"] },
  { name: "elegant", label: "Elegant", description: "Serif, centered, refined", category: "minimal", colors: ["#fafaf9", "#a8a29e", "#d6d3d1"] },
  { name: "tech", label: "Tech / Dev", description: "Dark terminal-style coding vibe", category: "technical", colors: ["#0a0a0a", "#10b981", "#06b6d4"] },
  { name: "compact", label: "Compact", description: "Dense 3-column, space-efficient", category: "professional", colors: ["#f8fafc", "#6b7280", "#e5e7eb"] },
  { name: "bold", label: "Bold", description: "Blue gradient, extrabold headings", category: "creative", colors: ["#4f46e5", "#6366f1", "#eef2ff"] },
  { name: "academic", label: "Academic", description: "Education-first, serif, scholarly", category: "academic", colors: ["#f8fafc", "#1f2937", "#d1d5db"] },
  { name: "timeline", label: "Timeline", description: "Visual timeline for experience", category: "creative", colors: ["#f8fafc", "#0d9488", "#ccfbf1"] },
  { name: "infographic", label: "Infographic", description: "Skill bars, orange sidebar", category: "creative", colors: ["#f97316", "#ef4444", "#fff7ed"] },
  { name: "simple-two-column", label: "Two Column", description: "Slate sidebar, clean split", category: "professional", colors: ["#1e293b", "#f8fafc", "#94a3b8"] },
  { name: "classic", label: "Classic", description: "Traditional serif, timeless", category: "academic", colors: ["#f8fafc", "#374151", "#d1d5db"] },
  { name: "gradient", label: "Gradient", description: "Violet-to-pink gradient flair", category: "creative", colors: ["#7c3aed", "#ec4899", "#fdf4ff"] },
  { name: "nordic", label: "Nordic", description: "Minimal Scandinavian, grid layout", category: "minimal", colors: ["#fafaf9", "#78716c", "#d6d3d1"] },
];

function MiniThumbnail({ colors, hasSidebar }: { colors: string[]; hasSidebar?: boolean }) {
  if (hasSidebar) {
    return (
      <div className="w-full h-16 rounded border border-border/50 overflow-hidden flex">
        <div className="w-1/3 h-full" style={{ backgroundColor: colors[0] }}>
          <div className="mt-2 mx-1 space-y-1">
            <div className="h-1 w-3/4 rounded-full" style={{ backgroundColor: colors[1], opacity: 0.6 }} />
            <div className="h-0.5 w-1/2 rounded-full bg-white/30" />
          </div>
        </div>
        <div className="w-2/3 h-full" style={{ backgroundColor: colors[2] }}>
          <div className="mt-2 mx-1.5 space-y-1">
            <div className="h-1 w-3/4 rounded-full" style={{ backgroundColor: colors[0], opacity: 0.3 }} />
            <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: colors[0], opacity: 0.15 }} />
            <div className="h-0.5 w-2/3 rounded-full" style={{ backgroundColor: colors[0], opacity: 0.15 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-16 rounded border border-border/50 overflow-hidden flex flex-col">
      <div className="h-5 w-full" style={{ backgroundColor: colors[0] }}>
        <div className="flex items-center justify-center h-full gap-1">
          <div className="h-1 w-6 rounded-full" style={{ backgroundColor: colors[1], opacity: 0.7 }} />
        </div>
      </div>
      <div className="flex-1 px-1.5 py-1 space-y-0.5" style={{ backgroundColor: colors[2] }}>
        <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: colors[0], opacity: 0.2 }} />
        <div className="h-0.5 w-3/4 rounded-full" style={{ backgroundColor: colors[0], opacity: 0.15 }} />
        <div className="h-0.5 w-5/6 rounded-full" style={{ backgroundColor: colors[0], opacity: 0.1 }} />
      </div>
    </div>
  );
}

const sidebarTemplates: TemplateName[] = ["corporate", "infographic", "simple-two-column", "compact"];

export function TemplateSelector() {
  const { template, setTemplate } = useResume();
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filtered = activeCategory === "all"
    ? templateOptions
    : templateOptions.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-lg text-foreground">Template</h3>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map(c => (
          <Badge
            key={c.key}
            variant={activeCategory === c.key ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-xs transition-all",
              activeCategory === c.key
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-muted"
            )}
            onClick={() => setActiveCategory(c.key)}
          >
            {c.label}
          </Badge>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filtered.map(t => (
          <button
            key={t.name}
            onClick={() => setTemplate(t.name)}
            className={cn(
              "rounded-lg border-2 p-2 text-left transition-all hover:shadow-card group",
              template === t.name ? "border-primary bg-primary/5 shadow-elevated" : "border-border bg-card"
            )}
          >
            <MiniThumbnail colors={t.colors} hasSidebar={sidebarTemplates.includes(t.name)} />
            <p className="font-display font-semibold text-xs text-foreground mt-1.5">{t.label}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{t.description}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No templates in this category</p>
      )}
    </div>
  );
}
