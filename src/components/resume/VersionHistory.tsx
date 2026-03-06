import { useResume } from "@/contexts/ResumeContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function VersionHistory() {
  const { versions, loadVersion, currentResumeId } = useResume();

  if (!currentResumeId) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <History className="h-3.5 w-3.5" /> History
          {versions.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1">
              {versions.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-display flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Version History
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No versions yet. Save your resume to create the first version.
            </p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="rounded-lg border bg-card p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Version {v.version_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(v.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => loadVersion(v)}
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-primary"
                    >
                      <RotateCcw className="h-3 w-3" /> Restore
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="capitalize">{v.template}</span> template
                    {v.resume_data?.personalInfo?.name && (
                      <> · {v.resume_data.personalInfo.name}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
