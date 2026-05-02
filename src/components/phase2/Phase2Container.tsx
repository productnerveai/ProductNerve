import { useEffect, useState } from "react";
import Phase2IntakeEngine from "./Phase2IntakeEngine";
import ModeSelection from "./ModeSelection";
import Phase2Scoring from "./Phase2Scoring";
import Phase2Dashboard from "./Phase2Dashboard";
import PhaseTransitionPrompt from "@/components/phase-transition/PhaseTransitionPrompt";
import PhaseFileUpload from "@/components/shared/PhaseFileUpload";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface Phase2ContainerProps {
  projectId: string;
  phase1Status: string;
  onPhaseComplete?: () => void | Promise<void>;
}


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

  const loadState = async () => {
    try {
      if (!isPhaseComplete(phase1Status)) {
        setPhase("locked");
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase2/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const projectData = data.data;
        
        const status = projectData.phase2_status || "not_started";
        
        console.log('Phase 2 state on load:', {
          status,
          intake_complete: projectData.intake_complete,
          execution_mode: projectData.execution_mode,
          execution_score: projectData.execution_score
        });

        if (status === "complete" || status === "locked") {
          setPhaseScore(projectData.execution_score);
          setClassification(projectData.execution_classification);
          setExecutionMode(projectData.execution_mode);
          setPhase("dashboard");
          return;
        }

        if (projectData.intake_complete) {
          setIntakeData(projectData.intake_data);
          
          // If execution mode is set, use it; otherwise go to mode selection
          if (projectData.execution_mode) {
            setExecutionMode(projectData.execution_mode);
            
            if (projectData.execution_score) {
              setPhaseScore(projectData.execution_score);
              setClassification(projectData.execution_classification);
              setPhase("dashboard");
            } else {
              setPhase("scoring");
            }
          } else {
            // Intake complete but no execution mode selected yet
            setPhase("mode_select");
          }
        } else {
          setPhase("intake");
        }
      } else {
        setPhase("intake");
      }
    } catch (error) {
      console.error('Failed to load Phase 2 state:', error);
      setPhase("intake");
    }
  };

  const handleIntakeComplete = async (data: any) => {
    setIntakeData(data);
    
    // Save intake data to backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase2/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intake_data: data
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save intake data');
      }
    } catch (error) {
      console.error('Error saving intake data:', error);
    }
    
    setPhase("upload");
  };

  const handleUploadDone = () => {
    setPhase("mode_select");
  };

  const handleModeSelected = (mode: string) => {
    setExecutionMode(mode);
    setPhase("scoring");
  };

  const handleScoringComplete = (scoreData: any) => {
    setPhaseScore(scoreData.execution_score);
    setClassification(scoreData.execution_classification);
    setPhase("transition");
  };

  const handleProceed = async () => {
    if (isProceeding) return;
    setIsProceeding(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase2/${projectId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Phase 2 locked. Transitioning to Phase 3...");
        if (onPhaseComplete) {
          onPhaseComplete();
        } else {
          setPhase("dashboard");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to lock Phase 2");
      }
    } catch (error) {
      console.error('Phase 2 lock error:', error);
      toast.error("Network error while locking Phase 2");
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
