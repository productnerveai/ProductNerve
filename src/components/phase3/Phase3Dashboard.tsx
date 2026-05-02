import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  RotateCcw, Lock, ArrowRight, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Target, Megaphone, DollarSign, Eye, Shield, HelpCircle,
  Briefcase, Zap, ArrowRightLeft, BarChart3, Brain, Rocket, Activity,
  Clock, Beaker, Building2, Search, Share2, Tag, Users, RefreshCw, Swords, Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { ScoreTooltip, getLayerTooltip } from "@/components/ui/score-tooltip";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

// FIX 1: Added "Fragile Growth Structure" and all known tiers
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

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase3/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const projectData = data.data;

        if (projectData.phase3_status === 'not_started') {
          setScores(null);
          setLoading(false);
          return;
        }

        const phase3Analysis = projectData.phase3_growth_data?.phase3_analysis || projectData.phase3_analysis;
        const pillarScores = phase3Analysis?.scoring_audit?.pillar_scores || {};

        // FIX 2: Layer scores now correctly map to actual DB pillar keys
        const transformedData = {
          growth_score: projectData.growth_score,
          classification: projectData.growth_classification,
          action_directive: phase3Analysis?.executive_summary?.action_directive,
          growth_risk_level: phase3Analysis?.executive_summary?.growth_risk_level,
          action_summary: phase3Analysis?.executive_summary?.action_summary,
          growth_maturity_tier: phase3Analysis?.executive_summary?.growth_maturity_tier,
          primary_constraint: "Customer discovery validation required",
          ltv_cac_ratio: "Not calculated",

          // FIX 3: Layer breakdown now uses correct pillar keys from DB
          entry_score: pillarScores?.customer_clarity?.score ?? 0,
          org_score: pillarScores?.market_timing?.score ?? 0,
          demand_score: pillarScores?.distribution_feasibility?.score ?? 0,
          conversion_score: pillarScores?.revenue_model?.score ?? 0,
          scale_score: pillarScores?.pricing_strategy?.score ?? 0,
          economics_score: pillarScores?.sales_efficiency?.score ?? 0,
          retention_score: pillarScores?.retention_potential?.score ?? 0,
          competitive_score: pillarScores?.competitive_advantage?.score ?? 0,

          base_score: phase3Analysis?.scoring_audit?.base_score,
          final_score: phase3Analysis?.scoring_audit?.final_score,
          risk_penalty: phase3Analysis?.scoring_audit?.risk_penalty,
          maturity_boost: phase3Analysis?.scoring_audit?.maturity_boost,

          // Growth Confidence Index
          growth_confidence_overall: phase3Analysis?.growth_confidence?.overall,
          growth_confidence_customer_clarity: phase3Analysis?.growth_confidence?.customer_clarity,
          growth_confidence_market_timing: phase3Analysis?.growth_confidence?.market_timing,
          growth_confidence_distribution_feasibility: phase3Analysis?.growth_confidence?.distribution_feasibility,
          growth_confidence_revenue_model: phase3Analysis?.growth_confidence?.revenue_model,
          growth_confidence_pricing_strategy: phase3Analysis?.growth_confidence?.pricing_strategy,
          growth_confidence_sales_efficiency: phase3Analysis?.growth_confidence?.sales_efficiency,
          growth_confidence_retention_potential: phase3Analysis?.growth_confidence?.retention_potential,
          growth_confidence_competitive_advantage: phase3Analysis?.growth_confidence?.competitive_advantage,

          scale_signals: phase3Analysis?.scale_pivot_kill?.scale_signals || [],
          pivot_signals: phase3Analysis?.scale_pivot_kill?.pivot_signals || [],
          kill_signals: phase3Analysis?.scale_pivot_kill?.kill_signals || [],
          gtm_blueprint: phase3Analysis,
        };

        setScores(transformedData);
      } else {
        setScores(null);
      }
    } catch (error) {
      console.error('Failed to load Phase 3 dashboard data:', error);
      setScores(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmLock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase3/${projectId}/lock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setShowLockModal(false);
        toast.success("Phase 3 locked. Venture Blueprint complete!");
        onLockProceed?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to lock Phase 3");
      }
    } catch (error) {
      console.error('Phase 3 lock error:', error);
      toast.error("Network error while locking Phase 3");
    }
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

  // FIX 4: Layer breakdown labels now correctly reflect what each pillar score actually measures
  const layerData = [
    { layer: "Customer Clarity", score: Number(scores.entry_score), weight: "20%" },
    { layer: "Market Timing", score: Number(scores.org_score), weight: "20%" },
    { layer: "Distribution", score: Number(scores.demand_score), weight: "15%" },
    { layer: "Revenue Model", score: Number(scores.conversion_score), weight: "20%" },
    { layer: "Pricing Strategy", score: Number(scores.scale_score), weight: "15%" },
    { layer: "Sales Efficiency", score: Number(scores.economics_score), weight: "20%" },
    { layer: "Retention Potential", score: Number(scores.retention_score), weight: "20%" },
    { layer: "Competitive Advantage", score: Number(scores.competitive_score), weight: "20%" },
  ].filter(l => l.score > 0); // only show pillars that have data

  const pillarScores = scoringAudit.pillar_scores || {};

  // FIX 5: pillarEntries now matches actual DB keys exactly
  const pillarEntries = [
    { key: "customer_clarity",         label: "Customer Clarity",      max: 20, icon: <Target className="h-3.5 w-3.5" /> },
    { key: "market_timing",            label: "Market Timing",         max: 20, icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "distribution_feasibility", label: "Distribution",          max: 15, icon: <Megaphone className="h-3.5 w-3.5" /> },
    { key: "revenue_model",            label: "Revenue Model",         max: 20, icon: <DollarSign className="h-3.5 w-3.5" /> },
    { key: "pricing_strategy",         label: "Pricing Strategy",      max: 15, icon: <Tag className="h-3.5 w-3.5" /> },
    { key: "sales_efficiency",         label: "Sales Efficiency",      max: 20, icon: <Users className="h-3.5 w-3.5" /> },
    { key: "retention_potential",      label: "Retention Potential",   max: 20, icon: <RefreshCw className="h-3.5 w-3.5" /> },
    { key: "competitive_advantage",    label: "Competitive Advantage", max: 20, icon: <Swords className="h-3.5 w-3.5" /> },
  ];

  const reasoningStages = [
    { key: "stage_1_customer",    label: "Customer Clarity",    icon: <Target className="h-3.5 w-3.5" /> },
    { key: "stage_2_trigger",     label: "Buying Triggers",     icon: <Zap className="h-3.5 w-3.5" /> },
    { key: "stage_3_discovery",   label: "Customer Discovery",  icon: <Search className="h-3.5 w-3.5" /> },
    { key: "stage_4_distribution",label: "Distribution Access", icon: <Megaphone className="h-3.5 w-3.5" /> },
    { key: "stage_5_revenue",     label: "Revenue Model",       icon: <DollarSign className="h-3.5 w-3.5" /> },
    { key: "stage_6_pricing",     label: "Pricing Strategy",    icon: <Tag className="h-3.5 w-3.5" /> },
    { key: "stage_7_sales",       label: "Sales Motion",        icon: <Users className="h-3.5 w-3.5" /> },
    { key: "stage_8_value",       label: "Time-to-Value",       icon: <Clock className="h-3.5 w-3.5" /> },
    { key: "stage_9_retention",   label: "Retention Logic",     icon: <RefreshCw className="h-3.5 w-3.5" /> },
    { key: "stage_10_competitive",label: "Competitive Edge",    icon: <Swords className="h-3.5 w-3.5" /> },
    { key: "stage_11_channel",    label: "Channel Strategy",    icon: <Share2 className="h-3.5 w-3.5" /> },
    { key: "stage_12_economics",  label: "Unit Economics",      icon: <Calculator className="h-3.5 w-3.5" /> },
    { key: "stage_13_growth",     label: "Growth Target",       icon: <Target className="h-3.5 w-3.5" /> },
    { key: "stage_14_capital",    label: "GTM Capital",         icon: <Briefcase className="h-3.5 w-3.5" /> },
    { key: "stage_15_scale",      label: "Scale Intent",        icon: <Rocket className="h-3.5 w-3.5" /> },
  ];

  // FIX 6: Helper to safely get a numeric confidence color (handles both numeric and string values)
  const getConfidenceNumericColor = (val: any) => {
    const n = Number(val);
    if (!isNaN(n)) {
      return n >= 80 ? "hsl(var(--primary))" : n >= 60 ? "hsl(var(--accent))" : "hsl(var(--destructive))";
    }
    // string fallback
    const s = String(val).toLowerCase();
    if (s === "high") return "hsl(var(--primary))";
    if (s === "moderate") return "hsl(var(--accent))";
    return "hsl(var(--destructive))";
  };

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
            {/* FIX 7: Uses growth_maturity_tier from exec first, then classification fallback */}
            <div className={`rounded-xl p-4 text-center border ${classColor(exec.growth_maturity_tier || scores.growth_maturity_tier || scores.classification)}`}>
              <p className="text-base font-bold">{exec.growth_maturity_tier || scores.growth_maturity_tier || scores.classification}</p>
              <p className="text-xs mt-1 opacity-70">GTM Maturity Tier</p>
            </div>
            <div className={`rounded-xl p-4 text-center border ${directiveColor(exec.action_directive || scores.action_directive)}`}>
              <p className="text-sm font-bold">{exec.action_directive || scores.action_directive}</p>
              <p className="text-xs mt-1 opacity-70">Action Directive</p>
            </div>
            {(growthConfidence.overall || scores.growth_confidence_overall) && (
              <div className={`rounded-xl p-4 text-center border ${confidenceColor(growthConfidence.overall || scores.growth_confidence_overall)}`}>
                <p className="text-base font-bold capitalize">{growthConfidence.overall || scores.growth_confidence_overall}</p>
                <p className="text-xs mt-1 opacity-70">Growth Confidence</p>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold text-accent">{scores.ltv_cac_ratio || unitEcon.ltv_cac_ratio || "—"}</p>
              <p className="text-xs text-muted-foreground">LTV/CAC Ratio</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColor(exec.growth_risk_level || scores.growth_risk_level)}`}>
                {exec.growth_risk_level || scores.growth_risk_level || "—"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Growth Risk</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs font-medium text-primary">{scores.primary_constraint || reasoningTrace.stage_11_constraint || "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">Primary Constraint</p>
            </div>
          </div>

          {exec.strategic_insight && (
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
              <p className="text-sm leading-relaxed">{exec.strategic_insight}</p>
            </div>
          )}
          {!exec.strategic_insight && (exec.action_summary || scores.action_summary) && (
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-accent">
              <p className="text-sm leading-relaxed">{exec.action_summary || scores.action_summary}</p>
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
                    {stage.classification && (
                      <Badge variant="outline" className="text-xs">{stage.classification}</Badge>
                    )}
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

            {/* FIX 8: stage_9_risks key corrected — DB uses stage_11_risks */}
            {(reasoningTrace.stage_9_risks || reasoningTrace.stage_11_risks) && (
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" /> Risk Classification
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(reasoningTrace.stage_9_risks || reasoningTrace.stage_11_risks).map(([k, v]) => (
                    <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full border ${severityColor(v as string)}`}>
                      {k.replace(/_/g, " ")}: {v as string}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FIX 9: Also check stage_11_constraint from DB */}
            {(reasoningTrace.stage_10_constraint || reasoningTrace.stage_11_constraint) && (
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                <p className="text-xs font-semibold text-destructive">
                  {reasoningTrace.stage_10_constraint || reasoningTrace.stage_11_constraint}
                </p>
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

            {/* FIX 10: Pillar bars now render using correct DB keys */}
            {Object.keys(pillarScores).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Pillar Scores</p>
                {pillarEntries.map(({ key, label, max, icon }) => {
                  const p = pillarScores[key];
                  if (!p) return null;
                  const score = Number(p.score);
                  const pct = Math.min((score / max) * 100, 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium flex items-center gap-1.5">{icon} {label}</span>
                        <span className="font-bold">{score}/{max}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct >= 70 ? "hsl(var(--primary))" : pct >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))"
                          }}
                        />
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
                  <p className="text-[10px] text-muted-foreground">Base Score</p>
                </div>
              )}
              {scoringAudit.risk_penalty != null && (
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-destructive">-{scoringAudit.risk_penalty}</p>
                  <p className="text-[10px] text-muted-foreground">Risk Penalty</p>
                </div>
              )}
              {scoringAudit.maturity_boost != null && (
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-green-600">+{scoringAudit.maturity_boost}</p>
                  <p className="text-[10px] text-muted-foreground">Maturity Boost</p>
                </div>
              )}
              {scoringAudit.final_score != null && (
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-primary">{scoringAudit.final_score}</p>
                  <p className="text-[10px] text-muted-foreground">Final Score</p>
                </div>
              )}
            </div>

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
      {(growthConfidence.overall || scores.growth_confidence_overall) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" /> Growth Confidence Index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: "Customer Clarity",    val: growthConfidence.customer_clarity         ?? scores.growth_confidence_customer_clarity },
                { label: "Market Timing",        val: growthConfidence.market_timing            ?? scores.growth_confidence_market_timing },
                { label: "Distribution",         val: growthConfidence.distribution_feasibility ?? scores.growth_confidence_distribution_feasibility },
                { label: "Revenue Model",        val: growthConfidence.revenue_model            ?? scores.growth_confidence_revenue_model },
                { label: "Pricing Strategy",     val: growthConfidence.pricing_strategy         ?? scores.growth_confidence_pricing_strategy },
              ].map(({ label, val }) => val != null ? (
                <div key={label} className="rounded-lg border p-2 text-center">
                  <p className="text-lg font-bold" style={{ color: getConfidenceNumericColor(val) }}>{val}</p>
                  <p className="text-[9px] text-muted-foreground">{label}</p>
                </div>
              ) : null)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Sales Efficiency",      val: growthConfidence.sales_efficiency      ?? scores.growth_confidence_sales_efficiency },
                { label: "Retention Potential",   val: growthConfidence.retention_potential   ?? scores.growth_confidence_retention_potential },
                { label: "Competitive Advantage", val: growthConfidence.competitive_advantage ?? scores.growth_confidence_competitive_advantage },
                { label: "Overall",               val: growthConfidence.overall               ?? scores.growth_confidence_overall },
              ].map(({ label, val }) => val != null ? (
                <div key={label} className="rounded-lg border p-2 text-center">
                  <p
                    className="text-lg font-bold capitalize"
                    style={{ color: getConfidenceNumericColor(val) }}
                  >{val}</p>
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
      {layerData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" /> Pillar Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {layerData.map((entry) => {
                const tooltip = getLayerTooltip(entry.layer, entry.score);
                return (
                  <ScoreTooltip
                    key={entry.layer}
                    label={entry.layer}
                    score={entry.score}
                    meaning={tooltip.meaning}
                    reason={tooltip.reason}
                    improvement={tooltip.improvement}
                  >
                    <div className="cursor-help">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                          {entry.layer} <span className="text-muted-foreground">({entry.weight})</span>
                        </span>
                        <span className="font-bold" style={{ color: getBarColor(entry.score) }}>
                          {entry.score.toFixed(0)}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(entry.score, 100)}%`, backgroundColor: getBarColor(entry.score) }}
                        />
                      </div>
                    </div>
                  </ScoreTooltip>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${c.type === "Primary" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {c.type || c.priority}
                      </span>
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
              {unitEcon.ltv_cac_ratio && <div className="rounded-lg border p-3 text-center"><p className="text-sm font-bold text-accent">{unitEcon.ltv_cac_ratio}</p><p className="text-[10px] text-muted-foreground">LTV/CAC</p></div>}
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
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h6 className="text-sm font-semibold">Scale Signals</h6>
              </div>
              <div className="space-y-2">
                {scaleSignals.map((s: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="flex gap-1.5 items-start">
                      <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
                      <span className="font-medium">{s.signal || s}</span>
                    </div>
                    {s.metric_threshold && <p className="text-[10px] text-muted-foreground ml-4">Threshold: {s.metric_threshold}</p>}
                    {s.observation_period && <p className="text-[10px] text-muted-foreground ml-4">Window: {s.observation_period}</p>}
                  </div>
                ))}
                {scaleSignals.length === 0 && <p className="text-xs text-muted-foreground">None detected</p>}
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h6 className="text-sm font-semibold">Pivot Signals</h6>
              </div>
              <div className="space-y-2">
                {pivotSignals.map((s: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="flex gap-1.5 items-start">
                      <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                      <span className="font-medium">{s.signal || s}</span>
                    </div>
                    {s.metric_threshold && <p className="text-[10px] text-muted-foreground ml-4">Threshold: {s.metric_threshold}</p>}
                  </div>
                ))}
                {pivotSignals.length === 0 && <p className="text-xs text-muted-foreground">None detected</p>}
              </div>
            </div>
            <div className="rounded-lg border border-red-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-4 w-4 text-red-600" />
                <h6 className="text-sm font-semibold">Kill Signals</h6>
              </div>
              <div className="space-y-2">
                {killSignals.map((s: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="flex gap-1.5 items-start">
                      <XCircle className="h-3 w-3 text-red-600 mt-0.5 shrink-0" />
                      <span className="font-medium">{s.signal || s}</span>
                    </div>
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
                        <li key={j} className="text-xs flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />{d}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-3 text-[10px]">
                    {p.kpi_targets?.length > 0 && (
                      <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-full">
                        📊 {Array.isArray(p.kpi_targets) ? p.kpi_targets.join(", ") : p.kpi_targets}
                      </span>
                    )}
                    {p.decision_gate && (
                      <span className="bg-accent/5 text-accent px-2 py-0.5 rounded-full">🚦 {p.decision_gate}</span>
                    )}
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
                      <span>
                        <span className="font-medium">{t.trigger}</span> → Hire: {t.role_to_add}
                        {t.metric_threshold && ` (${t.metric_threshold})`}
                      </span>
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
                { label: "Acquisition Risk",      data: riskClusters.acquisition_risk },
                { label: "Retention Risk",         data: riskClusters.retention_risk },
                { label: "Monetization Risk",      data: riskClusters.monetization_risk },
                { label: "Channel Dependency",     data: riskClusters.channel_dependency_risk },
                { label: "Economic Risk",          data: riskClusters.economic_risk },
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
              {investorSnap.growth_model_type && (
                <div className="rounded-lg bg-accent/5 border border-accent/20 p-4 text-center">
                  <Badge className="mb-1">{investorSnap.growth_model_type}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Growth Model</p>
                </div>
              )}
              {investorSnap.capital_for_scale && (
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-xl font-bold text-accent">{fmt(investorSnap.capital_for_scale)}</p>
                  <p className="text-xs text-muted-foreground">Capital for Scale</p>
                </div>
              )}
              {investorSnap.time_to_predictable_growth && (
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-xl font-bold text-primary">{investorSnap.time_to_predictable_growth}</p>
                  <p className="text-xs text-muted-foreground">To Predictable Growth</p>
                </div>
              )}
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
        <Button variant="outline" className="gap-2" onClick={onRerun}>
          <RotateCcw className="h-4 w-4" /> Re-run Analysis
        </Button>
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