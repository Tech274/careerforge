import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Check, X, Zap, Target, Scissors, Maximize2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const modes = [
  { key: "improve", label: "Improve", icon: RefreshCw, desc: "Better grammar & clarity" },
  { key: "impact", label: "Impact", icon: Zap, desc: "Achievement-driven" },
  { key: "ats", label: "ATS", icon: Target, desc: "ATS-friendly keywords" },
  { key: "shorten", label: "Shorten", icon: Scissors, desc: "Concise version" },
  { key: "expand", label: "Expand", icon: Maximize2, desc: "More detailed" },
];

interface AIRewriteButtonProps {
  text: string;
  onAccept: (newText: string) => void;
}

export function AIRewriteButton({ text, onAccept }: AIRewriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const rewrite = async (mode: string) => {
    if (!text.trim()) {
      toast.error("Write something first before rewriting");
      return;
    }
    setLoading(true);
    setSuggestion(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-rewrite", {
        body: { text, mode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSuggestion(data.improvedText || data.raw || "");
    } catch (e: any) {
      toast.error(e.message || "Rewrite failed");
    } finally {
      setLoading(false);
    }
  };

  const accept = () => {
    if (suggestion) {
      onAccept(suggestion);
      setSuggestion(null);
      toast.success("Applied!");
    }
  };

  const reject = () => setSuggestion(null);

  if (suggestion) {
    return (
      <div className="mt-1.5 rounded-md border border-primary/20 bg-primary/5 p-2.5 space-y-2">
        <p className="text-xs font-medium text-primary">AI Suggestion:</p>
        <p className="text-sm text-foreground">{suggestion}</p>
        <div className="flex gap-1.5">
          <Button size="sm" onClick={accept} className="h-7 text-xs gap-1 brand-gradient border-0">
            <Check className="h-3 w-3" /> Accept
          </Button>
          <Button size="sm" variant="ghost" onClick={reject} className="h-7 text-xs gap-1">
            <X className="h-3 w-3" /> Reject
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-primary/60 hover:text-primary shrink-0"
          disabled={loading || !text.trim()}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {modes.map((m) => (
          <DropdownMenuItem key={m.key} onClick={() => rewrite(m.key)} className="gap-2">
            <m.icon className="h-3.5 w-3.5" />
            <div>
              <p className="font-medium text-sm">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
