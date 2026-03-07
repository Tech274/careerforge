import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Preset = "7d" | "30d" | "90d" | "custom";

interface AdminDateRangePickerProps {
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
  className?: string;
}

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

function presetDates(preset: Preset): { from: string; to: string } {
  const now = new Date();
  const to = toISODate(now);
  if (preset === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { from: toISODate(from), to };
  }
  if (preset === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from: toISODate(from), to };
  }
  if (preset === "90d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 90);
    return { from: toISODate(from), to };
  }
  return { from: "", to: "" };
}

export function AdminDateRangePicker({ from, to, onApply, className }: AdminDateRangePickerProps) {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  const handlePresetChange = (value: string) => {
    const p = value as Preset;
    setPreset(p);
    if (p !== "custom") {
      const { from: f, to: t } = presetDates(p);
      setCustomFrom(f);
      setCustomTo(t);
    }
  };

  const handleApply = () => {
    if (preset !== "custom") {
      const { from: f, to: t } = presetDates(preset);
      onApply(f, t);
    } else {
      onApply(customFrom, customTo);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </>
      )}

      <Button size="sm" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}
