import {
  LayoutDashboard, FileText, Mail, Briefcase, User, Settings, Linkedin, ClipboardList,
  ShieldCheck, BarChart3, Wand2, GitCompare, MessageSquare, Upload, Activity,
  Mic, Map, Send, FileSearch, QrCode, BookOpen, Globe, DollarSign, Target,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const groups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Resume",
    items: [
      { title: "Resumes", url: "/resumes", icon: FileText },
      { title: "Import", url: "/resume-import", icon: Upload },
      { title: "LinkedIn Import", url: "/linkedin-import", icon: Linkedin },
      { title: "ATS Checker", url: "/ats-checker", icon: ShieldCheck },
      { title: "Resume Score", url: "/resume-score", icon: BarChart3 },
      { title: "Tailoring", url: "/resume-tailoring", icon: Wand2 },
      { title: "Job Match", url: "/job-match", icon: Target },
      { title: "Compare", url: "/resume-comparison", icon: GitCompare },
      { title: "Translate", url: "/resume-translate", icon: Globe },
    ],
  },
  {
    label: "Career Tools",
    items: [
      { title: "Cover Letters", url: "/cover-letters", icon: Mail },
      { title: "Interview Prep", url: "/interview-prep", icon: MessageSquare },
      { title: "Mock Interview", url: "/mock-interview", icon: Mic },
      { title: "Interview Journal", url: "/interview-journal", icon: BookOpen },
      { title: "Career Roadmap", url: "/career-roadmap", icon: Map },
      { title: "Outreach Emails", url: "/outreach-email", icon: Send },
      { title: "Offer Analyzer", url: "/offer-analyzer", icon: FileSearch },
      { title: "LinkedIn", url: "/linkedin", icon: Linkedin },
    ],
  },
  {
    label: "Jobs",
    items: [
      { title: "Jobs", url: "/jobs", icon: Briefcase },
      { title: "Applications", url: "/applications", icon: ClipboardList },
    ],
  },
  {
    label: "Profile & Analytics",
    items: [
      { title: "Analytics", url: "/analytics", icon: Activity },
      { title: "QR / Business Card", url: "/qr-card", icon: QrCode },
      { title: "Profile", url: "/profile", icon: User },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-6">
          {!collapsed && (
            <h1 className="font-display text-xl font-bold text-sidebar-primary-foreground">
              <span className="text-sidebar-primary">Career</span>Forge
            </h1>
          )}
          {collapsed && (
            <span className="text-sidebar-primary font-display font-bold text-lg">CF</span>
          )}
        </div>

        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs text-sidebar-foreground/50 uppercase tracking-wider px-4 mb-1">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
