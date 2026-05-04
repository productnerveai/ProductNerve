import { createContext, useContext, useState, useEffect } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Project {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  workspace_id?: string;
  phase1_data?: any;
  phase2_data?: any;
  phase3_data?: any;
  phase1_status?: string;
  phase2_status?: string;
  phase3_status?: string;
  status?: string;
  stage?: string;
  overall_score?: number;
  project_locked?: boolean;
  unlock_type?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  creating: boolean;
  createProject: (name: string, description?: string) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  updateProjectStatus: (id: string, status: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  loadProjects: () => Promise<void>;
  getProject: (id: string) => Promise<Project | null>;
  updatePhase1: (id: string, data: any) => Promise<void>;
  updatePhase2: (id: string, data: any) => Promise<void>;
  updatePhase3: (id: string, data: any) => Promise<void>;
  getPhase1: (id: string) => Promise<any>;
  getPhase2: (id: string) => Promise<any>;
  getPhase3: (id: string) => Promise<any>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const loadProjects = async () => {
    if (!activeWorkspace) {
      console.log("No active workspace, skipping project load");
      return;
    }
    
    console.log("Loading projects for workspace:", activeWorkspace);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log("Making API call to:", `${API_BASE_URL}/projects`);
      
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("API response data:", data);
        setProjects(data.data.projects || data.data || []);
      } else {
        const error = await response.json();
        console.error("API error:", error);
        toast.error(error.error || "Failed to load projects");
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error while loading projects");
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description?: string) => {
    if (!name.trim() || !activeWorkspace) return;
    
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description?.trim(),
          workspace_id: activeWorkspace._id || activeWorkspace.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newProject = data.data;
        setProjects(prev => [newProject, ...prev]);
        toast.success("Project created!");
        // Redirect to project detail page with the new project ID
        navigate(`/app/projects/${newProject._id || newProject.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create project");
      }
    } catch (error) {
      toast.error("Network error while creating project");
    } finally {
      setCreating(false);
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(prev => 
          prev.map(p => 
            (p._id || p.id) === id ? updatedProject.data : p
          )
        );
        toast.success("Project updated!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update project");
      }
    } catch (error) {
      toast.error("Network error while updating project");
    }
  };

  const updateProjectStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const result = await response.json();
        setProjects(prev => 
          prev.map(p => 
            (p._id || p.id) === id ? { ...p, status: result.data.project.status } : p
          )
        );
        toast.success(`Project ${status}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update project status");
      }
    } catch (error) {
      toast.error("Network error while updating project status");
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => (p._id || p.id) !== id));
        toast.success("Project deleted!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete project");
      }
    } catch (error) {
      toast.error("Network error while deleting project");
    }
  };

  const getProject = async (id: string): Promise<Project | null> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load project");
        return null;
      }
    } catch (error) {
      toast.error("Network error while loading project");
      return null;
    }
  };

  const updatePhase1 = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}/phase1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success("Phase 1 updated!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update phase 1");
      }
    } catch (error) {
      toast.error("Network error while updating phase 1");
    }
  };

  const updatePhase2 = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}/phase2`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success("Phase 2 updated!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update phase 2");
      }
    } catch (error) {
      toast.error("Network error while updating phase 2");
    }
  };

  const updatePhase3 = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}/phase3`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success("Phase 3 updated!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update phase 3");
      }
    } catch (error) {
      toast.error("Network error while updating phase 3");
    }
  };

  const getPhase1 = async (id: string): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}/phase1`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load phase 1");
        return null;
      }
    } catch (error) {
      toast.error("Network error while loading phase 1");
      return null;
    }
  };

  const getPhase2 = async (id: string): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}/phase2`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load phase 2");
        return null;
      }
    } catch (error) {
      toast.error("Network error while loading phase 2");
      return null;
    }
  };

  const getPhase3 = async (id: string): Promise<any> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${id}/phase3`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load phase 3");
        return null;
      }
    } catch (error) {
      toast.error("Network error while loading phase 3");
      return null;
    }
  };

  // Load projects when workspace changes
  useEffect(() => {
    loadProjects();
  }, [activeWorkspace]);

  const value: ProjectContextType = {
    projects,
    loading,
    creating,
    createProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
    loadProjects,
    getProject,
    updatePhase1,
    updatePhase2,
    updatePhase3,
    getPhase1,
    getPhase2,
    getPhase3
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
