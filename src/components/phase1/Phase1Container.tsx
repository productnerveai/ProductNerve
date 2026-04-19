import { useEffect, useState } from "react";
import IntakeEngine from "./IntakeEngine";
import ScoringEngine from "./ScoringEngine";
import Phase1Dashboard from "./Phase1Dashboard";
import PhaseTransitionPrompt from "@/components/phase-transition/PhaseTransitionPrompt";
import PhaseFileUpload from "@/components/shared/PhaseFileUpload";
import { toast } from "sonner";

interface Phase1ContainerProps {
  projectId: string;
  onPhaseComplete?: () => void | Promise<void>;
}

// Dummy phase data
const dummyPhaseData = {
  proj1: {
    phase1_status: "complete",
    intake_complete: true,
    viability_score: 85,
    classification: "High Potential"
  },
  proj2: {
    phase1_status: "scoring",
    intake_complete: true,
    viability_score: null,
    classification: null
  },
  proj3: {
    phase1_status: "not_started",
    intake_complete: false,
    viability_score: null,
    classification: null
  }
};

export default function Phase1Container({ projectId, onPhaseComplete }: Phase1ContainerProps) {
  const [phase, setPhase] = useState<"loading" | "intake" | "upload" | "scoring" | "dashboard" | "transition">("loading");
  const [intakeData, setIntakeData] = useState<any>(null);
  const [phaseScore, setPhaseScore] = useState<number | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [rerunsUsed, setRerunsUsed] = useState(0);
  const [isProceeding, setIsProceeding] = useState(false);

  useEffect(() => { loadState(); }, [projectId]);

  const loadState = () => {
    // Simulate loading state
    setTimeout(() => {
      const projectData = dummyPhaseData[projectId as keyof typeof dummyPhaseData];
      if (!projectData) {
        setPhase("intake");
        return;
      }

      const status = projectData.phase1_status || "not_started";

      if (status === "complete" || status === "locked") {
        setPhaseScore(projectData.viability_score);
        setClassification(projectData.classification);
        setPhase("dashboard");
        return;
      }

      if (projectData.intake_complete) {
        // Dummy intake data
        setIntakeData({
          idea_description: "AI-powered productivity platform for remote teams",
          problem_statement: "Remote teams struggle with communication and project management",
          target_users: "Remote workers, team managers, freelancers",
          target_market: "SMB productivity tools market",
          monetization_model: "SaaS subscription",
          founder_background: "Tech industry veterans",
          core_assumptions: "Remote work is here to stay",
          follow_up_responses: { market_size: "Large" }
        });

        if (projectData.viability_score) {
          setPhaseScore(projectData.viability_score);
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
    setPhase("scoring");
  };

  const handleScoringComplete = () => {
    // Simulate scoring completion with dummy data
    setTimeout(() => {
      const dummyScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
      const dummyClassifications = ["High Potential", "Moderate Potential", "Early Stage"];
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
      toast.success("Phase 1 locked. Transitioning to Phase 2...");
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

  if (phase === "loading") {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (phase === "intake") {
    return <IntakeEngine projectId={projectId} onIntakeComplete={handleIntakeComplete} />;
  }

  if (phase === "upload") {
    return <PhaseFileUpload projectId={projectId} phase="phase1" onComplete={handleUploadDone} onSkip={handleUploadDone} />;
  }

  if (phase === "scoring") {
    return <ScoringEngine projectId={projectId} intakeData={intakeData} onScoringComplete={handleScoringComplete} />;
  }

  if (phase === "transition") {
    return (
      <PhaseTransitionPrompt
        currentPhase={1}
        phaseScore={phaseScore}
        classification={classification}
        onProceed={handleProceed}
        onRerun={handleRerun}
        rerunsUsed={rerunsUsed}
        isProceeding={isProceeding}
      />
    );
  }

  return <Phase1Dashboard projectId={projectId} onRerun={handleRerun} onLockProceed={handleLockFromDashboard} />;
}
