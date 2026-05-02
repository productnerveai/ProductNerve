import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoMark from "@/assets/logo-mark.png";
import {
  LayoutDashboard,
  FolderKanban,
  CreditCard,
  Settings,
  LifeBuoy,
  Rocket,
  ChevronDown,
  Briefcase,
  Shield,
  LogOut,
  Users,
  TrendingUp,
  FlaskConical,
  Map,
  BookOpen,
  FileText,
  Archive,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const NON_BETA_TOOLS = ["ICP Builder", "User Story Generator", "PRD Generator"];

const studioTools = [
  { label: "ICP Builder", path: "/app/studio/icp-builder", icon: Users },
  { label: "Growth Engine", path: "/app/studio/growth-engine", icon: TrendingUp },
  { label: "Experiment Engine", path: "/app/studio/experiment-engine", icon: FlaskConical },
  { label: "Roadmap Generator", path: "/app/studio/roadmap-generator", icon: Map },
  { label: "User Story Generator", path: "/app/studio/user-stories", icon: BookOpen },
  { label: "PRD Generator", path: "/app/studio/prd-generator", icon: FileText },
  { label: "All Artifacts", path: "/app/studio/artifacts", icon: Archive },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [studioOpen, setStudioOpen] = useState(location.pathname.startsWith("/app/studio"));

  // Check if user has admin access
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-4">
        <a 
          href="https://productnerve.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 font-bold text-sm text-sidebar-foreground"
        >
          <img src={logoMark} alt="Product Nerve AI" className="h-7 w-7 rounded-md" />
          Product Nerve AI
        </a>
      </div>

      <SidebarContent className="overflow-y-auto scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/app"}>
                  <Link to="/app">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {activeWorkspace && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith("/app/projects")}>
                  <Link to="/app/projects">
                    <FolderKanban className="h-4 w-4" />
                    <span>Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              )}

              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/app/billing"}>
                  <Link to="/app/billing">
                    <CreditCard className="h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/app/settings"}>
                  <Link to="/app/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/app/support"}>
                  <Link to="/app/support">
                    <LifeBuoy className="h-4 w-4" />
                    <span>Support</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Product Studio */}
        <SidebarGroup>
          <Collapsible open={studioOpen} onOpenChange={setStudioOpen}>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer w-full">
                <span className="flex items-center gap-2">
                  <Rocket className="h-3.5 w-3.5" />
                  Product Studio
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${studioOpen ? "rotate-180" : ""}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {studioTools.map((tool) => (
                    <SidebarMenuItem key={tool.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === tool.path}
                      >
                        <Link to={tool.path} className={!NON_BETA_TOOLS.includes(tool.label) && tool.label !== "All Artifacts" ? "pointer-events-none opacity-80" : ""}>
                          <tool.icon className="h-4 w-4" />
                          <span>{tool.label}</span>
                          {!NON_BETA_TOOLS.includes(tool.label) && tool.label !== "All Artifacts" && (
                            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                              Coming Soon
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Investor Studio (Coming Soon) */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5" />
            Investor Studio
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              Coming Soon
            </span>
          </SidebarGroupLabel>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                      <span>Super Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      </Sidebar>
  );
}
