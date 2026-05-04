import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Plus, FolderKanban, ArrowUpDown, Filter, AlertTriangle, Upload, X, FileText, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProject } from "@/contexts/ProjectContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

type SortKey = "name" | "score" | "status" | "stage" | "created";

type UploadedFile = {
  file: File;
  preview: string;
  size: number;
  type: string;
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { projects, loading, creating, createProject: createNewProject, deleteProject, updateProjectStatus } = useProject();
  const [showDialog, setShowDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ragFiles, setRagFiles] = useState<UploadedFile[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("created");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Plan limits (these should come from user profile/subscription)
  const maxProjectsPerWorkspace = 10;
  const currentProjectCount = projects.length;
  const canCreate = currentProjectCount < maxProjectsPerWorkspace;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalSize = ragFiles.reduce((sum, f) => sum + f.size, 0);
    const newTotalSize = totalSize + files.reduce((sum, f) => sum + f.size, 0);
    
    if (newTotalSize > 50 * 1024 * 1024) {
      toast.error("Files exceed 50MB limit");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setRagFiles(prev => [...prev, {
          file,
          preview,
          size: file.size,
          type: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setRagFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateProject = async () => {
    if (!name.trim()) return;
    
    if (!activeWorkspace) {
      toast.error("No active workspace selected");
      return;
    }

    // Check limits
    if (!canCreate) {
      setShowUpgradeDialog(true);
      toast.error("Project limit reached");
      return;
    }

    try {
      // Create project with JSON data (express-validator compatible)
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();
      const workspaceId = activeWorkspace?.id || activeWorkspace?._id;
      
      console.log('Creating project with:', {
        name: trimmedName,
        description: trimmedDescription,
        workspace_id: workspaceId,
        ragFilesCount: ragFiles.length
      });

      const projectData = {
        name: trimmedName,
        description: trimmedDescription,
        workspace_id: workspaceId
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const data = await response.json();
        const newProject = data.data;
        
        // If there are RAG files, upload them
        if (ragFiles.length > 0) {
          for (let i = 0; i < ragFiles.length; i++) {
            const uploadedFile = ragFiles[i];
            
            // Convert file to base64
            const fileData = {
              name: uploadedFile.file.name,
              type: uploadedFile.file.type,
              data: uploadedFile.preview.split(',')[1] // Remove data:image/...;base64, prefix
            };
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/${newProject._id || newProject.id}/rag/upload`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ file: fileData })
            });
            
            if (!response.ok) {
              console.error('RAG file upload failed:', await response.json());
            }
          }
        }
        
        toast.success("Project created successfully!");
        navigate(`/app/projects/${newProject._id || newProject.id}`);
        
        // Reset form
        setName("");
        setDescription("");
        setRagFiles([]);
        setShowDialog(false);
      } else {
        const error = await response.json();
        console.error('Project creation error:', error);
        if (error.details && error.details.length > 0) {
          console.error('Validation details:', error.details);
          error.details.forEach((detail: any, index: number) => {
            console.error(`Validation error ${index + 1}:`, {
              field: detail.param,
              message: detail.msg,
              value: detail.value
            });
          });
        }
        toast.error(error.error || "Failed to create project");
      }
    } catch (error) {
      toast.error("Network error while creating project");
    }
  };

  const handleDeleteProject = (project: any) => {
    setProjectToDelete(project);
    setDeleteDialog(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await deleteProject(projectToDelete._id || projectToDelete.id);
      toast.success(`Project "${projectToDelete.name}" deleted successfully`);
      setDeleteDialog(false);
      setProjectToDelete(null);
    } catch (error) {
      toast.error("Failed to delete project");
      setDeleteDialog(false);
      setProjectToDelete(null);
    }
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
            {activeWorkspace?.name || 'No Workspace'} • {currentProjectCount}/{maxProjectsPerWorkspace} projects
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!canCreate}>
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
            <div className="space-y-6 pt-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Project Name</label>
                  <Input 
                    placeholder="Enter project name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    maxLength={100} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Project Description</label>
                  <Textarea 
                    placeholder="Describe your project, goals, and what you're building..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    maxLength={1000}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              </div>

              {/* RAG Folder Upload */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Project Knowledge Base (RAG Folder)
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload project-related files to provide context for AI analysis and improve validation accuracy
                  </p>
                </div>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="rag-file-upload"
                  />
                  <label 
                    htmlFor="rag-file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PDF, Word, Excel, PowerPoint, Text, CSV, and images (Max 50MB total)
                    </span>
                  </label>
                </div>

                {/* File Usage Display */}
                <div className="bg-muted/30 rounded p-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Storage Used</span>
                    <span className={`font-medium ${
                      ragFiles.reduce((sum, f) => sum + f.size, 0) > 40 * 1024 * 1024 ? 'text-orange-600' : ''
                    }`}>
                      {formatFileSize(ragFiles.reduce((sum, f) => sum + f.size, 0))} / 50MB
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((ragFiles.reduce((sum, f) => sum + f.size, 0) / (50 * 1024 * 1024)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Uploaded Files List */}
                {ragFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Files</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {ragFiles.map((uploadedFile, index) => (
                        <div key={index} className="flex items-center justify-between bg-card border rounded p-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {uploadedFile.type.startsWith('image/') ? (
                              <img src={uploadedFile.preview} alt="" className="h-8 w-8 object-cover rounded" />
                            ) : (
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="text-sm truncate">{uploadedFile.file.name}</span>
                            <span className="text-xs text-muted-foreground">({formatFileSize(uploadedFile.size)})</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleCreateProject} className="w-full" disabled={creating || !name.trim()}>
                {creating ? "Creating..." : "Create Project"}
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
                
                {proj.status !== "killed" && <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-red-600" onClick={() => handleDeleteProject(proj)}>Delete</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
