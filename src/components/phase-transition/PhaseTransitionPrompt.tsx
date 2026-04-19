import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2, ArrowRight, RotateCcw, Rocket, Shield, Zap, Sparkles,
} from "lucide-react";

interface PhaseTransitionPromptProps {
  currentPhase: 1 | 2 | 3;
  phaseScore: number | null;
  classification: string | null;
  onProceed: () => void | Promise<void>;
  onRerun: () => void;
  rerunsUsed?: number;
  isProceeding?: boolean;
}

const PHASE_CONFIG = {
  1: {
    completedTitle: "Venture Validation Complete",
    completedSubtitle: "Your market viability has been assessed across 5 structural layers.",
    nextPhase: "Phase 2 — Execution Blueprint",
    nextDescription: "Design your execution architecture, team structure, capital plan, and build timeline.",
    icon: Shield,
    nextIcon: Zap,
    accentClass: "text-primary",
    bgClass: "bg-primary/5 border-primary/20",
    btnLabel: "Proceed to Execution Blueprint",
  },
  2: {
    completedTitle: "Execution Blueprint Complete",
    completedSubtitle: "Your build plan, resource model, and execution architecture are locked in.",
    nextPhase: "Phase 3 — GTM & Growth",
    nextDescription: "Design your go-to-market strategy, growth engine, and unit economics model.",
    icon: Zap,
    nextIcon: Rocket,
    accentClass: "text-accent",
    bgClass: "bg-accent/5 border-accent/20",
    btnLabel: "Proceed to Growth Blueprint",
  },
  3: {
    completedTitle: "Growth Blueprint Complete",
    completedSubtitle: "Your GTM strategy, growth engine, and scale triggers are finalized.",
    nextPhase: "Startup Summary Dashboard",
    nextDescription: "View your complete venture intelligence — composite score, verdict, risk matrix, and strategic narrative.",
    icon: Rocket,
    nextIcon: Sparkles,
    accentClass: "text-primary",
    bgClass: "bg-primary/5 border-primary/20",
    btnLabel: "View Venture Summary",
  },
};

const MAX_RERUNS = 2;

export default function PhaseTransitionPrompt({
  currentPhase,
  phaseScore,
  classification,
  onProceed,
  onRerun,
  rerunsUsed = 0,
  isProceeding = false,
}: PhaseTransitionPromptProps) {
  const [confirmed, setConfirmed] = useState(false);
  const config = PHASE_CONFIG[currentPhase];
  const Icon = config.icon;
  const NextIcon = config.nextIcon;
  const canRerun = rerunsUsed < MAX_RERUNS;

  const handleProceed = async () => {
    if (confirmed || isProceeding) return;
    setConfirmed(true);

    try {
      await onProceed();
    } catch {
      setConfirmed(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto py-8">
      <Card className={`border-2 ${config.bgClass} overflow-hidden`}>
        <CardContent className="p-8 space-y-6">
          {/* Completion badge */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${config.bgClass} flex items-center justify-center`}>
              <Icon className={`h-8 w-8 ${config.accentClass}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{config.completedTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1">{config.completedSubtitle}</p>
            </div>
          </div>

          {/* Score + Classification display */}
          {(phaseScore != null || classification) && (
            <div className="flex items-center justify-center gap-6">
              {phaseScore != null && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{Math.round(phaseScore)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Phase Score</p>
                </div>
              )}
              {classification && (
                <div className="text-center">
                  <p className="text-sm font-semibold">{classification}</p>
                  <p className="text-xs text-muted-foreground mt-1">Classification</p>
                </div>
              )}
            </div>
          )}

          {/* Satisfaction prompt */}
          <div className="rounded-xl bg-card border p-5 space-y-4">
            <p className="text-sm font-medium text-center">
              Are you satisfied with these results?
            </p>

            {!confirmed ? (
              <div className="space-y-3">
                {/* Next phase preview */}
                <div className="rounded-lg bg-muted/50 p-4 flex items-start gap-3">
                  <NextIcon className={`h-5 w-5 ${config.accentClass} shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-sm font-semibold">{config.nextPhase}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{config.nextDescription}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {canRerun && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={onRerun}
                      disabled={confirmed || isProceeding}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Re-run Analysis ({MAX_RERUNS - rerunsUsed} left)
                    </Button>
                  )}
                  <Button
                    variant="hero"
                    className="flex-1 gap-2"
                    onClick={handleProceed}
                    disabled={confirmed || isProceeding}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {config.btnLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 animate-in fade-in duration-300">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-primary">
                  Locking phase and confirming transition...
                </p>
                <div className="h-1 w-32 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary animate-pulse" style={{ width: "100%" }} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
