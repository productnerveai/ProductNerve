import { useState, useEffect } from "react";
import { toast } from "sonner";
import ScoringProgressUI from "@/components/shared/ScoringProgressUI";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface Phase3ScoringProps {
  projectId: string;
  onScoringComplete: () => void;
}

export default function Phase3Scoring({ projectId, onScoringComplete }: Phase3ScoringProps) {
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
    // Simulate rate limiting (allow max 3 retries)
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
      // Get intake data from parent component or fetch from backend
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase3/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Phase 3 data');
      }

      const data = await response.json();
      const projectData = data.data;

      if (!projectData.intake_complete || !projectData.intake_data) {
        throw new Error('Intake data is required for scoring');
      }

      // Call real AI scoring service
      const scoringResponse = await fetch(`${API_BASE_URL}/validation/phase3-score`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          intake_data: projectData.intake_data,
          growth_mode: projectData.growth_mode || 'structured_growth'
        })
      });

      if (!scoringResponse.ok) {
        const error = await scoringResponse.json();
        throw new Error(error.error || 'Scoring failed');
      }

      const scoringData = await scoringResponse.json();
      
      setIsComplete(true);
      toast.success("Growth analysis complete!");
      onScoringComplete();
    } catch (e: any) {
      console.error("Phase 3 scoring error:", e);
      setShowRetry(true);
      setRegenAllowed(currentRetryCount < 2);
      toast.error("Analysis encountered an issue. You can retry or proceed.");
    }
    setIsScoring(false);
  };

  const handleRetry = () => {
    if (!regenAllowed) {
      toast.error("Regeneration limit reached for this phase.");
      setRegenAllowed(false);
      return;
    }
    runScoring(retryCount + 1);
  };

  return (
    <ScoringProgressUI
      title="Venture Acceleration Engine"
      subtitle="Analyzing your venture across 6 growth layers: Market Entry, Org Design, Demand, Conversion, Scale Control, and Scale Economics."
      icon="rocket"
      isScoring={isScoring}
      showRetry={showRetry}
      isComplete={isComplete}
      onRetry={handleRetry}
      canRetry={regenAllowed}
      retryTooltip="You've used your one regeneration for this phase."
    />
  );
}
