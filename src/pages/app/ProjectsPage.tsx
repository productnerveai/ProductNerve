import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Plus, FolderKanban, ArrowUpDown, Filter, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProject } from "@/contexts/ProjectContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

type SortKey = "name" | "score" | "status" | "stage" | "created";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { projects, loading, creating, createProject: createNewProject, deleteProject, updateProjectStatus } = useProject();
  const [showDialog, setShowDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [name, setName] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("created");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Plan limits (these should come from user profile/subscription)
  const maxProjectsPerWorkspace = 10;
  const currentProjectCount = projects.length;
  const canCreate = currentProjectCount < maxProjectsPerWorkspace;

  const handleCreateProject = () => {
    if (!name.trim()) return;

    // Check limits
    if (!canCreate) {
      setShowUpgradeDialog(true);
      toast.error("Project limit reached");
      return;
    }

    createNewProject(name.trim());
    setName("");
    setShowDialog(false);
  };

  const updateStatus = (projectId: string, status: string) => {
    updateProjectStatus(projectId, status);
  };

  const sorted = [...projects].sort((a, b) => {
    switch (sortBy) {
      case "name": return (a.name || "").localeCompare(b.name || "");
      case "created": return new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime();
      case "status": return (a.status || "").localeCompare(b.status || "");
      default: return 0;
    }
  });

  const filtered = filterStatus === "all" ? sorted : sorted.filter((p) => p.status === filterStatus);

  const statusColor = (s: string) => {
    if (s === "active") return "text-green-600 bg-green-50";
    if (s === "paused") return "text-yellow-600 bg-yellow-50";
    if (s === "killed") return "text-red-600 bg-red-50";
    if (s === "scaled") return "text-purple-600 bg-purple-50";
    return "text-gray-600 bg-gray-50";
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "ideation": return "text-purple-600 bg-purple-50";
      case "planning": return "text-blue-600 bg-blue-50";
      case "validation": return "text-orange-600 bg-orange-50";
      case "execution": return "text-green-600 bg-green-50";
      case "completed": return "text-gray-600 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
              <Button onClick={handleCreateProject} className="w-full" disabled={creating}>
  {creating ? "Creating..." : "Create"}
</Button>
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
            {/* <p className="text-sm text-muted-foreground">
              {plan === "free"
                ? "You’ve hit the Free plan project limit. Unlock a project ($11.75) or upgrade to Pro ($16.99/month) for higher limits."
                : "You’ve hit your project limit. Upgrade to Pro for higher limits."}
            </p> */}
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
            <div key={proj._id || proj.id} className="glass-card rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow group" onClick={() => navigate(`/app/projects/${proj._id || proj.id}`)}>
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
                {proj.status !== "paused" && <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => updateStatus(proj._id || proj.id, "paused")}>Pause</Button>}
                
                {proj.status !== "active" && <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => updateStatus(proj._id || proj.id, "active")}>Activate</Button>}
                
                {proj.status !== "killed" && <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-destructive" onClick={() => updateStatus(proj._id || proj.id, "killed")}>Kill</Button>}
                
                {proj.status !== "scaled" && <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-green-600" onClick={() => updateStatus(proj._id || proj.id, "scaled")}>Scale</Button>}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
