import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileDown, CheckCircle2, Circle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Phase1Container from "@/components/phase1/Phase1Container";
import Phase2Container from "@/components/phase2/Phase2Container";
import Phase3Container from "@/components/phase3/Phase3Container";
import MasterVentureDashboard from "@/components/dashboard/MasterVentureDashboard";
import PaywallModal from "@/components/billing/PaywallModal";
import { useProject } from "@/contexts/ProjectContext";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const { getProject } = useProject();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("phase1");
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Dummy access control
  const hasAccess = true;
  const accessLoading = false;

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  // Handle payment callback
  useEffect(() => {
    const payment = searchParams.get("payment");
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (payment === "success" && reference) {
      verifyPayment(reference);
    }

    // Deep-link into paywall
    if (searchParams.get("paywall") === "1") {
      setShowPaywall(true);
    }
  }, [searchParams]);

  const verifyPayment = async (_reference: string) => {
    // Payments disabled — coming soon
    toast.info("Payments will be activated shortly.");
  };

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await getProject(projectId!);
      if (data) {
        setProject(data);
        const p1 = data.phase1_status || "not_started";
        const p2 = data.phase2_status || "not_started";
        const p3 = data.phase3_status || "not_started";

        if (p3 === "locked" || p3 === "complete") {
          setActiveTab("dashboard");
        } else if (p2 === "locked" || p2 === "complete") {
          setActiveTab("phase3");
        } else if (p1 === "locked" || p1 === "complete") {
          setActiveTab("phase2");
        } else {
          setActiveTab("phase1");
        }
      } else {
        toast.error("Project not found");
      }
    } catch (error) {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!hasAccess) {
      setShowPaywall(true);
      return;
    }
    toast.loading("Generating venture blueprint...", { id: "pdf" });
    
    // Simulate PDF generation
    setTimeout(() => {
      const dummyHtml = `
        <html>
          <head><title>${project?.name} - Venture Blueprint</title></head>
          <body>
            <h1>${project?.name}</h1>
            <p>Venture Score: ${project?.overall_score || 'N/A'}</p>
            <p>Phase 1: ${project?.phase1_status}</p>
            <p>Phase 2: ${project?.phase2_status}</p>
            <p>Phase 3: ${project?.phase3_status}</p>
          </body>
        </html>
      `;
      
      const win = window.open("", "_blank");
      if (win) { 
        win.document.write(dummyHtml); 
        win.document.close(); 
        setTimeout(() => win.print(), 500); 
      }
      toast.success("Blueprint generated! Use Print > Save as PDF", { id: "pdf" });
    }, 2000);
  };

  const handleDashboardAccess = () => {
    if (!hasAccess) {
      setShowPaywall(true);
      return;
    }
    setActiveTab("dashboard");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-16 text-muted-foreground">Project not found.</div>;

  const p1 = project.phase1_status || "not_started";
  const p2 = project.phase2_status || "not_started";
  const p3 = project.phase3_status || "not_started";

  const isP1Done = p1 === "locked" || p1 === "complete";
  const isP2Done = p2 === "locked" || p2 === "complete";
  const isP3Done = p3 === "locked" || p3 === "complete";

  const phaseSteps = [
    { key: "phase1", label: "Validation", done: isP1Done },
    { key: "phase2", label: "Execution", done: isP2Done },
    { key: "phase3", label: "Growth", done: isP3Done },
    { key: "dashboard", label: "Summary", done: isP3Done, locked: !hasAccess && isP3Done },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">{project.name}</h1></div>
        <div className="flex items-center gap-2">
          <Link to={`/app/projects/${projectId}/overview`}>
            <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" /> Overview</Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={handleExportPDF}><FileDown className="h-4 w-4" /> Export PDF</Button>
        </div>
      </div>

      {/* Phase progress stepper */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto">
        {phaseSteps.map((step, i) => {
          const isActive = activeTab === step.key;
          const isAccessible = step.key === "phase1"
            || (step.key === "phase2" && isP1Done)
            || (step.key === "phase3" && isP2Done)
            || (step.key === "dashboard" && isP3Done);

          return (
            <button
              key={step.key}
              onClick={() => {
                if (!isAccessible) return;
                if (step.key === "dashboard" && !hasAccess) {
                  setShowPaywall(true);
                  return;
                }
                setActiveTab(step.key);
              }}
              disabled={!isAccessible}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive ? "bg-primary text-primary-foreground shadow-sm" : ""}
                ${!isActive && isAccessible ? "bg-muted/50 text-foreground hover:bg-muted cursor-pointer" : ""}
                ${!isAccessible ? "text-muted-foreground/50 cursor-not-allowed" : ""}
              `}
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              <span className="whitespace-nowrap">{step.label}</span>
              {"locked" in step && step.locked && <span className="text-[10px] opacity-60">🔒</span>}
              {i < phaseSteps.length - 1 && (
                <span className={`ml-2 text-xs ${step.done ? "text-primary" : "text-muted-foreground/30"}`}>→</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "phase1" && (
          <Phase1Container
            projectId={projectId!}
            onPhaseComplete={() => {
              // Simulate phase completion
              setProject(prev => prev ? { ...prev, phase1_status: "complete" } : null);
              setActiveTab("phase2");
            }}
          />
        )}
        {activeTab === "phase2" && (
          <Phase2Container
            projectId={projectId!}
            phase1Status={p1}
            onPhaseComplete={() => {
              // Simulate phase completion
              setProject(prev => prev ? { ...prev, phase2_status: "complete" } : null);
              setActiveTab("phase3");
            }}
          />
        )}
        {activeTab === "phase3" && (
          <Phase3Container
            projectId={projectId!}
            phase2Status={p2}
            onPhaseComplete={() => {
              // Simulate phase completion
              setProject(prev => prev ? { ...prev, phase3_status: "complete" } : null);
              
              if (hasAccess) {
                setActiveTab("dashboard");
              } else {
                setShowPaywall(true);
              }
            }}
          />
        )}
        {activeTab === "dashboard" && hasAccess && (
          <MasterVentureDashboard project={project} onExportPDF={handleExportPDF} />
        )}
      </div>

      {showPaywall && (
        <PaywallModal
          projectId={projectId!}
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false);
            loadProject();
            setActiveTab("dashboard");
          }}
        />
      )}
    </div>
  );
}
