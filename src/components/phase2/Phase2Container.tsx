import { useEffect, useState } from "react";
import Phase2IntakeEngine from "./Phase2IntakeEngine";
import ModeSelection from "./ModeSelection";
import Phase2Scoring from "./Phase2Scoring";
import Phase2Dashboard from "./Phase2Dashboard";
import PhaseTransitionPrompt from "@/components/phase-transition/PhaseTransitionPrompt";
import PhaseFileUpload from "@/components/shared/PhaseFileUpload";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Phase2ContainerProps {
  projectId: string;
  phase1Status: string;
  onPhaseComplete?: () => void | Promise<void>;
}

// Dummy phase data
const dummyPhaseData = {
  proj1: {
    phase2_status: "complete",
    intake_complete: true,
    execution_mode: "balanced",
    execution_score: 78,
    classification: "Good Execution"
  },
  proj2: {
    phase2_status: "scoring",
    intake_complete: true,
    execution_mode: "lean",
    execution_score: null,
    classification: null
  },
  proj3: {
    phase2_status: "not_started",
    intake_complete: false,
    execution_mode: null,
    execution_score: null,
    classification: null
  }
};

// Helper function to check if phase is complete
const isPhaseComplete = (status: string) => {
  return status === "complete" || status === "locked";
};

export default function Phase2Container({ projectId, phase1Status, onPhaseComplete }: Phase2ContainerProps) {
  const [phase, setPhase] = useState<"loading" | "locked" | "intake" | "upload" | "mode_select" | "scoring" | "dashboard" | "transition">("loading");
  const [executionMode, setExecutionMode] = useState<string>("");
  const [intakeData, setIntakeData] = useState<any>(null);
  const [phaseScore, setPhaseScore] = useState<number | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [rerunsUsed, setRerunsUsed] = useState(0);
  const [isProceeding, setIsProceeding] = useState(false);

  useEffect(() => { loadState(); }, [projectId, phase1Status]);

  const loadState = () => {
    // Simulate loading state
    setTimeout(() => {
      if (!isPhaseComplete(phase1Status)) {
        setPhase("locked");
        return;
      }

      const projectData = dummyPhaseData[projectId as keyof typeof dummyPhaseData];
      if (!projectData) {
        setPhase("intake");
        return;
      }

      const status = projectData.phase2_status || "not_started";

      if (status === "complete" || status === "locked") {
        setPhaseScore(projectData.execution_score);
        setClassification(projectData.classification);
        setExecutionMode(projectData.execution_mode);
        setPhase("dashboard");
        return;
      }

      if (projectData.intake_complete) {
        // Dummy intake data
        setIntakeData({
          commitment_level: "high",
          capital_range: "100k-500k",
          funding_expected: true,
          team_capabilities: ["engineering", "product"],
          technical_complexity: "medium",
          speed_vs_stability: "balanced",
          validation_objective: "product-market-fit",
          risk_appetite: "moderate",
          operational_capacity: "medium",
          revenue_urgency: "medium",
          scalability_intent: "moderate",
          follow_up_responses: { recommended_execution_mode: "balanced" }
        });

        setExecutionMode(projectData.execution_mode);

        if (projectData.execution_score) {
          setPhaseScore(projectData.execution_score);
          setClassification(projectData.classification);
          setPhase("dashboard");
        } else {
          setPhase("scoring");
        }
      } else {
        setPhase("intake");
      }
    }, 1000);
  };

  const handleIntakeComplete = (data: any) => {
    setIntakeData(data);
    setPhase("upload");
  };

  const handleUploadDone = () => {
    setPhase("mode_select");
  };

  const handleModeSelected = (mode: string) => {
    setExecutionMode(mode);
    setPhase("scoring");
  };

  const handleScoringComplete = () => {
    // Simulate scoring completion with dummy data
    setTimeout(() => {
      const dummyScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
      const dummyClassifications = ["Good Execution", "Solid Execution", "Early Stage"];
      const dummyClassification = dummyClassifications[Math.floor(Math.random() * dummyClassifications.length)];
      
      setPhaseScore(dummyScore);
      setClassification(dummyClassification);
      setPhase("transition");
    }, 2000);
  };

  const handleProceed = () => {
    if (isProceeding) return;
    setIsProceeding(true);

    // Simulate phase locking
    setTimeout(() => {
      toast.success("Phase 2 locked. Transitioning to Phase 3...");
      if (onPhaseComplete) {
        onPhaseComplete();
      } else {
        setPhase("dashboard");
      }
      setIsProceeding(false);
    }, 2000);
  };

  const handleRerun = () => {
    setRerunsUsed(prev => prev + 1);
    setPhase("scoring");
  };

  const handleLockFromDashboard = () => {
    setPhase("transition");
  };

  if (phase === "loading") return <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  if (phase === "locked") return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold">Phase 1 Required</h3>
      <p className="text-sm text-muted-foreground max-w-sm">Complete the Venture Pressure Engine (Phase 1) before starting the Execution Blueprint.</p>
    </div>
  );

  if (phase === "intake") return <Phase2IntakeEngine projectId={projectId} onIntakeComplete={handleIntakeComplete} />;
  if (phase === "upload") return <PhaseFileUpload projectId={projectId} phase="phase2" onComplete={handleUploadDone} onSkip={handleUploadDone} />;
  if (phase === "mode_select") return <ModeSelection projectId={projectId} onModeSelected={handleModeSelected} recommendedMode={intakeData?.follow_up_responses?.recommended_execution_mode} />;
  if (phase === "scoring") return <Phase2Scoring projectId={projectId} executionMode={executionMode} onScoringComplete={handleScoringComplete} />;

  if (phase === "transition") {
    return (
      <PhaseTransitionPrompt
        currentPhase={2}
        phaseScore={phaseScore}
        classification={classification}
        onProceed={handleProceed}
        onRerun={handleRerun}
        rerunsUsed={rerunsUsed}
        isProceeding={isProceeding}
      />
    );
  }

  return <Phase2Dashboard projectId={projectId} onRerun={handleRerun} onLockProceed={handleLockFromDashboard} />;
}
