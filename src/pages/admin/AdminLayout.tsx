import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, DollarSign, Activity, UserPlus, TrendingUp, ArrowLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin",            label: "Overview",   icon: LayoutDashboard, end: true },
  { to: "/admin/users",      label: "Users",      icon: Users           },
  { to: "/admin/financial",  label: "Financial",  icon: DollarSign      },
  { to: "/admin/traffic",    label: "Traffic",    icon: Activity        },
  { to: "/admin/leads",      label: "Leads",      icon: UserPlus        },
  { to: "/admin/marketing",  label: "Marketing",  icon: TrendingUp      },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title = "Admin" }: AdminLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = user?.email?.charAt(0)?.toUpperCase() ?? "A";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r bg-sidebar flex flex-col">
        {/* Header */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-sidebar-primary">Career</span>
            <span className="font-display text-xl font-bold text-sidebar-primary-foreground">Forge</span>
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-1">
              Admin
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary-foreground",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Back to App */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:text-sidebar-primary-foreground"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 border-b bg-card px-6 flex items-center justify-between shrink-0">
          <h1 className="font-semibold text-foreground">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-destructive/15 text-destructive text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
