import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  FileDown, RotateCcw, Lock, ArrowRight, AlertTriangle, CheckCircle2, XCircle,
  DollarSign, Clock, Users, Wrench, TrendingUp, Zap, Target, Shield,
  Layers, Brain, Rocket, BarChart3, Eye, HelpCircle, Briefcase, ArrowUpRight,
  Activity, Crosshair, Scale, GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import { ScoreTooltip, getLayerTooltip } from "@/components/ui/score-tooltip";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface Phase2DashboardProps {
  projectId: string;
  onRerun: () => void;
  onLockProceed?: () => void;
}

const severityColor = (s: string) => {
  const sl = s?.toLowerCase();
  if (sl === "low") return "bg-green-100 text-green-800 border-green-200";
  if (sl === "moderate" || sl === "medium" || sl === "moderate-high") return "bg-amber-100 text-amber-800 border-amber-200";
  if (sl === "high" || sl === "critical") return "bg-red-100 text-red-800 border-red-200";
  return "bg-muted text-muted-foreground";
};

const tierColor = (t: string) => {
  const tl = t?.toLowerCase();
  if (tl?.includes("ready") || tl?.includes("aligned") || tl?.includes("self-") || tl?.includes("realistic") || tl === "low" || tl === "simple" || tl === "enterprise" || tl === "high" || tl === "strong") return "bg-green-100 text-green-800";
  if (tl?.includes("fragile") || tl?.includes("constrained") || tl?.includes("mildly") || tl?.includes("contractor") || tl?.includes("optimistic") || tl === "moderate" || tl === "limited") return "bg-amber-100 text-amber-800";
  if (tl?.includes("premature") || tl?.includes("severely") || tl?.includes("unrealistic") || tl?.includes("high burn") || tl?.includes("high execution") || tl === "complex") return "bg-red-100 text-red-800";
  return "bg-muted text-muted-foreground";
};

const classColor = (c: string) => {
  if (c === "Execution Ready") return "text-green-600 bg-green-50 border-green-200";
  if (c === "Structurally Sound but Resource Sensitive") return "text-blue-600 bg-blue-50 border-blue-200";
  if (c === "Structured but Fragile" || c === "Fragile Execution") return "text-amber-600 bg-amber-50 border-amber-200";
  if (c === "Resource-Constrained" || c === "High Execution Risk") return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const classIcon = (c: string) => {
  if (c === "Execution Ready") return <CheckCircle2 className="h-5 w-5" />;
  if (c === "Structurally Sound but Resource Sensitive") return <TrendingUp className="h-5 w-5" />;
  if (c === "Fragile Execution" || c === "Structured but Fragile") return <AlertTriangle className="h-5 w-5" />;
  if (c === "High Execution Risk" || c === "Resource-Constrained") return <AlertTriangle className="h-5 w-5" />;
  return <XCircle className="h-5 w-5" />;
};

const getBarColor = (s: number) => s >= 70 ? "hsl(var(--primary))" : s >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))";

const fmt = (n: any) => {
  const v = Number(n);
  if (isNaN(v) || v === 0) return "$0";
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

const modeLabel: Record<string, string> = {
  ai_development: "AI Development",
  ai_lean: "AI-Lean",
  lean_product: "Lean Product Team",
  lean_team: "Lean Team",
  structured_startup: "Structured Startup",
  advanced_build: "Advanced Build",
  venture_backed: "Venture-Backed",
};


export default function Phase2Dashboard({ projectId, onRerun, onLockProceed }: Phase2DashboardProps) {
  const [scores, setScores] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLockModal, setShowLockModal] = useState(false);
  const [activeStack, setActiveStack] = useState<string>("option_a");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/validation/phase2/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const projectData = data.data;

          console.log('Phase2Dashboard - Raw projectData:', projectData);

          if (projectData.phase2_status === 'not_started') {
            setScores(null);
            setLoading(false);
            return;
          }

          // Transform data to match expected structure
          const transformedData = {
            execution_score: projectData.execution_score,
            classification: projectData.execution_classification,
            execution_mode: projectData.execution_mode ||
              projectData.phase2_analysis?.execution_mode ||
              projectData.phase2_execution_data?.execution_mode,

            // Pull from execution_confidence
            build_confidence_overall: projectData.phase2_analysis?.execution_confidence?.overall,
            team_clarity: projectData.phase2_analysis?.execution_confidence?.team_clarity,
            capital_adequacy: projectData.phase2_analysis?.execution_confidence?.capital_adequacy,

            // Pull from executive_summary
            action_directive: projectData.phase2_analysis?.executive_summary?.action_directive,
            execution_risk_level: projectData.phase2_analysis?.executive_summary?.execution_risk_level,
            action_summary: projectData.phase2_analysis?.executive_summary?.action_summary,
            primary_constraint: projectData.phase2_analysis?.executive_summary?.primary_execution_constraint,
            execution_maturity_tier: projectData.phase2_analysis?.executive_summary?.execution_maturity_tier,

            // Pillar scores
            team_score: projectData.phase2_analysis?.scoring_audit?.pillar_scores?.team_composition?.score,
            capital_score: projectData.phase2_analysis?.scoring_audit?.pillar_scores?.capital_efficiency?.score,
            speed_score: projectData.phase2_analysis?.scoring_audit?.pillar_scores?.speed_vs_stability?.score,
            validation_score: projectData.phase2_analysis?.scoring_audit?.pillar_scores?.validation_approach?.score,

            // Scoring audit extras
            final_execution_score: projectData.phase2_analysis?.scoring_audit?.final_score,
            score_after_caps: projectData.phase2_analysis?.scoring_audit?.score_after_caps,
            risk_penalty: projectData.phase2_analysis?.scoring_audit?.risk_penalty,
            maturity_boost: projectData.phase2_analysis?.scoring_audit?.maturity_boost,
            confidence_index: projectData.phase2_analysis?.scoring_audit?.confidence_index,
            hard_caps_applied: projectData.phase2_analysis?.scoring_audit?.hard_caps_applied,

            execution_blueprint: projectData.phase2_analysis
          };

          console.log('Phase2Dashboard - Transformed data:', transformedData);
          const pillarScores = projectData.phase2_analysis?.scoring_audit?.pillar_scores;
          console.log('Phase2Dashboard - Pillar scores structure:', pillarScores);
          console.log('Phase2Dashboard - All pillar scores:', {
            team_composition: pillarScores?.team_composition?.score,
            capital_efficiency: pillarScores?.capital_efficiency?.score,
            technical_complexity: pillarScores?.technical_complexity?.score,
            speed_vs_stability: pillarScores?.speed_vs_stability?.score,
            validation_approach: pillarScores?.validation_approach?.score,
            operational_capacity: pillarScores?.operational_capacity?.score,
            execution_commitment: pillarScores?.execution_commitment?.score
          });
          console.log('Phase2Dashboard - Final scores object:', transformedData);
          console.log('Phase2Dashboard - Execution score:', transformedData.execution_score);
          console.log('Phase2Dashboard - Classification:', transformedData.classification);
          setScores(transformedData);
        } else {
          setScores(null);
        }
      } catch (error) {
        console.error('Failed to load Phase 2 dashboard data:', error);
        setScores(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const confirmLock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase2/${projectId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setShowLockModal(false);
        toast.success("Phase 2 locked. Navigating to Phase 3...");
        onLockProceed?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to lock Phase 2");
      }
    } catch (error) {
      console.error('Phase 2 lock error:', error);
      toast.error("Network error while locking Phase 2");
    }
  };

  console.log('Phase2Dashboard - Conditional checks:', { loading, scores: !!scores, execution_score: scores?.execution_score });
  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!scores) return <div className="text-center py-16 text-muted-foreground">No scoring data yet.</div>;

  const report = (scores.execution_blueprint as any) || {};
  const exec = report.executive_summary || {};
  const modeArch = report.mode_architecture || {};
  const buildLogic = report.strategic_build_logic || {};
  const productArch = report.product_architecture || {};
  const featurePrio = report.feature_prioritization || {};
  const execArch = report.execution_architecture || {};
  const teamStruct = execArch.team_structure || report.team_structure || {};
  const toolStack = report.tool_stack || {};
  const capitalArch = report.capital_architecture || {};
  const timeline = report.execution_timeline || execArch.development_approach?.milestones || [];
  const riskClusters = report.risk_clusters || {};
  const readinessGaps = report.build_readiness_gaps || [];
  const investorSnap = report.investor_snapshot || {};
  const riskMitigation = execArch.risk_mitigation || {};
  const executionRoadmap = report.execution_roadmap || {};
  const reasoning = report.reasoning_trace || {};
  const audit = report.scoring_audit || {};

  const layerData = audit.pillar_scores ? [
    { layer: "Team", score: Number(audit.pillar_scores.team_composition?.score || 0) * 5, weight: "20%" },
    { layer: "Capital", score: Number(audit.pillar_scores.capital_efficiency?.score || 0) * 5, weight: "20%" },
    { layer: "Technical", score: Number(audit.pillar_scores.technical_complexity?.score || 0) * 5, weight: "20%" },
    { layer: "Validation", score: Number(audit.pillar_scores.validation_approach?.score || 0) * 5, weight: "20%" },
    { layer: "Commitment", score: Number(audit.pillar_scores.execution_commitment?.score || 0) * 5, weight: "20%" },
  ] : [];

  const pillarData = audit.pillar_scores ? [
    { name: "Team Composition", ...audit.pillar_scores.team_composition },
    { name: "Capital Efficiency", ...audit.pillar_scores.capital_efficiency },
    { name: "Technical Complexity", ...audit.pillar_scores.technical_complexity },
    { name: "Speed vs Stability", ...audit.pillar_scores.speed_vs_stability },
    { name: "Validation Approach", ...audit.pillar_scores.validation_approach },
    { name: "Operational Capacity", ...audit.pillar_scores.operational_capacity },
    { name: "Execution Commitment", ...audit.pillar_scores.execution_commitment },
  ] : [];

  console.log('Phase2Dashboard - Render - scores object:', scores);
  console.log('Phase2Dashboard - Render - execution_score:', scores?.execution_score);
  console.log('Phase2Dashboard - Render - classification:', scores?.classification);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ========== 1. EXECUTIVE EXECUTION SUMMARY ========== */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            <CardTitle className="text-lg">Executive Execution Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
              <p className="text-3xl font-bold text-primary">{Number(scores.execution_score || 0).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Execution Score</p>
            </div>
            <div className={`rounded-xl p-4 text-center border ${classColor(scores.classification)}`}>
              <div className="flex items-center justify-center gap-2">
                {classIcon(scores.classification)}
                <p className="text-base font-bold">{scores.classification}</p>
              </div>
              <p className="text-xs mt-1 opacity-70">Classification</p>
            </div>
            <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 text-center">
              <p className="text-lg font-bold text-accent">{scores.execution_mode || "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">Execution Mode</p>
            </div>
          </div>

          {/* Three metric cards */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold text-primary capitalize">
                {scores.build_confidence_overall || "—"}
              </p>
              <p className="text-xs text-muted-foreground">Build Confidence</p>
              {scores.execution_maturity_tier && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${tierColor(scores.execution_maturity_tier)}`}>
                  {scores.execution_maturity_tier}
                </span>
              )}
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(scores.execution_risk_level || "")}`}>
                {scores.execution_risk_level || "—"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Execution Risk</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColor(scores.primary_constraint || "")}`}>
                {scores.primary_constraint ? "Identified" : "—"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Primary Constraint</p>
              {scores.primary_constraint && (
                <p className="text-[10px] text-muted-foreground mt-1 truncate" title={scores.primary_constraint}>
                  {scores.primary_constraint}
                </p>
              )}
            </div>
          </div>
          {exec.strategic_insight && (
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
              <p className="text-sm leading-relaxed">{exec.strategic_insight}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== AI REASONING TRACE ========== */}
      {Object.keys(reasoning).length > 0 && (
        <Card className="border border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" /> AI Reasoning Trace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Stage 2: Team */}
            {reasoning.stage_2_team && (
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold">Team Assessment</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto ${tierColor(reasoning.stage_2_team.classification)}`}>
                    {reasoning.stage_2_team.classification}
                  </span>
                </div>
                {reasoning.stage_2_team.reasoning && (
                  <p className="text-xs text-muted-foreground mt-1">{reasoning.stage_2_team.reasoning}</p>
                )}
              </div>
            )}

            {/* Stage 3: Capital */}
            {reasoning.stage_3_capital && (
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                  <p className="text-xs font-semibold">Capital Structure</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto ${tierColor(reasoning.stage_3_capital.classification)}`}>
                    {reasoning.stage_3_capital.classification}
                  </span>
                </div>
                {reasoning.stage_3_capital.reasoning && (
                  <p className="text-xs text-muted-foreground mt-1">{reasoning.stage_3_capital.reasoning}</p>
                )}
              </div>
            )}

            {/* Stages 4-10 summary grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {reasoning.stage_4_complexity && (
                <div className="rounded-lg border p-2.5">
                  <p className="text-[10px] text-muted-foreground mb-1">Technical Complexity</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColor(reasoning.stage_4_complexity.classification)}`}>
                    {reasoning.stage_4_complexity.classification}
                  </span>
                  {reasoning.stage_4_complexity.reasoning && (
                    <p className="text-[10px] text-muted-foreground mt-1">{reasoning.stage_4_complexity.reasoning}</p>
                  )}
                </div>
              )}
              {reasoning.stage_5_speed && (
                <div className="rounded-lg border p-2.5">
                  <p className="text-[10px] text-muted-foreground mb-1">Speed vs Stability</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColor(reasoning.stage_5_speed.classification)}`}>
                    {reasoning.stage_5_speed.classification}
                  </span>
                  {reasoning.stage_5_speed.reasoning && (
                    <p className="text-[10px] text-muted-foreground mt-1">{reasoning.stage_5_speed.reasoning}</p>
                  )}
                </div>
              )}
              {reasoning.stage_6_validation && (
                <div className="rounded-lg border p-2.5">
                  <p className="text-[10px] text-muted-foreground mb-1">Validation Approach</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColor(reasoning.stage_6_validation.classification)}`}>
                    {reasoning.stage_6_validation.classification}
                  </span>
                  {reasoning.stage_6_validation.reasoning && (
                    <p className="text-[10px] text-muted-foreground mt-1">{reasoning.stage_6_validation.reasoning}</p>
                  )}
                </div>
              )}
              {reasoning.stage_7_capacity && (
                <div className="rounded-lg border p-2.5">
                  <p className="text-[10px] text-muted-foreground mb-1">Operational Capacity</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColor(reasoning.stage_7_capacity.classification)}`}>
                    {reasoning.stage_7_capacity.classification}
                  </span>
                  {reasoning.stage_7_capacity.reasoning && (
                    <p className="text-[10px] text-muted-foreground mt-1">{reasoning.stage_7_capacity.reasoning}</p>
                  )}
                </div>
              )}
              {reasoning.stage_8_urgency && (
                <div className="rounded-lg border p-2.5">
                  <p className="text-[10px] text-muted-foreground mb-1">Revenue Urgency</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColor(reasoning.stage_8_urgency.classification)}`}>
                    {reasoning.stage_8_urgency.classification}
                  </span>
                  {reasoning.stage_8_urgency.reasoning && (
                    <p className="text-[10px] text-muted-foreground mt-1">{reasoning.stage_8_urgency.reasoning}</p>
                  )}
                </div>
              )}
              {reasoning.stage_9_scale && (
                <div className="rounded-lg border p-2.5">
                  <p className="text-[10px] text-muted-foreground mb-1">Scalability Intent</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColor(reasoning.stage_9_scale.classification)}`}>
                    {reasoning.stage_9_scale.classification}
                  </span>
                  {reasoning.stage_9_scale.reasoning && (
                    <p className="text-[10px] text-muted-foreground mt-1">{reasoning.stage_9_scale.reasoning}</p>
                  )}
                </div>
              )}
              {reasoning.stage_10_commitment && (
                <div className="rounded-lg border p-2.5">
                  <p className="text-[10px] text-muted-foreground mb-1">Execution Commitment</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColor(reasoning.stage_10_commitment.classification)}`}>
                    {reasoning.stage_10_commitment.classification}
                  </span>
                  {reasoning.stage_10_commitment.reasoning && (
                    <p className="text-[10px] text-muted-foreground mt-1">{reasoning.stage_10_commitment.reasoning}</p>
                  )}
                </div>
              )}
            </div>

            {/* Stage 11: Risk levels */}
            {reasoning.stage_11_risks && (
              <div className="rounded-lg bg-muted/30 border p-3">
                <p className="text-xs font-semibold mb-2">Risk Assessment</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(reasoning.stage_11_risks).map(([key, val]) => (
                    <span key={key} className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${severityColor(String(val))}`}>
                      {key}: {String(val)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stage 11: Primary constraint */}
            {reasoning.stage_11_constraint && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Primary Execution Constraint</p>
                <p className="text-xs text-red-800">{reasoning.stage_11_constraint}</p>
              </div>
            )}

          </CardContent>
        </Card>
      )}
      {/* ========== SCORING DECISION AUDIT ========== */}
      {pillarData.length > 0 && (
        <Card className="border border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-indigo-600" /> Scoring Decision Audit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pillar scores */}
            <div className="space-y-3">
              {pillarData.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{p.name} <span className="text-muted-foreground">(0-20)</span></span>
                    <div className="flex items-center gap-2">
                      {p.cap_applied && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Cap: {p.cap_applied}</span>}
                      <span className="font-bold" style={{ color: getBarColor((p.score / 20) * 100) }}>{p.score}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(p.score / 20) * 100}%`, backgroundColor: getBarColor((p.score / 20) * 100) }} />
                  </div>
                  {p.rationale && <p className="text-[10px] text-muted-foreground mt-1">{p.rationale}</p>}
                </div>
              ))}
            </div>

            <Separator />

            {/* Score flow */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-lg font-bold">{audit.base_score}</p>
                <p className="text-[10px] text-muted-foreground">Base Score</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-lg font-bold text-amber-600">
                  {audit.score_after_caps ?? (audit.base_score - (audit.risk_penalty || 0))}
                </p>
                <p className="text-[10px] text-muted-foreground">After Caps</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-lg font-bold text-destructive">
                  {audit.risk_penalty ? `-${audit.risk_penalty}` : "0"}
                </p>
                <p className="text-[10px] text-muted-foreground">Risk Penalty</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-lg font-bold text-green-600">+{audit.maturity_boost || 0}</p>
                <p className="text-[10px] text-muted-foreground">Maturity Boost</p>
              </div>
            </div>

            {/* Hard caps applied */}
            {audit.hard_caps_applied?.length > 0 && audit.hard_caps_applied[0] !== "None" && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Hard Caps Applied</p>
                <div className="flex flex-wrap gap-1.5">
                  {audit.hard_caps_applied.map((cap: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[9px] border-red-300 text-red-700">{cap}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Final score comparison */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Final Execution Score</p>
                <p className="text-2xl font-bold text-primary">
                  {audit.final_score || audit.final_execution_score || scores.execution_score || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize ${scores.build_confidence_overall === "low" ? "bg-red-100 text-red-800" :
                    scores.build_confidence_overall === "moderate" ? "bg-amber-100 text-amber-800" :
                      scores.build_confidence_overall === "high" ? "bg-green-100 text-green-800" :
                        "bg-muted text-muted-foreground"
                  }`}>
                  {scores.build_confidence_overall || "—"}
                </span>
              </div>
            </div>

            {audit.confidence_rationale && (
              <p className="text-xs text-muted-foreground border-l-2 border-indigo-200 pl-3">{audit.confidence_rationale}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== LAYER BREAKDOWN ========== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" /> Layer Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {layerData.map((entry) => {
              const tooltip = getLayerTooltip(entry.layer, entry.score);
              return (
                <ScoreTooltip key={entry.layer} label={entry.layer} score={entry.score} meaning={tooltip.meaning} reason={tooltip.reason} improvement={tooltip.improvement}>
                  <div className="cursor-help">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{entry.layer} <span className="text-muted-foreground">({entry.weight})</span></span>
                      <span className="font-bold" style={{ color: getBarColor(entry.score) }}>{entry.score.toFixed(0)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${entry.score}%`, backgroundColor: getBarColor(entry.score) }} />
                    </div>
                  </div>
                </ScoreTooltip>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ========== 2. MODE ARCHITECTURE ========== */}
      {modeArch.mode_comparison && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" /> Execution Mode Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Mode</th>
                    <th className="text-center py-2 font-medium text-muted-foreground">Team</th>
                    <th className="text-center py-2 font-medium text-muted-foreground">Capital</th>
                    <th className="text-center py-2 font-medium text-muted-foreground">Timeline</th>
                    <th className="text-center py-2 font-medium text-muted-foreground">Risk</th>
                    <th className="text-center py-2 font-medium text-muted-foreground">Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {modeArch.mode_comparison.map((m: any, i: number) => {
                    const isSelected = m.mode?.toLowerCase().includes(modeArch.selected_mode?.name?.toLowerCase()?.split(" ")[0] || "___");
                    return (
                      <tr key={i} className={`border-b ${isSelected ? "bg-accent/5 font-semibold" : ""}`}>
                        <td className="py-2 pr-2">{m.mode} {isSelected && <Badge variant="outline" className="text-[9px] ml-1">Selected</Badge>}</td>
                        <td className="py-2 text-center">{m.team_size}</td>
                        <td className="py-2 text-center">{m.capital}</td>
                        <td className="py-2 text-center">{m.timeline}</td>
                        <td className="py-2 text-center"><span className={`px-1.5 py-0.5 rounded-full text-[10px] ${severityColor(m.risk)}`}>{m.risk}</span></td>
                        <td className="py-2 text-center">{m.scalability}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 3. STRATEGIC BUILD LOGIC ========== */}
      {(buildLogic.build_first || buildLogic.core_value_loop) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" /> Strategic Build Logic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {buildLogic.build_first && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-primary mb-1">🏗 Build First</p>
                  <p className="text-sm">{buildLogic.build_first}</p>
                </div>
              )}
              {buildLogic.do_not_build && (
                <div className="rounded-lg border border-destructive/20 p-3">
                  <p className="text-xs font-medium text-destructive mb-1">🚫 Do NOT Build</p>
                  <p className="text-sm">{buildLogic.do_not_build}</p>
                </div>
              )}
            </div>
            {buildLogic.scope_rationale && (
              <p className="text-sm text-muted-foreground border-l-2 border-purple-200 pl-3">{buildLogic.scope_rationale}</p>
            )}
            {buildLogic.validation_leverage && (
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                <p className="text-xs font-medium text-accent mb-1">⚡ Validation Leverage</p>
                <p className="text-sm">{buildLogic.validation_leverage}</p>
              </div>
            )}
            {buildLogic.core_value_loop && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-semibold text-primary mb-3">Core Value Loop</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-card border rounded-lg px-3 py-1.5 font-medium">{buildLogic.core_value_loop.user_action}</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span className="bg-card border rounded-lg px-3 py-1.5 font-medium">{buildLogic.core_value_loop.system_action}</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span className="bg-card border rounded-lg px-3 py-1.5 font-medium">{buildLogic.core_value_loop.value_delivery}</span>
                  <ArrowRight className="h-3 w-3 text-accent" />
                  <span className="bg-accent/10 border border-accent/20 rounded-lg px-3 py-1.5 font-medium text-accent">{buildLogic.core_value_loop.revenue_trigger}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== 4. PRODUCT ARCHITECTURE ========== */}
      {(productArch.core_modules || productArch.supporting_modules) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" /> Product Architecture Framework
              {productArch.over_engineering_risk && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto ${severityColor(productArch.over_engineering_risk)}`}>
                  Over-engineering: {productArch.over_engineering_risk}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {productArch.core_modules?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-primary mb-2">Core Modules</p>
                  <div className="space-y-2">
                    {productArch.core_modules.map((m: any, i: number) => (
                      <div key={i} className="rounded-lg border p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{m.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${severityColor(m.priority === "Critical" ? "High" : m.priority)}`}>{m.priority}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {productArch.supporting_modules?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Supporting Modules</p>
                  <div className="space-y-2">
                    {productArch.supporting_modules.map((m: any, i: number) => (
                      <div key={i} className="rounded-lg border p-2">
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {productArch.data_model_logic && (
              <p className="text-sm text-muted-foreground border-l-2 border-blue-200 pl-3">{productArch.data_model_logic}</p>
            )}
            {productArch.external_dependencies?.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">External Dependencies:</p>
                <div className="flex flex-wrap gap-1.5">
                  {productArch.external_dependencies.map((d: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{d}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== 5. FEATURE PRIORITIZATION ========== */}
      {(featurePrio.core_features || featurePrio.nice_to_have || featurePrio.cut) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" /> Feature Prioritization Map
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {featurePrio.core_features?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-primary mb-2">Core Features</p>
                <div className="space-y-2">
                  {featurePrio.core_features.map((f: any, i: number) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <p className="text-sm font-medium">{f.feature}</p>
                          </div>
                          {f.why && <p className="text-xs text-muted-foreground mt-1 ml-5">{f.why}</p>}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {f.validation_leverage && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tierColor(f.validation_leverage)}`}>Val: {f.validation_leverage}</span>}
                          {f.revenue_impact && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tierColor(f.revenue_impact)}`}>Rev: {f.revenue_impact}</span>}
                          {f.complexity && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${severityColor(f.complexity)}`}>Cplx: {f.complexity}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {featurePrio.nice_to_have?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-accent mb-2">Nice to Have</p>
                  {featurePrio.nice_to_have.map((f: any, i: number) => (
                    <div key={i} className="text-xs flex gap-1.5 items-start py-1">
                      <span className="text-accent mt-0.5">○</span>
                      <span>{f.feature || f}</span>
                    </div>
                  ))}
                </div>
              )}
              {featurePrio.cut?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-destructive mb-2">Cut</p>
                  {featurePrio.cut.map((f: any, i: number) => (
                    <div key={i} className="text-xs flex gap-1.5 items-start py-1">
                      <XCircle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <span>{f.feature || f}</span>
                        {f.why_cut && <span className="text-muted-foreground ml-1">— {f.why_cut}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 6. TEAM STRUCTURE ========== */}
      {(execArch.team_structure?.core_team?.length > 0 || execArch.team_structure?.key_hires?.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Team Structure Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {execArch.team_structure?.core_team?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-primary mb-2">Core Team</p>
                <div className="flex flex-wrap gap-2">
                  {execArch.team_structure.core_team.map((r: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
            {execArch.team_structure?.key_hires?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 mb-2">Key Hires Needed</p>
                <div className="flex flex-wrap gap-2">
                  {execArch.team_structure.key_hires.map((r: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs border-amber-300 text-amber-700">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
            {execArch.team_structure?.team_gaps?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-destructive mb-2">Team Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {execArch.team_structure.team_gaps.map((g: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs border-red-300 text-red-700">{g}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== 7. TOOL STACK (Interactive) ========== */}
      {(toolStack.option_a || toolStack.option_b) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4 text-accent" /> Tool Stack System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeStack} onValueChange={setActiveStack}>
              <TabsList className="mb-4">
                <TabsTrigger value="option_a">{toolStack.option_a?.label || "Option A: AI-Optimized"}</TabsTrigger>
                <TabsTrigger value="option_b">{toolStack.option_b?.label || "Option B: Traditional"}</TabsTrigger>
              </TabsList>
              {["option_a", "option_b"].map((opt) => (
                <TabsContent key={opt} value={opt}>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(toolStack[opt]?.tools || []).map((t: any, i: number) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{t.tool}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tierColor(t.cost_tier === "Free" ? "strong" : t.cost_tier)}`}>{t.cost_tier}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t.category}</p>
                        {t.why && <p className="text-xs text-muted-foreground">{t.why}</p>}
                        {t.scalability && <p className="text-[10px] mt-1">Scale: <span className="font-medium">{t.scalability}</span></p>}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* ========== 8. CAPITAL ARCHITECTURE ========== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" /> Capital Architecture
            {capitalArch.capital_exposure_risk && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto ${severityColor(capitalArch.capital_exposure_risk)}`}>
                Exposure: {capitalArch.capital_exposure_risk}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show capital plan from execution_architecture if available */}
          {(() => {
            const capitalPlan = report.execution_architecture?.capital_plan;
            if (!capitalPlan && !capitalArch.build_capital) return null;

            const plan = capitalPlan || {};
            return (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  {plan.current_funding && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground mb-1">Current Funding</p>
                      <p className="text-sm font-semibold text-primary">{plan.current_funding}</p>
                    </div>
                  )}
                  {plan.runway && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground mb-1">Runway</p>
                      <p className="text-sm font-semibold">{plan.runway}</p>
                    </div>
                  )}
                  {plan.burn_rate && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground mb-1">Burn Rate</p>
                      <p className="text-sm font-semibold">{plan.burn_rate}</p>
                    </div>
                  )}
                  {plan.next_funding && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground mb-1">Next Funding Needed</p>
                      <p className="text-sm font-semibold text-accent">{plan.next_funding}</p>
                    </div>
                  )}
                </div>

                {plan.allocation && Object.keys(plan.allocation).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2">Capital Allocation</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(plan.allocation).map(([key, val]) => (
                        <div key={key} className="rounded-lg border p-2 text-center">
                          <p className="text-sm font-bold text-primary">{String(val)}</p>
                          <p className="text-[10px] text-muted-foreground">{key}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Fallback numeric display if capitalArch has numeric values */}
          {!report.execution_architecture?.capital_plan && (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-lg font-bold">{fmt(scores.budget_best) !== "$0" ? fmt(scores.budget_best) : "—"}</p>
                <p className="text-xs text-muted-foreground">Best Case</p>
              </div>
              <div className="rounded-lg border border-accent/20 p-3 text-center">
                <p className="text-lg font-bold text-accent">{fmt(scores.budget_realistic) !== "$0" ? fmt(scores.budget_realistic) : "—"}</p>
                <p className="text-xs text-muted-foreground">Realistic</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-lg font-bold text-destructive">{fmt(scores.budget_risk) !== "$0" ? fmt(scores.budget_risk) : "—"}</p>
                <p className="text-xs text-muted-foreground">Risk Case</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== 9. EXECUTION TIMELINE ========== */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Execution Timeline Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((p: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold">{p.phase || p.title || `Milestone ${i + 1}`}</h5>
                    <Badge variant="outline" className="text-xs">{p.weeks || p.timeline}</Badge>
                  </div>
                  {p.deliverables?.length > 0 && (
                    <ul className="space-y-1 mb-2">
                      {p.deliverables.map((d: string, j: number) => (
                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />{d}
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.resources && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Resources:</span> {p.resources}
                    </p>
                  )}
                  {(p.validation_milestone || p.go_no_go) && (
                    <div className="flex flex-wrap gap-3 text-[10px] mt-2">
                      {p.validation_milestone && (
                        <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-full">🎯 {p.validation_milestone}</span>
                      )}
                      {p.go_no_go && (
                        <span className="bg-accent/5 text-accent px-2 py-0.5 rounded-full">✅ {p.go_no_go}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== EXECUTION ROADMAP ========== */}
      {(executionRoadmap.immediate_actions?.length > 0 || executionRoadmap.critical_milestones?.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" /> Execution Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {executionRoadmap.immediate_actions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2">Immediate Actions</p>
                <div className="space-y-2">
                  {executionRoadmap.immediate_actions.map((a: any, i: number) => (
                    <div key={i} className="rounded-lg border p-3 flex items-start gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 border ${severityColor(a.priority === "Critical" ? "high" : "moderate")}`}>
                        {a.priority}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.action}</p>
                        <div className="flex gap-3 mt-1">
                          {a.timeline && <span className="text-[10px] text-muted-foreground">⏱ {a.timeline}</span>}
                          {a.owner && <span className="text-[10px] text-muted-foreground">👤 {a.owner}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {executionRoadmap.critical_milestones?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2">Critical Milestones</p>
                <div className="space-y-2">
                  {executionRoadmap.critical_milestones.map((m: any, i: number) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-semibold">{m.milestone}</p>
                      {m.success_criteria && <p className="text-xs text-muted-foreground mt-1">✅ {m.success_criteria}</p>}
                      {m.deadline && <p className="text-xs text-primary mt-1">📅 {m.deadline}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== 10. RISK CLUSTERS ========== */}
      {Object.keys(riskClusters).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" /> Execution Risk Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Scope Risk", data: riskClusters.scope_risk },
                { label: "Technical Risk", data: riskClusters.technical_risk },
                { label: "Talent Risk", data: riskClusters.talent_risk },
                { label: "Capital Risk", data: riskClusters.capital_risk },
                { label: "Time Risk", data: riskClusters.time_risk },
              ].map(({ label, data }) => data ? (
                <div key={label} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h6 className="text-sm font-semibold">{label}</h6>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${severityColor(data.severity)}`}>{data.severity}</span>
                  </div>
                  {data.trigger && <p className="text-xs text-muted-foreground"><span className="font-medium">Trigger:</span> {data.trigger}</p>}
                  {data.mitigation && <p className="text-xs"><span className="font-medium text-primary">Mitigate:</span> {data.mitigation}</p>}
                </div>
              ) : null)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 11. BUILD READINESS GAPS ========== */}
      {readinessGaps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-600" /> Build Readiness Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {readinessGaps.map((gap: any, i: number) => (
                <div key={i} className="rounded-lg border p-3 flex items-start gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 border ${severityColor(gap.importance)}`}>{gap.importance}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{gap.gap}</p>
                    {gap.action_required && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Action:</span> {gap.action_required}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 12. INVESTOR SNAPSHOT ========== */}
      {(investorSnap.capital_required_12m || investorSnap.time_to_mvp) && (
        <Card className="border-2 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-accent" /> Investor Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {investorSnap.capital_required_12m && (
                <div className="rounded-lg bg-accent/5 border border-accent/20 p-4 text-center">
                  <p className="text-xl font-bold text-accent">{fmt(investorSnap.capital_required_12m)}</p>
                  <p className="text-xs text-muted-foreground">12mo Capital Required</p>
                </div>
              )}
              {investorSnap.time_to_mvp && (
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-xl font-bold text-primary">{investorSnap.time_to_mvp}</p>
                  <p className="text-xs text-muted-foreground">Time to MVP</p>
                </div>
              )}
              {investorSnap.primary_risk && (
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium text-destructive mb-1">Primary Risk</p>
                  <p className="text-sm">{investorSnap.primary_risk}</p>
                </div>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {investorSnap.breakeven_hypothesis && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Break-even Hypothesis</p>
                  <p className="text-sm">{investorSnap.breakeven_hypothesis}</p>
                </div>
              )}
              {investorSnap.strategic_advantage && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-primary mb-1">Strategic Advantage</p>
                  <p className="text-sm">{investorSnap.strategic_advantage}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== ACTIONS ========== */}
      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Button variant="outline" className="gap-2" onClick={onRerun}><RotateCcw className="h-4 w-4" /> Re-run Analysis</Button>
        <Button variant="hero" className="gap-2" onClick={() => setShowLockModal(true)}>
          <Lock className="h-4 w-4" /> Lock & Proceed to Phase 3
        </Button>
      </div>

      {/* Lock Confirmation Modal */}
      <Dialog open={showLockModal} onOpenChange={setShowLockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock Phase 2 & Proceed?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Locking Phase 2 will finalize your execution blueprint. You can still view the results but won't be able to re-run scoring. Proceed to Phase 3 (GTM & Growth)?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLockModal(false)}>Cancel</Button>
            <Button variant="hero" onClick={confirmLock}>Lock & Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
