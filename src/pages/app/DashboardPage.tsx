import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Plus, FolderKanban, TrendingUp, Activity, Building2, CheckCircle2, FileText, BookOpen, Users,
} from "lucide-react";
import BetaFeedbackWidget from "@/components/app/BetaFeedbackWidget";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface DashboardStats {
  prd: { draft: number; complete: number; total: number };
  stories: { draft: number; complete: number; total: number };
  icp: { draft: number; complete: number; total: number };
  experiments: { draft: number; complete: number; total: number };
  growth: { draft: number; complete: number; total: number };
  roadmaps: { draft: number; complete: number; total: number };
  overall: { total: number; draft: number; complete: number };
}

interface RecentArtifact {
  _id: string;
  title: string;
  status: string;
  type: string;
  updatedAt: string;
  project_id?: { _id: string; name: string } | null;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentArtifacts, setRecentArtifacts] = useState<RecentArtifact[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [activeWorkspace]);

  const loadProfileCompletionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile-completion`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Failed to load profile completion data:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!activeWorkspace) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const workspaceId = activeWorkspace._id || activeWorkspace.id;
      
      // Load all data in parallel
      const [projectsRes, statsRes, recentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/projects?workspace_id=${workspaceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/artifacts/stats?workspace_id=${workspaceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/artifacts/recent?workspace_id=${workspaceId}&limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Process projects
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        
        // Handle different response structures
        let projectsArray = [];
        if (Array.isArray(projectsData.data)) {
          projectsArray = projectsData.data;
        } else if (projectsData.data && projectsData.data.projects) {
          projectsArray = projectsData.data.projects;
        } else if (projectsData.data && Array.isArray(projectsData.data)) {
          projectsArray = projectsData.data;
        } else {
          console.log('Projects data structure not recognized, using empty array');
        }
        
        console.log('Final projects array:', projectsArray);
        setProjects(projectsArray);
      } else {
        console.error('Projects API error:', projectsRes.status, projectsRes.statusText);
        const errorText = await projectsRes.text();
        console.error('Error response:', errorText);
      }

      // Process stats
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      } else {
        console.error('Stats API error:', statsRes.status, statsRes.statusText);
      }

      // Process recent artifacts
      if (recentRes.ok) {
        const recentData = await recentRes.json();
        setRecentArtifacts(recentData.data || []);
      } else {
        console.error('Recent API error:', recentRes.status, recentRes.statusText);
      }

      // Load user profile completion data
      await loadProfileCompletionData();
      
    } catch (error) {
      console.error('Dashboard loading error:', error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Empty state: no workspace
  if (!activeWorkspace) {
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
  const projectsArray = Array.isArray(projects) ? projects : [];
  const activeProjects = projectsArray.filter((p) => p.status === "active").length;
  const scoredProjects = projectsArray.filter((p) => p.overall_score);
  const avgScore = scoredProjects.length > 0
    ? (scoredProjects.reduce((s: number, p: any) => s + Number(p.overall_score), 0) / scoredProjects.length).toFixed(0)
    : null;

  const totalArtifacts = stats?.overall?.total || 0;
  const completedArtifacts = stats?.overall?.complete || 0;
  const draftArtifacts = stats?.overall?.draft || 0;

  // Calculate profile completion based on actual profile completion status
  const getProfileCompletionStatus = () => {
    if (!profile) return 0;
    
    // Basic fields from signup (always filled during registration)
    const basicFields = [
      profile.first_name,
      profile.last_name,
      profile.email
    ];
    
    // Additional profile completion fields
    const profileFields = [
      profile.official_company_name,
      profile.registration_number,
      profile.website,
      profile.custom_email,
      profile.phone
    ];
    
    // Count filled basic fields (should be 3 from signup)
    const filledBasicFields = basicFields.filter(field => field && field.trim() !== '').length;
    
    // Count filled profile fields
    const filledProfileFields = profileFields.filter(field => field && field.trim() !== '').length;
    
    // Calculate completion: 40% from basic fields + 60% from profile fields
    const basicCompletion = (filledBasicFields / 3) * 40; // 40% weight for basic fields
    const profileCompletion = (filledProfileFields / 5) * 60; // 60% weight for profile fields
    const baseCompletion = Math.round(basicCompletion + profileCompletion);
    
    const status = profile.profile_completion_status;
    
    if (status === 'approved') return 100;
    if (status === 'pending') return Math.min(baseCompletion + 15, 95); // Add 15% but cap at 95%
    if (status === 'rejected') return baseCompletion; // Back to base completion
    
    // For not_submitted, show actual completion percentage
    return baseCompletion;
  };

  const profileCompletion = getProfileCompletionStatus();

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'prd': return FileText;
      case 'stories': return BookOpen;
      case 'icp': return Users;
      default: return FileText;
    }
  };

  const getArtifactPath = (artifact: RecentArtifact) => {
    const typeMap: Record<string, string> = {
      'prd': '/app/studio/prd-generator',
      'stories': '/app/studio/user-stories',
      'icp': '/app/studio/icp-builder'
    };
    const basePath = typeMap[artifact.type] || '/app/studio/artifacts';
    return `${basePath}/${artifact._id}`;
  };

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
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-3xl font-bold">{totalArtifacts}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Artifacts</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            <span className="text-3xl font-bold">{projectsArray.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">Projects</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-3xl font-bold text-primary">{completedArtifacts}</span>
          </div>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className={`text-3xl font-bold ${avgScore ? "text-accent" : "text-muted-foreground/40"}`}>
              {avgScore || "—"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Avg Project Score</p>
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
            <p className="text-xs text-muted-foreground mt-1">
              {profile?.profile_completion_status === 'pending' 
                ? 'Profile under review' 
                : profile?.profile_completion_status === 'rejected'
                ? 'Profile needs updates'
                : 'Complete your profile in Settings'
              }
            </p>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Projects</h3>
            {projectsArray.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/app/projects")}>View All</Button>
            )}
          </div>
          {projectsArray.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No projects in this workspace yet.</p>
              <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => navigate("/app/projects")}>
                <Plus className="h-4 w-4" /> Create Project
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {projectsArray.slice(0, 3).map((proj) => (
                <div key={proj._id || proj.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/app/projects/${proj._id || proj.id}`)}>
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

        {/* Recent Artifacts */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Artifacts</h3>
            {recentArtifacts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/app/studio/artifacts")}>View All</Button>
            )}
          </div>
          {recentArtifacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No artifacts created yet.</p>
              <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => navigate("/app/studio/artifacts")}>
                <Plus className="h-4 w-4" /> Create Artifact
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentArtifacts.slice(0, 3).map((artifact) => {
                const Icon = getArtifactIcon(artifact.type);
                return (
                  <div key={artifact._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(getArtifactPath(artifact))}>
                    <Icon className="h-4 w-4 text-accent" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">{artifact.title}</span>
                      <span className="text-xs text-muted-foreground capitalize">{artifact.type.replace('_', ' ')} • {artifact.status}</span>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(artifact.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
