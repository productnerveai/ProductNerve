import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Plus, FolderKanban, ArrowUpDown, Filter, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type SortKey = "name" | "score" | "status" | "stage" | "created";

// Dummy projects data
const dummyProjects = [
  {
    id: "proj1",
    name: "Mobile App Development",
    status: "active",
    stage: "validation",
    overall_score: 85,
    phase1_status: "complete",
    phase2_status: "in_progress", 
    phase3_status: "not_started",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    workspace_id: "ws1"
  },
  {
    id: "proj2",
    name: "E-commerce Platform",
    status: "active",
    stage: "execution",
    overall_score: 72,
    phase1_status: "complete",
    phase2_status: "complete",
    phase3_status: "in_progress",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    workspace_id: "ws1"
  },
  {
    id: "proj3",
    name: "AI Assistant Tool",
    status: "planning",
    stage: "ideation",
    overall_score: null,
    phase1_status: "in_progress",
    phase2_status: "not_started",
    phase3_status: "not_started",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    workspace_id: "ws1"
  },
  {
    id: "proj4",
    name: "SaaS Analytics Dashboard",
    status: "paused",
    stage: "growth",
    overall_score: 68,
    phase1_status: "complete",
    phase2_status: "complete",
    phase3_status: "complete",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    workspace_id: "ws1"
  }
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [name, setName] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("created");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dummy workspace and plan limits
  const activeWorkspace = { id: "ws1", name: "Product Development" };
  const plan = "pro";
  const maxProjectsPerWorkspace = 10;
  const currentProjectCount = dummyProjects.length;
  const canCreate = currentProjectCount < maxProjectsPerWorkspace;

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setProjects(dummyProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const createProject = () => {
    if (!name.trim()) return;

    // Check limits
    if (!canCreate) {
      setShowUpgradeDialog(true);
      toast.error("Project limit reached");
      return;
    }

    const newProject = {
      id: `proj${Date.now()}`,
      name: name.trim(),
      status: "planning",
      stage: "ideation",
      overall_score: null,
      phase1_status: "not_started",
      phase2_status: "not_started",
      phase3_status: "not_started",
      created_at: new Date().toISOString(),
      workspace_id: activeWorkspace.id
    };

    setProjects(prev => [newProject, ...prev]);
    setShowDialog(false);
    setName("");
    toast.success("Project created!");
    navigate(`/app/projects/${newProject.id}`);
  };

  const updateStatus = (projectId: string, status: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
    toast.success(`Project ${status}`);
  };

  const sorted = [...projects].sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "score": return (Number(b.overall_score) || 0) - (Number(a.overall_score) || 0);
      case "status": return (a.status || "").localeCompare(b.status || "");
      case "stage": return (a.stage || "").localeCompare(b.stage || "");
      case "created": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default: return 0;
    }
  });

  const filtered = filterStatus === "all" ? sorted : sorted.filter((p) => p.status === filterStatus);

  const statusColor = (s: string) => {
    if (s === "active") return "bg-primary/10 text-primary";
    if (s === "paused") return "bg-amber-100 text-amber-700";
    if (s === "killed") return "bg-destructive/10 text-destructive";
    if (s === "scaled") return "bg-green-100 text-green-700";
    return "bg-muted text-muted-foreground";
  };


  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {activeWorkspace.name} • {currentProjectCount}/{maxProjectsPerWorkspace} projects
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!canCreate}>
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              <Button onClick={createProject} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upgrade dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Full Venture Intelligence</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {plan === "free"
                ? "You’ve hit the Free plan project limit. Unlock a project ($11.75) or upgrade to Pro ($16.99/month) for higher limits."
                : "You’ve hit your project limit. Upgrade to Pro for higher limits."}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const firstProjectId = projects?.[0]?.id;
                  if (firstProjectId) navigate(`/app/projects/${firstProjectId}?paywall=1`);
                  setShowUpgradeDialog(false);
                }}
                disabled={!projects?.length}
              >
                Unlock a Project — $11.75
              </Button>
              <Button
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  navigate("/app/billing");
                  setShowUpgradeDialog(false);
                }}
              >
                Upgrade to Pro — $16.99/mo
              </Button>
            </div>
            {!projects?.length && (
              <p className="text-xs text-muted-foreground">
                Create your first project to unlock additional projects.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {projects.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="stage">Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="killed">Killed</SelectItem>
                <SelectItem value="scaled">Scaled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground self-center ml-auto">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FolderKanban className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>{projects.length === 0 ? "No projects yet. Create your first one!" : "No projects match filter."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((proj) => (
            <div key={proj.id} className="glass-card rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow group" onClick={() => navigate(`/app/projects/${proj.id}`)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{proj.name}</h3>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent capitalize">{proj.stage}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(proj.status)}`}>{proj.status}</span>
              </div>
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                {proj.status !== "paused" && <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => updateStatus(proj.id, "paused")}>Pause</Button>}
                {proj.status !== "active" && <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => updateStatus(proj.id, "active")}>Activate</Button>}
                {proj.status !== "killed" && <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-destructive" onClick={() => updateStatus(proj.id, "killed")}>Kill</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
