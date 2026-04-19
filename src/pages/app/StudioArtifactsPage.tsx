import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Users, FlaskConical, TrendingUp, Map, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Artifact {
  id: string;
  title: string;
  status: string;
  project_id: string | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

const TOOL_TABS = [
  { key: "prd", label: "PRDs", icon: FileText, table: "prd_documents" as const },
  { key: "stories", label: "User Stories", icon: BookOpen, table: "user_stories" as const },
  { key: "icp", label: "ICP Profiles", icon: Users, table: "icp_profiles" as const },
  { key: "experiments", label: "Experiments", icon: FlaskConical, table: "experiments" as const },
  { key: "growth", label: "Growth Plans", icon: TrendingUp, table: "growth_plans" as const },
  { key: "roadmaps", label: "Roadmaps", icon: Map, table: "roadmaps" as const },
];

// Dummy artifacts data
const dummyArtifacts: Record<string, Artifact[]> = {
  prd: [
    {
      id: "prd1",
      title: "AI Project Manager PRD",
      status: "complete",
      project_id: "proj1",
      workspace_id: "workspace1",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "prd2",
      title: "Customer Analytics Platform PRD",
      status: "draft",
      project_id: "proj2",
      workspace_id: "workspace1",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  stories: [
    {
      id: "story1",
      title: "User Authentication Story",
      status: "complete",
      project_id: "proj1",
      workspace_id: "workspace1",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "story2",
      title: "Project Creation Story",
      status: "draft",
      project_id: "proj1",
      workspace_id: "workspace1",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  icp: [
    {
      id: "icp1",
      title: "SaaS Startup ICP",
      status: "complete",
      project_id: "proj1",
      workspace_id: "workspace1",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "icp2",
      title: "E-commerce ICP",
      status: "draft",
      project_id: "proj2",
      workspace_id: "workspace1",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  experiments: [
    {
      id: "exp1",
      title: "Landing Page A/B Test",
      status: "complete",
      project_id: "proj1",
      workspace_id: "workspace1",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  growth: [
    {
      id: "growth1",
      title: "User Acquisition Strategy",
      status: "draft",
      project_id: "proj2",
      workspace_id: "workspace1",
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  roadmaps: [
    {
      id: "roadmap1",
      title: "Q1 2024 Product Roadmap",
      status: "complete",
      project_id: "proj1",
      workspace_id: "workspace1",
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

export default function StudioArtifactsPage() {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<Record<string, Artifact[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("prd");

  useEffect(() => {
    // Simulate loading artifacts
    setTimeout(() => {
      setArtifacts(dummyArtifacts);
      setLoading(false);
    }, 1000);
  }, []);

  const deleteArtifact = async (table: string, id: string) => {
    // Simulate deletion
    setTimeout(() => {
      setArtifacts(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(a => a.id !== id)
      }));
      toast.success("Artifact deleted");
    }, 500);
  };

  const getToolPath = (key: string) => {
    const map: Record<string, string> = {
      prd: "/app/studio/prd-generator",
      stories: "/app/studio/user-stories",
      icp: "/app/studio/icp-builder",
      experiments: "/app/studio/experiment-engine",
      growth: "/app/studio/growth-engine",
      roadmaps: "/app/studio/roadmap-generator",
    };
    return map[key] || "/app";
  };


  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Studio Artifacts</h1>
        <p className="text-sm text-muted-foreground">All documents generated by Product Studio tools</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto mb-6">
          {TOOL_TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5 text-xs">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {artifacts[tab.key] && (
                <span className="ml-1 text-[10px] bg-muted px-1.5 rounded-full">{artifacts[tab.key].length}</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {TOOL_TABS.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (artifacts[tab.key] || []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <tab.icon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No {tab.label.toLowerCase()} yet.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate(getToolPath(tab.key))}>
                  Create One
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {(artifacts[tab.key] || []).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <tab.icon className="h-4 w-4 text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString()} • {a.status}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate(getToolPath(tab.key))}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteArtifact(tab.key, a.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
