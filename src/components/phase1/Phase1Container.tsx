import { useEffect, useState } from "react";
import IntakeEngine from "./IntakeEngine";
import ScoringEngine from "./ScoringEngine";
import Phase1Dashboard from "./Phase1Dashboard";
import PhaseTransitionPrompt from "@/components/phase-transition/PhaseTransitionPrompt";
import PhaseFileUpload from "@/components/shared/PhaseFileUpload";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface Phase1ContainerProps {
  projectId: string;
  onPhaseComplete?: () => void | Promise<void>;
}

export default function Phase1Container({ projectId, onPhaseComplete }: Phase1ContainerProps) {
  const [phase, setPhase] = useState<"loading" | "intake" | "upload" | "scoring" | "dashboard" | "transition">("loading");
  const [intakeData, setIntakeData] = useState<any>(null);
  const [phaseScore, setPhaseScore] = useState<number | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [rerunsUsed, setRerunsUsed] = useState(0);
  const [isProceeding, setIsProceeding] = useState(false);

  useEffect(() => { loadState(); }, [projectId]);

  const loadState = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase1/${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const projectData = data.data;
        
        const status = projectData.phase1_status || "not_started";

        if (status === "complete" || status === "locked") {
          setPhaseScore(projectData.phase1_score);
          setClassification(projectData.phase1_classification);
          setPhase("dashboard");
          return;
        }

        if (status === "in_progress" && projectData.phase1_data) {
          setIntakeData(projectData.phase1_data);

          if (projectData.phase1_score) {
            setPhaseScore(projectData.phase1_score);
            setClassification(projectData.phase1_classification);
            setPhase("dashboard");
          } else {
            // Check if upload was completed by looking for a flag or data
            // For now, we'll assume upload is needed if no score exists
            setPhase("upload");
          }
        } else {
          setPhase("intake");
        }
      } else {
        // If API fails, default to intake
        setPhase("intake");
      }
    } catch (error) {
      console.error('Failed to load Phase 1 state:', error);
      setPhase("intake");
    }
  };

  const handleIntakeComplete = async (data: any) => {
    setIntakeData(data);
    
    // Save intake data to backend for persistence
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase1/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phase1_status: 'in_progress',
          phase1_data: data
        })
      });
      
      if (response.ok) {
        console.log('Intake data saved successfully');
      }
    } catch (error) {
      console.error('Failed to save intake data:', error);
    }
    
    setPhase("upload");
  };

  const handleUploadDone = () => {
    setPhase("scoring");
  };

  const handleScoringComplete = (scoreData: any) => {
    setPhaseScore(scoreData.viability_score);
    setClassification(scoreData.classification);
    setPhase("transition");
  };

  const handleProceed = async () => {
    if (isProceeding) return;
    setIsProceeding(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase1/${projectId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Phase 1 locked. Transitioning to Phase 2...");
        if (onPhaseComplete) {
          onPhaseComplete();
        } else {
          setPhase("dashboard");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to lock Phase 1");
      }
    } catch (error) {
      toast.error("Network error while locking Phase 1");
    } finally {
      setIsProceeding(false);
    }
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