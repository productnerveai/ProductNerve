import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, FileText, BookOpen, Users, ArrowLeft, Download, FlaskConical, TrendingUp, Map } from "lucide-react";
import { toast } from "sonner";
import ArtifactModal from "@/components/project/ArtifactModal";

function statusBadge(status: string | null) {
  if (!status || status === "not_started") return <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
  if (status === "in_progress" || status === "intake") return <Badge className="bg-accent/15 text-accent border-accent/30">In Progress</Badge>;
  if (status === "locked" || status === "complete") return <Badge className="bg-primary/15 text-primary border-primary/30">Complete</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

interface ArtifactItem {
  id: string;
  title: string;
  type: string;
  status: string;
  content?: any;
  created_at?: string;
}

// Dummy project data
const dummyProjects = {
  proj1: {
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
  proj2: {
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
  proj3: {
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
  }
};

// Dummy scores data
const dummyScores = {
  proj1: {
    p1: { viability_score: 85, classification: "High Potential" },
    p2: { execution_score: 78, classification: "Good Execution" },
    p3: { growth_score: 82, classification: "Strong Growth" }
  },
  proj2: {
    p1: { viability_score: 72, classification: "Moderate Potential" },
    p2: { execution_score: 75, classification: "Solid Execution" },
    p3: { growth_score: 70, classification: "Moderate Growth" }
  },
  proj3: {
    p1: { viability_score: null, classification: null },
    p2: { execution_score: null, classification: null },
    p3: { growth_score: null, classification: null }
  }
};

// Dummy artifacts data
const dummyArtifacts = {
  proj1: [
    {
      id: "art1",
      title: "Mobile App PRD",
      type: "PRD (standard)",
      status: "complete",
      content: "Product requirements document for mobile app development...",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "art2",
      title: "Target User Personas",
      type: "ICP Profile",
      status: "complete",
      content: "Ideal customer profile for mobile app users...",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  proj2: [
    {
      id: "art3",
      title: "E-commerce User Stories",
      type: "User Stories",
      status: "in_progress",
      content: "User stories for e-commerce platform...",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  proj3: []
};

export default function ProjectOverviewPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [scores, setScores] = useState<{ p1: any; p2: any; p3: any }>({ p1: null, p2: null, p3: null });
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalArtifact, setModalArtifact] = useState<ArtifactItem | null>(null);

  // Dummy workspace
  const activeWorkspace = { id: "ws1", name: "Product Development" };

  useEffect(() => {
    if (projectId) loadAll();
  }, [projectId]);

  const loadAll = () => {
    // Simulate loading data
    setTimeout(() => {
      const projectData = dummyProjects[projectId as keyof typeof dummyProjects];
      const scoresData = dummyScores[projectId as keyof typeof dummyScores];
      const artifactsData = dummyArtifacts[projectId as keyof typeof dummyArtifacts] || [];

      setProject(projectData);
      setScores(scoresData);
      setArtifacts(artifactsData);
      setLoading(false);
    }, 1000);
  };

  const handleDownloadProject = () => {
    toast.loading("Generating project export...", { id: "download" });
    
    // Simulate export generation
    setTimeout(() => {
      const dummyHtml = `
        <html>
          <head><title>${project?.name} - Project Overview</title></head>
          <body>
            <h1>${project?.name}</h1>
            <h2>Project Overview</h2>
            <p>Venture Score: ${project?.overall_score || 'N/A'}</p>
            <p>Status: ${project?.status}</p>
            <p>Stage: ${project?.stage}</p>
            <h3>Phase Progress</h3>
            <p>Phase 1: ${project?.phase1_status}</p>
            <p>Phase 2: ${project?.phase2_status}</p>
            <p>Phase 3: ${project?.phase3_status}</p>
            <h3>Artifacts</h3>
            <ul>
              ${artifacts.map(a => `<li>${a.title} - ${a.type}</li>`).join('')}
            </ul>
          </body>
        </html>
      `;
      
      const win = window.open("", "_blank");
      if (win) { 
        win.document.write(dummyHtml); 
        win.document.close(); 
        setTimeout(() => win.print(), 500); 
      }
      toast.success("Export ready! Use Print > Save as PDF", { id: "download" });
    }, 2000);
  };

  const artifactIcon = (type: string) => {
    if (type.startsWith("PRD")) return <FileText className="h-4 w-4 text-accent" />;
    if (type === "User Stories") return <BookOpen className="h-4 w-4 text-accent" />;
    if (type === "ICP Profile") return <Users className="h-4 w-4 text-accent" />;
    if (type === "Experiment") return <FlaskConical className="h-4 w-4 text-accent" />;
    if (type === "Growth Plan") return <TrendingUp className="h-4 w-4 text-accent" />;
    if (type === "Roadmap") return <Map className="h-4 w-4 text-accent" />;
    return <FileText className="h-4 w-4 text-accent" />;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-16 text-muted-foreground">Project not found.</div>;

  const p1Status = project.phase1_status || "not_started";
  const p2Status = project.phase2_status || "not_started";
  const p3Status = project.phase3_status || "not_started";

  const overallScore = project.overall_score ?? (
    ((scores.p1?.viability_score || 0) * 0.4) +
    ((scores.p2?.execution_score || 0) * 0.3) +
    ((scores.p3?.growth_score || 0) * 0.3)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/app/projects/${projectId}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Project Overview</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleDownloadProject}>
          <Download className="h-4 w-4" /> Export Project
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader><CardTitle>Venture Score</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-primary">{Math.round(overallScore)}<span className="text-lg text-muted-foreground">/100</span></div>
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Validation</p>
                <p className="text-lg font-semibold">{scores.p1?.viability_score ?? "—"}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Execution</p>
                <p className="text-lg font-semibold">{scores.p2?.execution_score ?? "—"}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Growth</p>
                <p className="text-lg font-semibold">{scores.p3?.growth_score ?? "—"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Status */}
      <Card>
        <CardHeader><CardTitle>Phase Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "Phase 1 — Validation", status: p1Status, score: scores.p1?.viability_score, classification: scores.p1?.classification },
              { label: "Phase 2 — Execution", status: p2Status, score: scores.p2?.execution_score, classification: scores.p2?.classification },
              { label: "Phase 3 — Growth", status: p3Status, score: scores.p3?.growth_score, classification: scores.p3?.classification },
            ].map((phase) => (
              <div key={phase.label} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {phase.status === "locked" || phase.status === "complete"
                    ? <CheckCircle2 className="h-5 w-5 text-primary" />
                    : <Circle className="h-5 w-5 text-muted-foreground" />}
                  <span className="font-medium">{phase.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {phase.score != null && <span className="text-sm font-semibold">{phase.score}/100</span>}
                  {phase.classification && <Badge variant="outline" className="text-xs">{phase.classification}</Badge>}
                  {statusBadge(phase.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Linked Artifacts */}
      <Card>
        <CardHeader><CardTitle>Linked Artifacts</CardTitle></CardHeader>
        <CardContent>
          {artifacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No artifacts linked to this project yet. Use Product Studio tools and link them to this project.</p>
          ) : (
            <div className="space-y-3">
              {artifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  onClick={() => setModalArtifact(artifact)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {artifactIcon(artifact.type)}
                    <div>
                      <p className="text-sm font-medium">{artifact.title}</p>
                      <p className="text-xs text-muted-foreground">{artifact.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{artifact.status}</Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ArtifactModal
        open={!!modalArtifact}
        onOpenChange={(open) => !open && setModalArtifact(null)}
        artifact={modalArtifact}
      />
    </div>
  );
}
