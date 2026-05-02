import { useState, useEffect } from "react";
import { toast } from "sonner";
import ScoringProgressUI from "@/components/shared/ScoringProgressUI";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface Phase2ScoringProps {
  projectId: string;
  executionMode: string;
  onScoringComplete: (scoreData: any) => void; // pass score data up
}

export default function Phase2Scoring({ projectId, executionMode, onScoringComplete }: Phase2ScoringProps) {
  const [isScoring, setIsScoring] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [regenAllowed, setRegenAllowed] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!autoStarted) {
      setAutoStarted(true);
      runScoring(0);
    }
  }, []);

  const runScoring = async (currentRetryCount: number) => {
    if (currentRetryCount >= 3) {
      toast.error("Maximum retry attempts reached.");
      setShowRetry(true);
      setRegenAllowed(false);
      return;
    }

    setIsScoring(true);
    setShowRetry(false);
    setIsComplete(false);
    setRetryCount(currentRetryCount);

    try {
      // Retrieve intake data from localStorage (saved by Phase2IntakeEngine via autosave)
      // OR pass it as a prop — see Phase2Container fix below
      const token = localStorage.getItem('token');

      // First fetch current phase2 data to get intake_data
      const stateRes = await fetch(`${API_BASE_URL}/validation/phase2/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!stateRes.ok) throw new Error('Failed to fetch phase 2 state');
      const stateData = await stateRes.json();
      const intakeData = stateData.data?.intake_data;

      if (!intakeData) throw new Error('Intake data not found. Please complete the intake first.');

      // Now call the scoring API
      const response = await fetch(`${API_BASE_URL}/validation/phase2-score`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intake_data: intakeData,
          execution_mode: executionMode,
          project_id: projectId
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Scoring API failed');
      }

      const data = await response.json();
      setIsComplete(true);
      toast.success("Execution analysis complete!");
      onScoringComplete(data.data);

    } catch (e: any) {
      console.error("Phase 2 scoring error:", e);
      setShowRetry(true);
      setRegenAllowed(currentRetryCount < 2);
      toast.error(e.message || "Analysis encountered an issue. You can retry.");
    } finally {
      setIsScoring(false);
    }
  };

  const handleRetry = () => {
    if (!regenAllowed) {
      toast.error("Regeneration limit reached for this phase.");
      return;
    }
    runScoring(retryCount + 1);
  };

  const modeLabels: Record<string, string> = {
    ai_development: "AI Development Mode",
    ai_lean: "AI-Lean Mode",
    lean_product: "Lean Product Team Mode",
    lean_team: "Lean Team Mode",
    structured_startup: "Structured Startup Mode",
    advanced_build: "Advanced Build Mode",
    venture_backed: "Venture-Backed Mode",
  };

  return (
    <ScoringProgressUI
      title="Venture Construction Engine"
      subtitle={`Analyzing your venture across 5 execution layers using ${modeLabels[executionMode] || executionMode}.`}
      isScoring={isScoring}
      showRetry={showRetry}
      isComplete={isComplete}
      onRetry={handleRetry}
      canRetry={regenAllowed}
      retryTooltip="You've used your one regeneration for this phase."
    />
  );
}
