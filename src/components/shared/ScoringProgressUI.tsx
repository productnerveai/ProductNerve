import { useState, useEffect, useRef } from "react";
import { Zap, Rocket, RotateCcw, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const STAGES = [
  "Initializing analysis engine…",
  "Decomposing venture structure…",
  "Evaluating problem strength…",
  "Analyzing market dynamics…",
  "Assessing economic viability…",
  "Mapping competitive landscape…",
  "Scoring founder leverage…",
  "Running risk analysis…",
  "Computing final scores…",
  "Saving results…",
];

interface ScoringProgressUIProps {
  title: string;
  subtitle: string;
  icon?: "zap" | "rocket";
  isScoring: boolean;
  showRetry: boolean;
  isComplete: boolean;
  onRetry: () => void;
  canRetry?: boolean;
  retryTooltip?: string;
}

export default function ScoringProgressUI({
  title,
  subtitle,
  icon = "zap",
  isScoring,
  showRetry,
  isComplete,
  onRetry,
  canRetry = true,
  retryTooltip,
}: ScoringProgressUIProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isScoring) {
      setStageIndex(0);
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
        setProgress((prev) => Math.min(prev + 10, 92));
      }, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (isComplete) setProgress(100);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isScoring, isComplete]);

  const Icon = icon === "rocket" ? Rocket : Zap;

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Icon className="h-8 w-8 text-accent" />
      </div>
      <div className="text-center max-w-md">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-1">{subtitle}</p>
      </div>

      {isScoring && (
        <div className="w-full max-w-xs space-y-3">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center animate-in fade-in duration-300" key={stageIndex}>
            {STAGES[stageIndex]}
          </p>
        </div>
      )}

      {!isScoring && isComplete && (
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Analysis complete</span>
        </div>
      )}

      {showRetry && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Analysis took longer than expected.</p>
          {canRetry ? (
            <div className="flex items-center gap-2">
              <Button onClick={onRetry} variant="hero" size="lg" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Retry Analysis
              </Button>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>You can regenerate once per phase</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              <span className="text-sm">{retryTooltip || "Regeneration limit reached for this phase."}</span>
            </div>
          )}
        </div>
      )}

      {isScoring && (
        <p className="text-xs text-muted-foreground">This may take up to a minute for complex ventures.</p>
      )}
    </div>
  );
}
