import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface Workspace {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
}

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [workspaces, setWorkspacesState] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const setActiveWorkspace = (workspace: Workspace | null) => {
    setActiveWorkspaceState(workspace);
  };

  const setWorkspaces = (workspaces: Workspace[]) => {
    setWorkspacesState(workspaces);
  };

  const refreshWorkspaces = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/workspaces`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspacesState(data.data.workspaces);
        // Set first workspace as active if none selected
        if (data.data.workspaces.length > 0 && !activeWorkspace) {
          setActiveWorkspaceState(data.data.workspaces[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load workspaces on mount
  useState(() => {
    refreshWorkspaces();
  });

  const value: WorkspaceContextType = {
    activeWorkspace,
    setActiveWorkspace,
    workspaces,
    setWorkspaces,
    loading,
    refreshWorkspaces
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
