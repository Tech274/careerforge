import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface SmartSuggestionsProps {
  role: string;
  onInsert: (bullet: string) => void;
}

export function SmartSuggestions({ role, onInsert }: SmartSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  const generate = async () => {
    if (!role.trim()) {
      toast.error("Enter a role/job title first");
      return;
    }
    setLoading(true);
    setVisible(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-suggestions", {
        body: { jobTitle: role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSuggestions(data.suggestions || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = (s: string) => {
    onInsert(s);
    setSuggestions(prev => prev.filter(item => item !== s));
    toast.success("Bullet point inserted!");
  };

  if (!visible) {
    return (
      <Button
        onClick={generate}
        variant="ghost"
        size="sm"
        className="text-xs text-primary/70 hover:text-primary gap-1.5"
        disabled={!role.trim()}
      >
        <Lightbulb className="h-3.5 w-3.5" />
        AI Suggestions
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-primary flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5" />
          Suggested bullet points for "{role}"
        </p>
        <div className="flex gap-1">
          <Button onClick={generate} variant="ghost" size="sm" className="h-6 text-xs" disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh"}
          </Button>
          <Button onClick={() => setVisible(false)} variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground ml-2">Generating suggestions...</span>
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No suggestions generated. Try a different role.</p>
      ) : (
        <ul className="space-y-1.5">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-card rounded-md p-2">
              <span className="flex-1">{s}</span>
              <Button
                onClick={() => handleInsert(s)}
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0 text-primary hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
