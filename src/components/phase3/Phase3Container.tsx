import { useEffect, useState } from "react";
import Phase3IntakeEngine from "./Phase3IntakeEngine";
import Phase3Scoring from "./Phase3Scoring";
import Phase3Dashboard from "./Phase3Dashboard";
import PhaseTransitionPrompt from "@/components/phase-transition/PhaseTransitionPrompt";
import PhaseFileUpload from "@/components/shared/PhaseFileUpload";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Phase3ContainerProps {
  projectId: string;
  phase2Status: string;
  onPhaseComplete?: () => void | Promise<void>;
}

// Dummy phase data
const dummyPhaseData = {
  proj1: {
    phase3_status: "complete",
    intake_complete: true,
    growth_score: 82,
    classification: "Strong Growth"
  },
  proj2: {
    phase3_status: "scoring",
    intake_complete: true,
    growth_score: null,
    classification: null
  },
  proj3: {
    phase3_status: "not_started",
    intake_complete: false,
    growth_score: null,
    classification: null
  }
};

// Helper function to check if phase is complete
const isPhaseComplete = (status: string) => {
  return status === "complete" || status === "locked";
};

export default function Phase3Container({ projectId, phase2Status, onPhaseComplete }: Phase3ContainerProps) {
  const [phase, setPhase] = useState<"loading" | "locked" | "intake" | "upload" | "scoring" | "dashboard" | "transition">("loading");
  const [phaseScore, setPhaseScore] = useState<number | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [rerunsUsed, setRerunsUsed] = useState(0);
  const [isProceeding, setIsProceeding] = useState(false);

  useEffect(() => { loadState(); }, [projectId, phase2Status]);

  const loadState = () => {
    // Simulate loading state
    setTimeout(() => {
      if (!isPhaseComplete(phase2Status)) { 
        setPhase("locked"); 
        return; 
      }

      const projectData = dummyPhaseData[projectId as keyof typeof dummyPhaseData];
      if (!projectData) {
        setPhase("intake");
        return;
      }

      const status = projectData.phase3_status || "not_started";

      if (status === "complete" || status === "locked") { 
        setPhaseScore(projectData.growth_score);
        setClassification(projectData.classification);
        setPhase("dashboard"); 
        return; 
      }

      if (!projectData.intake_complete) {
        setPhase("intake");
        return;
      }

      if (projectData.growth_score) {
        setPhaseScore(projectData.growth_score);
        setClassification(projectData.classification);
        setPhase("dashboard");
        return;
      }

      setPhase("scoring");
    }, 1000);
  };

  const handleIntakeComplete = () => {
    setPhase("upload");
  };

  const handleUploadDone = () => {
    setPhase("scoring");
  };

  const handleScoringComplete = () => {
    // Simulate scoring completion with dummy data
    setTimeout(() => {
      const dummyScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
      const dummyClassifications = ["Strong Growth", "Moderate Growth", "High Potential"];
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
      toast.success("Phase 3 locked. Opening Venture Summary...");
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
      <h3 className="text-lg font-semibold">Phase 2 Required</h3>
      <p className="text-sm text-muted-foreground max-w-sm">Complete the Venture Construction Engine (Phase 2) before starting the GTM & Growth Blueprint.</p>
    </div>
  );

  if (phase === "intake") return <Phase3IntakeEngine projectId={projectId} onIntakeComplete={handleIntakeComplete} />;
  if (phase === "upload") return <PhaseFileUpload projectId={projectId} phase="phase3" onComplete={handleUploadDone} onSkip={handleUploadDone} />;
  if (phase === "scoring") return <Phase3Scoring projectId={projectId} onScoringComplete={handleScoringComplete} />;

  if (phase === "transition") {
    return (
      <PhaseTransitionPrompt
        currentPhase={3}
        phaseScore={phaseScore}
        classification={classification}
        onProceed={handleProceed}
        onRerun={handleRerun}
        rerunsUsed={rerunsUsed}
        isProceeding={isProceeding}
      />
    );
  }

  return <Phase3Dashboard projectId={projectId} onRerun={handleRerun} onLockProceed={handleLockFromDashboard} />;
}
