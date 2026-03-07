import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlanBadge } from "./PlanBadge";
import type { AdminUser } from "@/types/admin";
import { ExternalLink, User, Mail, Calendar, Clock, FileText, Briefcase, Eye } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

interface AdminUserDrawerProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-all">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export function AdminUserDrawer({ user, open, onClose }: AdminUserDrawerProps) {
  if (!user) return null;

  const joinedAgo = user.created_at
    ? formatDistanceToNow(parseISO(user.created_at), { addSuffix: true })
    : "—";

  const lastActiveAgo = user.last_sign_in_at
    ? formatDistanceToNow(parseISO(user.last_sign_in_at), { addSuffix: true })
    : "Never";

  const subEndFmt = user.subscription_end
    ? new Date(user.subscription_end).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-[400px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        {/* Avatar + Name */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-semibold text-base">{user.name || "Unnamed User"}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <PlanBadge plan={user.plan} />
              {user.is_admin && (
                <Badge variant="destructive" className="text-xs">Admin</Badge>
              )}
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Info Grid */}
        <div className="space-y-4">
          <InfoRow icon={User} label="User ID" value={<span className="font-mono text-xs">{user.id}</span>} />
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={User} label="Username" value={user.username ? `@${user.username}` : "—"} />
          <InfoRow icon={Calendar} label="Joined" value={`${new Date(user.created_at).toLocaleDateString()} (${joinedAgo})`} />
          <InfoRow icon={Clock} label="Last Active" value={lastActiveAgo} />
        </div>

        <Separator className="my-4" />

        {/* Subscription */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Subscription</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Plan</span>
              <PlanBadge plan={user.plan} />
            </div>
            {subEndFmt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Renews / Expires</span>
                <span className="text-sm font-medium">{subEndFmt}</span>
              </div>
            )}
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Activity */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Activity</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FileText, label: "Resumes", value: user.resume_count },
              { icon: Briefcase, label: "Applications", value: user.application_count },
              { icon: Eye, label: "Profile Visits", value: user.profile_visit_count },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
                <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Public Profile Link */}
        {user.username && user.is_public && (
          <>
            <Separator className="mb-4" />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`/p/${user.username}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Public Profile
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
