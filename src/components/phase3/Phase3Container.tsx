import { useEffect, useState } from "react";
import Phase3IntakeEngine from "./Phase3IntakeEngine";
import Phase3Scoring from "./Phase3Scoring";
import Phase3Dashboard from "./Phase3Dashboard";
import PhaseTransitionPrompt from "@/components/phase-transition/PhaseTransitionPrompt";
import PhaseFileUpload from "@/components/shared/PhaseFileUpload";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface Phase3ContainerProps {
  projectId: string;
  phase2Status: string;
  onPhaseComplete?: () => void | Promise<void>;
}


// Helper function to check if phase is complete
const isPhaseComplete = (status: string) => {
  return status === "complete" || status === "locked";
};

export default function Phase3Container({ projectId, phase2Status, onPhaseComplete }: Phase3ContainerProps) {
  const [phase, setPhase] = useState<"loading" | "locked" | "intake" | "upload" | "scoring" | "dashboard" | "transition">("loading");
  const [intakeData, setIntakeData] = useState<any>(null);
  const [phaseScore, setPhaseScore] = useState<number | null>(null);
  const [classification, setClassification] = useState<string | null>(null);
  const [rerunsUsed, setRerunsUsed] = useState(0);
  const [isProceeding, setIsProceeding] = useState(false);

  useEffect(() => { loadState(); }, [projectId, phase2Status]);

  const loadState = async () => {
    try {
      if (!isPhaseComplete(phase2Status)) {
        setPhase("locked");
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase3/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const projectData = data.data;

        if (projectData.phase3_status === 'not_started') {
          setPhase("intake");
          return;
        }

        if (projectData.phase3_status === 'complete' || projectData.phase3_status === 'locked') {
          setPhaseScore(projectData.growth_score);
          setClassification(projectData.growth_classification);
          setPhase("dashboard");
          return;
        }

        if (!projectData.intake_complete) {
          setPhase("intake");
          return;
        }

        if (projectData.growth_score) {
          setPhaseScore(projectData.growth_score);
          setClassification(projectData.growth_classification);
          setPhase("dashboard");
          return;
        }

        setPhase("scoring");
      } else {
        setPhase("intake");
      }
    } catch (error) {
      console.error('Failed to load Phase 3 state:', error);
      setPhase("intake");
    }
  };

  const handleIntakeComplete = async (data: any) => {
    setIntakeData(data);
    
    // Save intake data to backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase3/${projectId}`, {
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

  const confirmLock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase3/${projectId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Phase 3 locked. Opening Venture Summary...");
        if (onPhaseComplete) {
          onPhaseComplete();
        } else {
          setPhase("dashboard");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to lock Phase 3");
      }
    } catch (error) {
      console.error('Phase 3 lock error:', error);
      toast.error("Network error while locking Phase 3");
    }
  };

  const handleProceed = () => {
    if (isProceeding) return;
    setIsProceeding(true);
    confirmLock();
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
