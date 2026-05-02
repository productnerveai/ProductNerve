import { useState, useEffect } from "react";
import { toast } from "sonner";
import { safeScoringFetch } from "@/lib/scoring-utils";
import { checkRateLimit, recordAICall, canRegenerate, incrementRegenCount } from "@/lib/rate-limiter";
import ScoringProgressUI from "@/components/shared/ScoringProgressUI";

interface ScoringEngineProps {
  projectId: string;
  intakeData: any;
  onScoringComplete: (scoreData: any) => void;
}

export default function ScoringEngine({ projectId, intakeData, onScoringComplete }: ScoringEngineProps) {
  const [isScoring, setIsScoring] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [regenAllowed, setRegenAllowed] = useState(true);

  useEffect(() => {
    if (!autoStarted) {
      setAutoStarted(true);
      runScoring(0);
    }
  }, []);

  const runScoring = async (retryCount: number) => {
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      toast.error(rateCheck.reason);
      setShowRetry(true);
      return;
    }

    setIsScoring(true);
    setShowRetry(false);
    setIsComplete(false);
    recordAICall();

    try {
      const result = await safeScoringFetch(
        `/validation/phase1-score`,
        { intake_data: intakeData, project_id: projectId }
      );

      if (!result.ok) {
        throw new Error(result.error || "Scoring failed");
      }

      setIsComplete(true);
      toast.success("Venture scored successfully!");
      onScoringComplete(result.data);
    } catch (e: any) {
      if (retryCount < 1) {
        console.warn("Phase 1 scoring retry:", e.message);
        return runScoring(retryCount + 1);
      }

      console.error("Phase 1 scoring error:", e);
      setShowRetry(true);
      setRegenAllowed(canRegenerate(projectId, "phase1"));
      toast.error("Analysis encountered an issue. You can retry or proceed.");
    }
    setIsScoring(false);
  };

  const handleRetry = () => {
    if (!canRegenerate(projectId, "phase1")) {
      toast.error("Regeneration limit reached for this phase.");
      setRegenAllowed(false);
      return;
    }
    incrementRegenCount(projectId, "phase1");
    setRegenAllowed(canRegenerate(projectId, "phase1"));
    runScoring(0);
  };

  return (
    <ScoringProgressUI
      title="Venture Pressure Engine"
      subtitle="Analyzing your idea across 5 scoring layers, detecting risk flags, generating alternative routes, and classifying your venture."
      isScoring={isScoring}
      showRetry={showRetry}
      isComplete={isComplete}
      onRetry={handleRetry}
      canRetry={regenAllowed}
      retryTooltip="You've used your one regeneration for this phase."
    />
  );
}