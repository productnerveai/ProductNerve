import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Plus, FolderKanban, TrendingUp, Activity, Building2, CheckCircle2,
} from "lucide-react";
import BetaFeedbackWidget from "@/components/app/BetaFeedbackWidget";

// Dummy data
const dummyProjects = [
  {
    id: "proj1",
    name: "Mobile App Development",
    status: "active",
    overall_score: 85,
    phase1_status: "complete",
    phase2_status: "in_progress", 
    phase3_status: "not_started",
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "proj2",
    name: "E-commerce Platform",
    status: "active",
    overall_score: 72,
    phase1_status: "complete",
    phase2_status: "complete",
    phase3_status: "in_progress",
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "proj3",
    name: "AI Assistant Tool",
    status: "planning",
    overall_score: null,
    phase1_status: "in_progress",
    phase2_status: "not_started",
    phase3_status: "not_started",
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const dummyProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  company_name: "Tech Innovations Inc"
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setProjects(dummyProjects);
      setProfile(dummyProfile);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Empty state: no workspaces
  if (dummyProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome to Product Nerve AI</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don't have a workspace yet. Create one to start building structured ventures.
        </p>
        <p className="text-sm text-muted-foreground">
          Use the <strong>Create Workspace</strong> button in the top-right to get started.
        </p>
      </div>
    );
  }

  // Stats
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const scoredProjects = projects.filter((p) => p.overall_score);
  const avgScore = scoredProjects.length > 0
    ? (scoredProjects.reduce((s: number, p: any) => s + Number(p.overall_score), 0) / scoredProjects.length).toFixed(0)
    : null;

  const profileFields = [profile?.name, profile?.email, profile?.company_name];
  const filledFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            New Venture
          </p>
        </div>
        <BetaFeedbackWidget />
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-3xl font-bold">1</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Workspaces</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            <span className="text-3xl font-bold">{projects.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">Projects in Workspace</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-3xl font-bold text-primary">{activeProjects}</span>
          </div>
          <p className="text-sm text-muted-foreground">Active Projects</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className={`text-3xl font-bold ${avgScore ? "text-accent" : "text-muted-foreground/40"}`}>
              {avgScore || "—"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Avg Venture Score</p>
        </div>
      </div>

      {/* Profile completion */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Profile Completion</p>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold">{profileCompletion}%</p>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
          {profileCompletion < 100 && (
            <p className="text-xs text-muted-foreground mt-1">Complete your profile in Settings</p>
          )}
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Phase Completion</p>
          <div className="flex gap-2 mt-2">
            {["phase1", "phase2", "phase3"].map((phase, i) => {
              const completed = projects.filter((p: any) => ["complete", "locked"].includes(p[`${phase}_status`])).length;
              return (
                <div key={phase} className="flex-1 text-center">
                  <p className="text-lg font-bold">{completed}</p>
                  <p className="text-[10px] text-muted-foreground">Phase {i + 1}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Projects</h3>
          {projects.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/projects")}>View All</Button>
          )}
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No projects in this workspace yet.</p>
            <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => navigate("/app/projects")}>
              <Plus className="h-4 w-4" /> Create Project
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 5).map((proj) => (
              <div key={proj.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/app/projects/${proj.id}`)}>
                <FolderKanban className="h-4 w-4 text-accent" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block truncate">{proj.name}</span>
                  {proj.overall_score && (
                    <span className="text-xs text-muted-foreground">Score: {Number(proj.overall_score).toFixed(0)}</span>
                  )}
                </div>
                <span className="ml-auto text-xs text-muted-foreground capitalize">{proj.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
