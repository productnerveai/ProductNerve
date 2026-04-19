import { useState, useEffect } from "react";
import { toast } from "sonner";
import ScoringProgressUI from "@/components/shared/ScoringProgressUI";

interface Phase2ScoringProps {
  projectId: string;
  executionMode: string;
  onScoringComplete: () => void;
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
      // Simulate scoring process with progress
      const scoringSteps = [
        "Analyzing team composition and capabilities...",
        "Evaluating capital structure and runway...",
        "Assessing technical complexity and feasibility...",
        "Reviewing speed vs stability trade-offs...",
        "Calculating execution readiness score..."
      ];

      for (let i = 0; i < scoringSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        // Could update progress UI here if needed
      }

      // Simulate occasional failure for demo purposes
      if (Math.random() < 0.2 && currentRetryCount < 2) {
        throw new Error("Simulated scoring error");
      }

      setIsComplete(true);
      toast.success("Execution analysis complete!");
      onScoringComplete();
    } catch (e: any) {
      console.error("Phase 2 scoring error:", e);
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
