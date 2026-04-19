import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  RotateCcw, Lock, ArrowRight, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Target, Megaphone, DollarSign, Eye, Shield, HelpCircle,
  Briefcase, Zap, ArrowRightLeft, BarChart3, Brain, Rocket, Activity,
  Clock, Beaker, Building2,
} from "lucide-react";
import { toast } from "sonner";
import { ScoreTooltip, getLayerTooltip } from "@/components/ui/score-tooltip";

interface Phase3DashboardProps {
  projectId: string;
  onRerun: () => void;
  onLockProceed?: () => void;
}

const severityColor = (s: string) => {
  const sl = s?.toLowerCase();
  if (sl === "low") return "bg-green-100 text-green-800 border-green-200";
  if (sl === "moderate" || sl === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
  if (sl === "high" || sl === "critical") return "bg-red-100 text-red-800 border-red-200";
  return "bg-muted text-muted-foreground";
};

const tierColor = (t: string) => {
  const tl = t?.toLowerCase();
  if (tl?.includes("scalable") || tl?.includes("scale") || tl === "low" || tl === "unlimited" || tl === "fast") return "bg-green-100 text-green-800";
  if (tl?.includes("traction") || tl?.includes("structured") || tl === "moderate" || tl === "medium") return "bg-amber-100 text-amber-800";
  if (tl?.includes("early") || tl?.includes("hypothesis") || tl?.includes("pre-gtm") || tl === "high" || tl === "slow") return "bg-red-100 text-red-800";
  return "bg-muted text-muted-foreground";
};

const classColor = (c: string) => {
  if (c === "Structured Growth Engine") return "text-green-600 bg-green-50 border-green-200";
  if (c === "Early but Sound") return "text-blue-600 bg-blue-50 border-blue-200";
  if (c === "Fragile Growth Structure") return "text-amber-600 bg-amber-50 border-amber-200";
  if (c === "High GTM Risk") return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const directiveColor = (d: string) => {
  if (d === "Scale Aggressively") return "bg-green-100 text-green-700 border-green-300";
  if (d === "Scale Cautiously") return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (d === "Optimize Before Scaling") return "bg-amber-100 text-amber-700 border-amber-300";
  if (d === "Pivot Strategy") return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-red-100 text-red-700 border-red-300";
};

const confidenceColor = (c: string) => {
  const cl = c?.toLowerCase();
  if (cl === "high") return "bg-green-100 text-green-700 border-green-300";
  if (cl === "moderate") return "bg-amber-100 text-amber-700 border-amber-300";
  return "bg-red-100 text-red-700 border-red-300";
};

const getBarColor = (s: number) => s >= 70 ? "hsl(var(--primary))" : s >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))";

const fmt = (n: any) => {
  const v = Number(n);
  if (isNaN(v) || v === 0) return "$0";
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

export default function Phase3Dashboard({ projectId, onRerun, onLockProceed }: Phase3DashboardProps) {
  const [scores, setScores] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLockModal, setShowLockModal] = useState(false);

  useEffect(() => { loadData(); }, [projectId]);

  // Dummy scores data
  const dummyScores = {
    proj1: {
      growth_score: 82,
      classification: "Strong Growth",
      action_directive: "Scale Aggressively",
      scale_risk_level: "Low",
      action_summary: "Strong growth potential with solid market entry strategy and scalable acquisition engine.",
      entry_score: 85,
      org_score: 78,
      demand_score: 88,
      conversion_score: 82,
      scale_score: 80,
      economics_score: 79,
      economics_ltv_cac_ratio: 3.2,
      gtm_blueprint: {
        executive_summary: {
          gtm_maturity_tier: "Structured Growth Engine",
          ltv_cac_snapshot: "3.2x",
          growth_risk_tier: "Low",
          primary_growth_constraint: "Channel optimization",
          strategic_insight: "Strong product-market fit with clear scaling path through optimized acquisition channels."
        },
        reasoning_trace: {
          stage_2_demand: { classification: "High", reasoning: "Strong market demand signals" },
          stage_3_icp: { classification: "High", reasoning: "Well-defined ideal customer profile" },
          stage_4_distribution: { classification: "Moderate", reasoning: "Good distribution channels identified" },
          stage_5_economics: { classification: "High", reasoning: "Solid unit economics" },
          stage_6_growth_model: { classification: "High", reasoning: "Scalable growth model" },
          stage_7_experiment: { classification: "Moderate", reasoning: "Experimentation framework in place" },
          stage_8_scale: { classification: "High", reasoning: "Clear scaling strategy" },
          stage_9_risks: { "Technical Risk": "Low", "Market Risk": "Low", "Execution Risk": "Moderate" },
          stage_10_constraint: "Channel optimization"
        },
        scoring_audit: {
          base_score: 78,
          pillar_scores: {
            demand_intensity: { score: 13, reasoning: "Strong market signals" },
            icp_precision: { score: 14, reasoning: "Clear customer profile" },
            distribution_advantage: { score: 12, reasoning: "Good channels" },
            unit_economics: { score: 13, reasoning: "Solid economics" },
            growth_engine_alignment: { score: 13, reasoning: "Aligned growth model" },
            scale_readiness: { score: 13, reasoning: "Ready to scale" }
          },
          final_score: 82
        },
        growth_confidence: {
          overall: "High",
          icp_clarity: 8,
          economic_realism: 7,
          retention_logic: 8,
          channel_feasibility: 7,
          capital_adequacy: 8,
          reasoning: "Strong fundamentals across all growth dimensions."
        },
        market_entry_architecture: {
          icp: {
            demographic: "Tech-savvy professionals 25-45",
            buying_trigger: "Need for productivity solutions",
            budget_authority: "Mid-level managers with departmental budgets",
            adoption_barrier: "Integration complexity"
          },
          wedge_strategy: {
            why_this_segment: "High willingness to pay and clear ROI",
            unfair_advantage: "Superior user experience",
            expansion_path: "Horizontal expansion to adjacent use cases"
          },
          positioning: {
            problem_framing: "Inefficient workflow management",
            value_narrative: "Streamline operations with AI-powered insights",
            competitive_framing: "More intuitive than enterprise solutions"
          }
        },
        growth_engine: {
          model_type: "Product-Led Growth",
          model_justification: "Strong viral coefficients and network effects",
          growth_loop: {
            acquisition: "SEO & Content",
            activation: "Onboarding Flow",
            retention: "Product Usage",
            monetization: "Subscription",
            referral: "Team Sharing"
          },
          primary_lever: "Product Experience",
          weakest_link: "Conversion Optimization",
          compounding_mechanism: "Network Effects"
        },
        acquisition_engine: {
          channels: [
            {
              name: "SEO & Content Marketing",
              type: "Primary",
              expected_cac_range: "$50-100",
              why_fits_icp: "Tech-savvy users search for solutions",
              cost_profile: "Low",
              speed_profile: "Medium",
              scaling_ceiling: "High",
              risk_exposure: "Low"
            },
            {
              name: "Paid Social",
              type: "Secondary", 
              expected_cac_range: "$75-150",
              why_fits_icp: "Target professional demographics",
              cost_profile: "Medium",
              speed_profile: "Fast",
              scaling_ceiling: "Medium",
              risk_exposure: "Moderate"
            }
          ]
        },
        conversion_architecture: {
          funnel_stages: [
            { stage: "Awareness", conversion_rate: "3%", key_action: "Content consumption" },
            { stage: "Interest", conversion_rate: "12%", key_action: "Feature exploration" },
            { stage: "Trial", conversion_rate: "25%", key_action: "Account creation" },
            { stage: "Activation", conversion_rate: "60%", key_action: "Key feature usage" },
            { stage: "Revenue", conversion_rate: "8%", key_action: "Subscription upgrade" }
          ],
          activation_metric: "Time to first key action",
          time_to_value: "7 days",
          conversion_bottleneck: "Trial to activation"
        },
        unit_economics: {
          cac_estimate_range: "$75-125",
          ltv_sensitivity: "High retention drives LTV",
          economic_fragility: "Low"
        },
        scale_pivot_kill: {
          scale_signals: ["Strong product-market fit", "Scalable acquisition", "Positive unit economics"],
          pivot_signals: ["Channel optimization needed", "Conversion bottleneck"],
          kill_signals: []
        },
        ninety_day_roadmap: [
          { phase: "Month 1", focus: "Channel optimization", metrics: "Reduce CAC by 20%" },
          { phase: "Month 2", focus: "Conversion improvement", metrics: "Increase trial-to-paid by 15%" },
          { phase: "Month 3", focus: "Scale acquisition", metrics: "Double user base" }
        ],
        experimentation_architecture: [
          { experiment: "A/B Test onboarding", priority: "High", expected_impact: "15% lift in activation" },
          { experiment: "Channel mix optimization", priority: "Medium", expected_impact: "10% CAC reduction" }
        ],
        growth_risk_clusters: {
          "Market Risk": "Low",
          "Technical Risk": "Low", 
          "Execution Risk": "Moderate",
          "Competitive Risk": "Moderate"
        },
        capital_deployment: {
          total_required: "$250K",
          allocation: { "Acquisition": "40%", "Product": "35%", "Team": "25%" },
          runway: "18 months"
        },
        growth_readiness_gaps: ["Sales process needed", "Customer success framework"],
        investor_snapshot: {
          traction_level: "Strong early traction",
          next_milestone: "10K paying customers",
          funding_round: "Series A",
          key_metrics: ["3.2x LTV/CAC", "85% growth score", "Low risk profile"]
        }
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = dummyScores[projectId as keyof typeof dummyScores];
      setScores(data);
      setLoading(false);
    }, 1000);
  };

  const confirmLock = async () => {
    // Simulate phase locking
    setTimeout(() => {
      setShowLockModal(false);
      toast.success("Phase 3 locked. Venture Blueprint complete!");
      onLockProceed?.();
    }, 1000);
  };

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!scores) return <div className="text-center py-16 text-muted-foreground">No scoring data yet.</div>;

  const gtm = (scores.gtm_blueprint as any) || {};
  const exec = gtm.executive_summary || {};
  const reasoningTrace = gtm.reasoning_trace || {};
  const scoringAudit = gtm.scoring_audit || {};
  const growthConfidence = gtm.growth_confidence || {};
  const entryArch = gtm.market_entry_architecture || {};
  const growthEngine = gtm.growth_engine || {};
  const acqEngine = gtm.acquisition_engine || {};
  const convArch = gtm.conversion_architecture || {};
  const unitEcon = gtm.unit_economics || {};
  const spk = gtm.scale_pivot_kill || {};
  const roadmap = gtm.ninety_day_roadmap || [];
  const experiments = gtm.experimentation_architecture || [];
  const orgGrowth = gtm.org_growth_model || {};
  const riskClusters = gtm.growth_risk_clusters || {};
  const capitalDeploy = gtm.capital_deployment || {};
  const readinessGaps = gtm.growth_readiness_gaps || [];
  const investorSnap = gtm.investor_snapshot || {};

  const scaleSignals = spk.scale_signals || (scores.scale_signals as any[]) || [];
  const pivotSignals = spk.pivot_signals || (scores.pivot_signals as any[]) || [];
  const killSignals = spk.kill_signals || (scores.kill_signals as any[]) || [];
  const channelMatrix = acqEngine.channels || (scores.demand_channel_matrix as any[]) || [];
  const plan90 = roadmap.length > 0 ? roadmap : (scores.action_90day_plan as any[]) || [];
  const expData = experiments.length > 0 ? experiments : (scores.action_experiment_priorities as any[]) || [];

  const layerData = [
    { layer: "Entry", score: Number(scores.entry_score), weight: "15%" },
    { layer: "Org", score: Number(scores.org_score), weight: "15%" },
    { layer: "Demand", score: Number(scores.demand_score), weight: "20%" },
    { layer: "Conversion", score: Number(scores.conversion_score), weight: "20%" },
    { layer: "Scale Ctrl", score: Number(scores.scale_score), weight: "15%" },
    { layer: "Economics", score: Number(scores.economics_score), weight: "15%" },
  ];

  const pillarScores = scoringAudit.pillar_scores || {};
  const pillarEntries = [
    { key: "demand_intensity", label: "Demand Intensity", max: 15, icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "icp_precision", label: "ICP Precision", max: 15, icon: <Target className="h-3.5 w-3.5" /> },
    { key: "distribution_advantage", label: "Distribution", max: 15, icon: <Megaphone className="h-3.5 w-3.5" /> },
    { key: "unit_economics", label: "Unit Economics", max: 15, icon: <DollarSign className="h-3.5 w-3.5" /> },
    { key: "growth_engine_alignment", label: "Growth Alignment", max: 15, icon: <Rocket className="h-3.5 w-3.5" /> },
    { key: "scale_readiness", label: "Scale Readiness", max: 15, icon: <Activity className="h-3.5 w-3.5" /> },
  ];

  const reasoningStages = [
    { key: "stage_2_demand", label: "Demand Intensity", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "stage_3_icp", label: "ICP Precision", icon: <Target className="h-3.5 w-3.5" /> },
    { key: "stage_4_distribution", label: "Distribution Advantage", icon: <Megaphone className="h-3.5 w-3.5" /> },
    { key: "stage_5_economics", label: "Unit Economics", icon: <DollarSign className="h-3.5 w-3.5" /> },
    { key: "stage_6_growth_model", label: "Growth Model", icon: <Rocket className="h-3.5 w-3.5" /> },
    { key: "stage_7_experiment", label: "Experiment Readiness", icon: <Beaker className="h-3.5 w-3.5" /> },
    { key: "stage_8_scale", label: "Scale Readiness", icon: <Activity className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ========== 1. EXECUTIVE GTM SUMMARY ========== */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            <CardTitle className="text-lg">Executive GTM Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
              <p className="text-3xl font-bold text-primary">{Number(scores.growth_score).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Growth Score</p>
            </div>
            <div className={`rounded-xl p-4 text-center border ${classColor(exec.gtm_maturity_tier || scores.classification)}`}>
              <p className="text-base font-bold">{exec.gtm_maturity_tier || scores.classification}</p>
              <p className="text-xs mt-1 opacity-70">GTM Maturity Tier</p>
            </div>
            <div className={`rounded-xl p-4 text-center border ${directiveColor(scores.action_directive)}`}>
              <p className="text-sm font-bold">{scores.action_directive}</p>
              <p className="text-xs mt-1 opacity-70">Action Directive</p>
            </div>
            {growthConfidence.overall && (
              <div className={`rounded-xl p-4 text-center border ${confidenceColor(growthConfidence.overall)}`}>
                <p className="text-base font-bold">{growthConfidence.overall}</p>
                <p className="text-xs mt-1 opacity-70">Growth Confidence</p>
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold text-accent">{exec.ltv_cac_snapshot || `${Number(scores.economics_ltv_cac_ratio).toFixed(1)}x`}</p>
              <p className="text-xs text-muted-foreground">LTV/CAC Ratio</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColor(exec.growth_risk_tier || scores.scale_risk_level)}`}>
                {exec.growth_risk_tier || scores.scale_risk_level || "—"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Growth Risk</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs font-medium text-primary">{exec.primary_growth_constraint || reasoningTrace.stage_10_constraint || "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">Primary Constraint</p>
            </div>
          </div>
          {exec.strategic_insight && (
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
              <p className="text-sm leading-relaxed">{exec.strategic_insight}</p>
            </div>
          )}
          {!exec.strategic_insight && scores.action_summary && (
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-accent">
              <p className="text-sm leading-relaxed">{scores.action_summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== AI REASONING TRACE ========== */}
      {Object.keys(reasoningTrace).length > 0 && (
        <Card className="border border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> AI Reasoning Trace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reasoningStages.map(({ key, label, icon }) => {
              const stage = reasoningTrace[key];
              if (!stage) return null;
              return (
                <div key={key} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-sm font-medium">{icon} {label}</div>
                    <Badge variant="outline" className="text-xs">{stage.classification}</Badge>
                  </div>
                  {stage.reasoning && <p className="text-xs text-muted-foreground">{stage.reasoning}</p>}
                  {stage.justification && <p className="text-xs text-muted-foreground">{stage.justification}</p>}
                  {stage.impact && <p className="text-xs text-accent mt-1">Impact: {stage.impact}</p>}
                  {stage.misalignment_flag && stage.misalignment_flag !== "None" && (
                    <p className="text-xs text-destructive mt-1">⚠ {stage.misalignment_flag}</p>
                  )}
                </div>
              );
            })}
            {reasoningTrace.stage_9_risks && (
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium mb-2 flex items-center gap-2"><Shield className="h-3.5 w-3.5" /> Risk Classification</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(reasoningTrace.stage_9_risks).map(([k, v]) => (
                    <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full border ${severityColor(v as string)}`}>
                      {k.replace(/_/g, " ")}: {v as string}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {reasoningTrace.stage_10_constraint && (
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                <p className="text-xs font-semibold text-destructive">{reasoningTrace.stage_10_constraint}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== SCORING DECISION AUDIT ========== */}
      {Object.keys(scoringAudit).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" /> Scoring Decision Audit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pillar scores */}
            {Object.keys(pillarScores).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">6-Pillar Base Score</p>
                {pillarEntries.map(({ key, label, max, icon }) => {
                  const p = pillarScores[key];
                  if (!p) return null;
                  const pct = (Number(p.score) / max) * 100;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium flex items-center gap-1.5">{icon} {label}</span>
                        <span className="font-bold">{p.score}/{max}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "hsl(var(--primary))" : pct >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))" }} />
                      </div>
                      {p.reasoning && <p className="text-[10px] text-muted-foreground mt-0.5">{p.reasoning}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Score calculation breakdown */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {scoringAudit.base_score != null && (
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-primary">{scoringAudit.base_score}</p>
                  <p className="text-[10px] text-muted-foreground">Base Score (max 90)</p>
                </div>
              )}
              {scoringAudit.experiment_discipline && (
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-accent">+{scoringAudit.experiment_discipline.score}</p>
                  <p className="text-[10px] text-muted-foreground">Experiment ({scoringAudit.experiment_discipline.classification})</p>
                </div>
              )}
              {scoringAudit.validation_boost && (
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-green-600">+{scoringAudit.validation_boost.score}</p>
                  <p className="text-[10px] text-muted-foreground">Validation Boost</p>
                </div>
              )}
              {scoringAudit.risk_penalty && (
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-destructive">{scoringAudit.risk_penalty.penalty}</p>
                  <p className="text-[10px] text-muted-foreground">{scoringAudit.risk_penalty.high_risk_count} High Risks</p>
                </div>
              )}
            </div>

            {/* Hard ceilings */}
            {scoringAudit.hard_ceilings_applied?.length > 0 && (
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                <p className="text-xs font-semibold text-destructive mb-1">Hard Ceilings Applied</p>
                <div className="flex flex-wrap gap-1">
                  {scoringAudit.hard_ceilings_applied.map((c: string, i: number) => (
                    <span key={i} className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {scoringAudit.pre_ceiling_score != null && scoringAudit.final_score != null && (
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-muted-foreground">Pre-ceiling: <strong>{scoringAudit.pre_ceiling_score}</strong></span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-primary font-bold text-lg">{scoringAudit.final_score}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== GROWTH CONFIDENCE INDEX ========== */}
      {growthConfidence.overall && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" /> Growth Confidence Index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "ICP Clarity", val: growthConfidence.icp_clarity },
                { label: "Economic Realism", val: growthConfidence.economic_realism },
                { label: "Retention Logic", val: growthConfidence.retention_logic },
                { label: "Channel Feasibility", val: growthConfidence.channel_feasibility },
                { label: "Capital Adequacy", val: growthConfidence.capital_adequacy },
              ].map(({ label, val }) => val != null ? (
                <div key={label} className="rounded-lg border p-2 text-center">
                  <p className="text-lg font-bold" style={{ color: Number(val) >= 7 ? "hsl(var(--primary))" : Number(val) >= 5 ? "hsl(var(--accent))" : "hsl(var(--destructive))" }}>{val}/10</p>
                  <p className="text-[9px] text-muted-foreground">{label}</p>
                </div>
              ) : null)}
            </div>
            {growthConfidence.reasoning && (
              <p className="text-xs text-muted-foreground border-l-2 border-accent/30 pl-3">{growthConfidence.reasoning}</p>
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

      {/* ========== 2. MARKET ENTRY ARCHITECTURE ========== */}
      {(entryArch.icp || entryArch.wedge_strategy || entryArch.positioning || scores.entry_icp) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" /> Market Entry Strategy Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entryArch.icp && (
              <div className="rounded-lg border p-4">
                <p className="text-xs font-semibold text-primary mb-2">Ideal Customer Profile (ICP)</p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {entryArch.icp.demographic && <div><span className="text-xs text-muted-foreground">Demographic:</span><p>{entryArch.icp.demographic}</p></div>}
                  {entryArch.icp.buying_trigger && <div><span className="text-xs text-muted-foreground">Buying Trigger:</span><p>{entryArch.icp.buying_trigger}</p></div>}
                  {entryArch.icp.budget_authority && <div><span className="text-xs text-muted-foreground">Budget Authority:</span><p>{entryArch.icp.budget_authority}</p></div>}
                  {entryArch.icp.adoption_barrier && <div><span className="text-xs text-muted-foreground">Adoption Barrier:</span><p>{entryArch.icp.adoption_barrier}</p></div>}
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {entryArch.wedge_strategy && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <p className="text-xs font-semibold text-primary mb-2">🎯 Wedge Strategy</p>
                  {entryArch.wedge_strategy.why_this_segment && <p className="text-xs mb-1"><span className="font-medium">Why this segment:</span> {entryArch.wedge_strategy.why_this_segment}</p>}
                  {entryArch.wedge_strategy.unfair_advantage && <p className="text-xs mb-1"><span className="font-medium">Unfair advantage:</span> {entryArch.wedge_strategy.unfair_advantage}</p>}
                  {entryArch.wedge_strategy.expansion_path && <p className="text-xs"><span className="font-medium">Expansion:</span> {entryArch.wedge_strategy.expansion_path}</p>}
                </div>
              )}
              {entryArch.positioning && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-semibold mb-2">📌 Positioning</p>
                  {entryArch.positioning.problem_framing && <p className="text-xs mb-1"><span className="font-medium">Problem:</span> {entryArch.positioning.problem_framing}</p>}
                  {entryArch.positioning.value_narrative && <p className="text-xs mb-1"><span className="font-medium">Value:</span> {entryArch.positioning.value_narrative}</p>}
                  {entryArch.positioning.competitive_framing && <p className="text-xs"><span className="font-medium">vs Competition:</span> {entryArch.positioning.competitive_framing}</p>}
                </div>
              )}
            </div>
            {entryArch.entry_risks?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Entry Risks</p>
                {entryArch.entry_risks.map((r: any, i: number) => (
                  <div key={i} className="rounded-lg border p-2 flex items-start gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 border ${severityColor(r.severity)}`}>{r.severity}</span>
                    <div className="text-xs"><span className="font-medium">{r.risk}</span>{r.mitigation && <span className="text-muted-foreground"> — {r.mitigation}</span>}</div>
                  </div>
                ))}
              </div>
            )}
            {!entryArch.icp && scores.entry_icp && (
              <div className="rounded-lg border p-3">
                <p className="text-xs font-semibold text-primary mb-1">ICP</p>
                <p className="text-sm">{scores.entry_icp}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== 3. GROWTH ENGINE ========== */}
      {(growthEngine.model_type || growthEngine.growth_loop) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Rocket className="h-4 w-4 text-accent" /> Growth Engine Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {growthEngine.model_type && (
              <div className="flex items-center gap-3">
                <Badge className="text-sm">{growthEngine.model_type}</Badge>
                <span className="text-xs text-muted-foreground">Growth Model</span>
              </div>
            )}
            {growthEngine.model_justification && (
              <p className="text-sm text-muted-foreground border-l-2 border-accent/30 pl-3">{growthEngine.model_justification}</p>
            )}
            {growthEngine.growth_loop && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-semibold text-primary mb-3">Core Growth Loop</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {["acquisition", "activation", "retention", "monetization", "referral"].map((step, i) => (
                    <span key={step}>
                      {i > 0 && <ArrowRight className="h-3 w-3 text-primary inline mx-1" />}
                      <span className={`bg-card border rounded-lg px-3 py-1.5 font-medium inline-block ${step === "monetization" ? "bg-accent/10 border-accent/20 text-accent" : ""}`}>
                        {growthEngine.growth_loop[step] || step}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-3">
              {growthEngine.primary_lever && <div className="rounded-lg border p-3"><p className="text-[10px] text-muted-foreground mb-1">Primary Lever</p><p className="text-sm font-medium">{growthEngine.primary_lever}</p></div>}
              {growthEngine.weakest_link && <div className="rounded-lg border border-destructive/20 p-3"><p className="text-[10px] text-destructive mb-1">Weakest Link</p><p className="text-sm font-medium">{growthEngine.weakest_link}</p></div>}
              {growthEngine.compounding_mechanism && <div className="rounded-lg border border-green-200 p-3"><p className="text-[10px] text-green-700 mb-1">Compounding</p><p className="text-sm font-medium">{growthEngine.compounding_mechanism}</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 4. ACQUISITION ENGINE ========== */}
      {channelMatrix.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-accent" /> Acquisition Engine Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {channelMatrix.map((c: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{c.name || c.channel}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${c.type === "Primary" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{c.type || c.priority}</span>
                    </div>
                    {c.expected_cac_range && <span className="text-xs text-muted-foreground">CAC: {c.expected_cac_range}</span>}
                  </div>
                  {c.why_fits_icp && <p className="text-xs text-muted-foreground mb-2">{c.why_fits_icp}</p>}
                  <div className="flex flex-wrap gap-2">
                    {c.cost_profile && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tierColor(c.cost_profile)}`}>Cost: {c.cost_profile}</span>}
                    {c.speed_profile && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tierColor(c.speed_profile)}`}>Speed: {c.speed_profile}</span>}
                    {c.scaling_ceiling && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tierColor(c.scaling_ceiling)}`}>Scale: {c.scaling_ceiling}</span>}
                    {c.risk_exposure && <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${severityColor(c.risk_exposure)}`}>Risk: {c.risk_exposure}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 5. CONVERSION ARCHITECTURE ========== */}
      {(convArch.funnel_stages || convArch.activation_metric) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" /> Conversion Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {convArch.funnel_stages?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2">Funnel Stages</p>
                <div className="space-y-2">
                  {convArch.funnel_stages.map((s: any, i: number) => (
                    <div key={i} className="rounded-lg border p-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{s.stage}</p>
                          {s.conversion_rate && <span className="text-xs font-medium text-primary">{s.conversion_rate}</span>}
                        </div>
                        {s.key_action && <p className="text-xs text-muted-foreground mt-0.5">{s.key_action}</p>}
                        {s.drop_off_risk && <p className="text-xs text-destructive/70 mt-0.5">⚠ {s.drop_off_risk}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-3">
              {convArch.activation_metric && <div className="rounded-lg bg-accent/5 border border-accent/20 p-3"><p className="text-[10px] text-accent mb-1">Activation Metric</p><p className="text-sm font-medium">{convArch.activation_metric}</p></div>}
              {convArch.time_to_value && <div className="rounded-lg border p-3"><p className="text-[10px] text-muted-foreground mb-1">Time to Value</p><p className="text-sm font-medium">{convArch.time_to_value}</p></div>}
              {convArch.conversion_bottleneck && <div className="rounded-lg border border-destructive/20 p-3"><p className="text-[10px] text-destructive mb-1">Bottleneck</p><p className="text-sm font-medium">{convArch.conversion_bottleneck}</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 6. UNIT ECONOMICS ========== */}
      {(unitEcon.cac_estimate_range || unitEcon.ltv_sensitivity) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" /> Unit Economics Structure
              {unitEcon.economic_fragility && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto border ${severityColor(unitEcon.economic_fragility)}`}>
                  Fragility: {unitEcon.economic_fragility}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {unitEcon.cac_estimate_range && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-semibold mb-2">CAC Estimate Range</p>
                  <div className="flex gap-3 text-sm">
                    <div className="text-center"><p className="font-bold text-green-600">{fmt(unitEcon.cac_estimate_range.low)}</p><p className="text-[10px] text-muted-foreground">Low</p></div>
                    <div className="text-center"><p className="font-bold text-primary">{fmt(unitEcon.cac_estimate_range.mid)}</p><p className="text-[10px] text-muted-foreground">Mid</p></div>
                    <div className="text-center"><p className="font-bold text-destructive">{fmt(unitEcon.cac_estimate_range.high)}</p><p className="text-[10px] text-muted-foreground">High</p></div>
                  </div>
                </div>
              )}
              {unitEcon.ltv_sensitivity && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-semibold mb-2">LTV Sensitivity</p>
                  <div className="flex gap-3 text-sm">
                    <div className="text-center"><p className="font-bold text-muted-foreground">{fmt(unitEcon.ltv_sensitivity.conservative)}</p><p className="text-[10px] text-muted-foreground">Conservative</p></div>
                    <div className="text-center"><p className="font-bold text-primary">{fmt(unitEcon.ltv_sensitivity.base)}</p><p className="text-[10px] text-muted-foreground">Base</p></div>
                    <div className="text-center"><p className="font-bold text-green-600">{fmt(unitEcon.ltv_sensitivity.optimistic)}</p><p className="text-[10px] text-muted-foreground">Optimistic</p></div>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {unitEcon.payback_period && <div className="rounded-lg border p-3 text-center"><p className="text-sm font-bold text-primary">{unitEcon.payback_period}</p><p className="text-[10px] text-muted-foreground">Payback Period</p></div>}
              {unitEcon.contribution_margin && <div className="rounded-lg border p-3 text-center"><p className="text-sm font-bold">{unitEcon.contribution_margin}</p><p className="text-[10px] text-muted-foreground">Contribution Margin</p></div>}
              {unitEcon.burn_multiple != null && <div className="rounded-lg border p-3 text-center"><p className="text-sm font-bold">{unitEcon.burn_multiple}x</p><p className="text-[10px] text-muted-foreground">Burn Multiple</p></div>}
              <div className="rounded-lg border p-3 text-center"><p className="text-sm font-bold text-accent">{Number(scores.economics_ltv_cac_ratio).toFixed(1)}x</p><p className="text-[10px] text-muted-foreground">LTV/CAC</p></div>
            </div>
            {unitEcon.fragility_rationale && <p className="text-xs text-muted-foreground border-l-2 border-green-200 pl-3">{unitEcon.fragility_rationale}</p>}
          </CardContent>
        </Card>
      )}

      {/* ========== 7. SCALE / PIVOT / KILL ========== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" /> Scale / Pivot / Kill Decision Map
            {scores.scale_recommendation && <Badge variant="outline" className="ml-auto">{scores.scale_recommendation}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-green-200 p-4">
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-green-600" /><h6 className="text-sm font-semibold">Scale Signals</h6></div>
              <div className="space-y-2">
                {scaleSignals.map((s: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="flex gap-1.5 items-start"><CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 shrink-0" /><span className="font-medium">{s.signal || s}</span></div>
                    {s.metric_threshold && <p className="text-[10px] text-muted-foreground ml-4">Threshold: {s.metric_threshold}</p>}
                    {s.observation_period && <p className="text-[10px] text-muted-foreground ml-4">Window: {s.observation_period}</p>}
                  </div>
                ))}
                {scaleSignals.length === 0 && <p className="text-xs text-muted-foreground">None detected</p>}
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4 text-amber-600" /><h6 className="text-sm font-semibold">Pivot Signals</h6></div>
              <div className="space-y-2">
                {pivotSignals.map((s: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="flex gap-1.5 items-start"><AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" /><span className="font-medium">{s.signal || s}</span></div>
                    {s.metric_threshold && <p className="text-[10px] text-muted-foreground ml-4">Threshold: {s.metric_threshold}</p>}
                  </div>
                ))}
                {pivotSignals.length === 0 && <p className="text-xs text-muted-foreground">None detected</p>}
              </div>
            </div>
            <div className="rounded-lg border border-red-200 p-4">
              <div className="flex items-center gap-2 mb-3"><XCircle className="h-4 w-4 text-red-600" /><h6 className="text-sm font-semibold">Kill Signals</h6></div>
              <div className="space-y-2">
                {killSignals.map((s: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="flex gap-1.5 items-start"><XCircle className="h-3 w-3 text-red-600 mt-0.5 shrink-0" /><span className="font-medium">{s.signal || s}</span></div>
                    {s.metric_threshold && <p className="text-[10px] text-muted-foreground ml-4">Threshold: {s.metric_threshold}</p>}
                  </div>
                ))}
                {killSignals.length === 0 && <p className="text-xs text-muted-foreground">None detected</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== 8. 90-DAY ROADMAP ========== */}
      {plan90.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> 90-Day GTM Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan90.map((p: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold">{p.month || `Month ${i + 1}`}</h5>
                    {p.title && <Badge variant="outline" className="text-xs">{p.title}</Badge>}
                  </div>
                  {p.strategic_focus && <p className="text-xs text-muted-foreground mb-2">{p.strategic_focus}</p>}
                  {p.deliverables?.length > 0 && (
                    <ul className="space-y-1 mb-2">
                      {p.deliverables.map((d: string, j: number) => (
                        <li key={j} className="text-xs flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />{d}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-3 text-[10px]">
                    {p.kpi_targets?.length > 0 && <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-full">📊 {Array.isArray(p.kpi_targets) ? p.kpi_targets.join(", ") : p.kpi_targets}</span>}
                    {p.decision_gate && <span className="bg-accent/5 text-accent px-2 py-0.5 rounded-full">🚦 {p.decision_gate}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 9. EXPERIMENTATION ========== */}
      {expData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Beaker className="h-4 w-4 text-purple-600" /> Experimentation Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expData.map((e: any, i: number) => (
                <div key={i} className="rounded-lg border p-4">
                  <p className="text-sm font-semibold mb-2">{e.hypothesis || e.experiment}</p>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    {e.variable && <div><span className="text-muted-foreground">Variable:</span> {e.variable}</div>}
                    {e.metric && <div><span className="text-muted-foreground">Metric:</span> {e.metric}</div>}
                    {e.duration && <div><span className="text-muted-foreground">Duration:</span> {e.duration}</div>}
                    {e.success_criteria && <div><span className="text-muted-foreground">Success Criteria:</span> {e.success_criteria}</div>}
                  </div>
                  {(e.if_successful || e.if_failed) && (
                    <div className="grid sm:grid-cols-2 gap-3 mt-2">
                      {e.if_successful && <div className="rounded bg-green-50 border border-green-200 p-2 text-xs"><span className="font-medium text-green-700">✅ If successful:</span> {e.if_successful}</div>}
                      {e.if_failed && <div className="rounded bg-red-50 border border-red-200 p-2 text-xs"><span className="font-medium text-red-700">❌ If failed:</span> {e.if_failed}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 10. ORG GROWTH MODEL ========== */}
      {(orgGrowth.initial_roles || orgGrowth.hiring_triggers) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Organizational Growth Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orgGrowth.initial_roles?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2">Initial Growth Roles</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {orgGrowth.initial_roles.map((r: any, i: number) => (
                    <div key={i} className="rounded-lg border p-2.5">
                      <p className="text-sm font-medium">{r.role}</p>
                      {r.why && <p className="text-xs text-muted-foreground">{r.why}</p>}
                      {r.timing && <Badge variant="outline" className="text-[9px] mt-1">{r.timing}</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {orgGrowth.hiring_triggers?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2">Hiring Triggers</p>
                <div className="space-y-2">
                  {orgGrowth.hiring_triggers.map((t: any, i: number) => (
                    <div key={i} className="text-xs flex gap-2 items-start">
                      <Zap className="h-3 w-3 text-accent mt-0.5 shrink-0" />
                      <span><span className="font-medium">{t.trigger}</span> → Hire: {t.role_to_add}{t.metric_threshold && ` (${t.metric_threshold})`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== 11. GROWTH RISK CLUSTERS ========== */}
      {Object.keys(riskClusters).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" /> Growth Risk Clusters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Acquisition Risk", data: riskClusters.acquisition_risk },
                { label: "Retention Risk", data: riskClusters.retention_risk },
                { label: "Monetization Risk", data: riskClusters.monetization_risk },
                { label: "Channel Dependency", data: riskClusters.channel_dependency_risk },
                { label: "Economic Risk", data: riskClusters.economic_risk },
              ].map(({ label, data }) => data ? (
                <div key={label} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h6 className="text-sm font-semibold">{label}</h6>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${severityColor(data.severity)}`}>{data.severity}</span>
                  </div>
                  {data.detail && <p className="text-xs text-muted-foreground">{data.detail}</p>}
                  {data.mitigation && <p className="text-xs"><span className="font-medium text-primary">Mitigate:</span> {data.mitigation}</p>}
                </div>
              ) : null)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 12. CAPITAL DEPLOYMENT ========== */}
      {(capitalDeploy.total || capitalDeploy.acquisition_spend || scores.action_capital_plan) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" /> Capital Deployment for Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(capitalDeploy.acquisition_spend || capitalDeploy.total) ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {capitalDeploy.acquisition_spend && <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold text-primary">{fmt(capitalDeploy.acquisition_spend)}</p><p className="text-xs text-muted-foreground">Acquisition</p></div>}
                  {capitalDeploy.experimentation_budget && <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">{fmt(capitalDeploy.experimentation_budget)}</p><p className="text-xs text-muted-foreground">Experiments</p></div>}
                  {capitalDeploy.tooling_cost && <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">{fmt(capitalDeploy.tooling_cost)}</p><p className="text-xs text-muted-foreground">Tooling</p></div>}
                  {capitalDeploy.buffer_reserve && <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">{fmt(capitalDeploy.buffer_reserve)}</p><p className="text-xs text-muted-foreground">Buffer</p></div>}
                </div>
                {capitalDeploy.total && (
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{fmt(capitalDeploy.total)}</p>
                    <p className="text-xs text-muted-foreground">Total Growth Capital</p>
                  </div>
                )}
                {capitalDeploy.burn_sensitivity_note && (
                  <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                    <p className="text-xs"><span className="font-semibold text-destructive">⚠ Burn Sensitivity:</span> {capitalDeploy.burn_sensitivity_note}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{scores.action_capital_plan}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== 13. GROWTH READINESS GAPS ========== */}
      {readinessGaps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-600" /> Growth Readiness Gaps
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

      {/* ========== 14. INVESTOR SNAPSHOT ========== */}
      {(investorSnap.entry_strategy || investorSnap.capital_for_scale) && (
        <Card className="border-2 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-accent" /> Investor GTM Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {investorSnap.growth_model_type && <div className="rounded-lg bg-accent/5 border border-accent/20 p-4 text-center"><Badge className="mb-1">{investorSnap.growth_model_type}</Badge><p className="text-xs text-muted-foreground mt-1">Growth Model</p></div>}
              {investorSnap.capital_for_scale && <div className="rounded-lg border p-4 text-center"><p className="text-xl font-bold text-accent">{fmt(investorSnap.capital_for_scale)}</p><p className="text-xs text-muted-foreground">Capital for Scale</p></div>}
              {investorSnap.time_to_predictable_growth && <div className="rounded-lg border p-4 text-center"><p className="text-xl font-bold text-primary">{investorSnap.time_to_predictable_growth}</p><p className="text-xs text-muted-foreground">To Predictable Growth</p></div>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {investorSnap.entry_strategy && <div className="rounded-lg border p-3"><p className="text-xs font-medium text-primary mb-1">Entry Strategy</p><p className="text-sm">{investorSnap.entry_strategy}</p></div>}
              {investorSnap.primary_constraint && <div className="rounded-lg border p-3"><p className="text-xs font-medium text-destructive mb-1">Primary Constraint</p><p className="text-sm">{investorSnap.primary_constraint}</p></div>}
              {investorSnap.exit_scale_potential && <div className="rounded-lg border p-3"><p className="text-xs font-medium text-green-700 mb-1">Exit/Scale Potential</p><p className="text-sm">{investorSnap.exit_scale_potential}</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== ACTIONS ========== */}
      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Button variant="outline" className="gap-2" onClick={onRerun}><RotateCcw className="h-4 w-4" /> Re-run Analysis</Button>
        <Button variant="hero" className="gap-2" onClick={() => setShowLockModal(true)}>
          <Lock className="h-4 w-4" /> Lock & View Master Summary <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Lock Modal */}
      <Dialog open={showLockModal} onOpenChange={setShowLockModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Finalize Phase 3?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Locking Phase 3 will finalize your GTM blueprint. Proceed to Master Venture Summary?</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowLockModal(false)}>Cancel</Button>
            <Button variant="hero" onClick={confirmLock}>Confirm & Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
