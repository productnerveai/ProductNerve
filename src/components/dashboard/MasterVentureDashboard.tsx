import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileDown, AlertTriangle, CheckCircle2, XCircle, TrendingUp,
  Shield, Clock, DollarSign, Target, Zap, Pause,
  ArrowRightLeft, History, BarChart3, Layers, Activity,
  CircleDot, Flame, Eye, Lightbulb, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

interface MasterVentureDashboardProps {
  project: any;
  onExportPDF: () => void;
}

export default function MasterVentureDashboard({ project, onExportPDF }: MasterVentureDashboardProps) {
  const [p1Scores, setP1Scores] = useState<any>(null);
  const [p2Scores, setP2Scores] = useState<any>(null);
  const [p3Scores, setP3Scores] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [synthesis, setSynthesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => { loadData(); }, [project.id]);

  const loadData = async () => {
    setLoading(true);
    // const [r1, r2, r3, snaps] = await Promise.all([
    //   supabase.from("phase1_scores").select("*").eq("project_id", project.id).maybeSingle(),
    //   supabase.from("phase2_scores").select("*").eq("project_id", project.id).maybeSingle(),
    //   supabase.from("phase3_scores").select("*").eq("project_id", project.id).maybeSingle(),
    //   supabase.from("phase_snapshots").select("*").eq("project_id", project.id).order("created_at", { ascending: false }).limit(20),
    // ]);
    // setP1Scores(r1.data);
    // setP2Scores(r2.data);
    // setP3Scores(r3.data);
    // setSnapshots(snaps.data || []);
    setLoading(false);

    // Auto-run synthesis if all phases scored
    // if (r1.data && r2.data && r3.data) {
    //   runSynthesis();
    // }
  };

  const runSynthesis = async () => {
    setSynthesizing(true);
    try {
      // const { data, error } = await supabase.functions.invoke("venture-synthesis", {
      //   body: { projectId: project.id },
      // });
      // if (error) throw error;
      // if (data?.synthesis) setSynthesis(data.synthesis);
    } catch (err: any) {
      console.error("Synthesis error:", err);
    } finally {
      setSynthesizing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const p1 = p1Scores ? Number(p1Scores.viability_score) : null;
  const p2 = p2Scores ? Number(p2Scores.execution_score) : null;
  const p3 = p3Scores ? Number(p3Scores.growth_score) : null;
  const hasAllPhases = p1 !== null && p2 !== null && p3 !== null;

  // Use synthesis data if available, otherwise fallback
  const s = synthesis;
  const compositeScore = s?.composite_score ?? (hasAllPhases ? Math.round(p1! * 0.4 + p2! * 0.3 + p3! * 0.3) : null);
  const classification = s?.classification ?? (compositeScore !== null ? fallbackClass(compositeScore) : null);
  const verdict = s?.verdict ?? null;

  const fmt = (n: any) => {
    const v = Number(n);
    if (isNaN(v) || v === 0) return "—";
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  const verdictConfig: Record<string, { color: string; icon: any; desc: string }> = {
    "Proceed Structured": { color: "bg-green-50 border-green-300 text-green-800", icon: Shield, desc: "All systems aligned. Execute with structured monitoring and scaling triggers." },
    "Proceed Lean": { color: "bg-emerald-50 border-emerald-300 text-emerald-800", icon: Zap, desc: "Viable but constrained. Proceed lean with tight validation loops and capital discipline." },
    "Repair & Validate": { color: "bg-amber-50 border-amber-300 text-amber-800", icon: ArrowRightLeft, desc: "Structural gaps detected. Repair weakest layers and validate before scaling." },
    "Delay & Rework": { color: "bg-orange-50 border-orange-300 text-orange-800", icon: Pause, desc: "Critical misalignments. Rework foundational layers before proceeding." },
    "Kill": { color: "bg-red-50 border-red-300 text-red-800", icon: XCircle, desc: "Fundamental viability failure. Discontinue or radically pivot the venture." },
    "Kill or Radical Pivot": { color: "bg-red-50 border-red-300 text-red-800", icon: XCircle, desc: "Venture not viable in current form. Radical restructuring required." },
  };

  const classColor = (c: string) => {
    if (c === "Venture-Grade") return "text-green-700";
    if (c === "Structurally Sound") return "text-emerald-700";
    if (c === "Repairable but Fragile") return "text-amber-700";
    if (c === "High Structural Risk") return "text-orange-700";
    return "text-destructive";
  };

  // Aggregate risks by severity
  const collectRisks = () => {
    const all: { text: string; source: string; severity: string }[] = [];
    const addFlags = (flags: any, source: string) => {
      if (!Array.isArray(flags)) return;
      flags.forEach((f: any) => {
        if (typeof f === "string") all.push({ text: f, source, severity: "moderate" });
        else if (f?.text || f?.flag) all.push({ text: f.text || f.flag, source, severity: f.severity || "moderate" });
      });
    };
    if (p1Scores) {
      addFlags(p1Scores.reality_risk_flags, "Validation");
      addFlags(p1Scores.market_risk_flags, "Validation");
      addFlags(p1Scores.buyer_risk_flags, "Validation");
      addFlags(p1Scores.competitive_risk_flags, "Validation");
      addFlags(p1Scores.founder_risk_flags, "Validation");
    }
    if (p2Scores) {
      addFlags(p2Scores.research_risk_flags, "Execution");
      addFlags(p2Scores.scoping_risk_flags, "Execution");
      addFlags(p2Scores.arch_risk_flags, "Execution");
      addFlags(p2Scores.resource_risk_flags, "Execution");
      addFlags(p2Scores.mvp_risk_flags, "Execution");
    }
    if (p3Scores) {
      addFlags(p3Scores.entry_risk_flags, "Growth");
      addFlags(p3Scores.org_risk_flags, "Growth");
      addFlags(p3Scores.demand_risk_flags, "Growth");
      addFlags(p3Scores.conversion_risk_flags, "Growth");
      addFlags(p3Scores.scale_risk_flags, "Growth");
      addFlags(p3Scores.economics_risk_flags, "Growth");
    }
    return all;
  };
  const allRisks = collectRisks();
  const highRisks = allRisks.filter(r => r.severity === "high");
  const modRisks = allRisks.filter(r => r.severity === "moderate");
  const lowRisks = allRisks.filter(r => r.severity === "low");

  const assumptions = Array.isArray(p1Scores?.assumption_checklist) ? p1Scores.assumption_checklist : [];
  const validatedAssumptions = assumptions.filter((a: any) => a.validated);
  const unvalidatedAssumptions = assumptions.filter((a: any) => !a.validated);

  const blueprint = (p3Scores?.gtm_blueprint || {}) as any;
  const roadmap = Array.isArray(p3Scores?.action_90day_plan) ? p3Scores.action_90day_plan : (Array.isArray(blueprint?.roadmap_90day) ? blueprint.roadmap_90day : []);
  const scaleSignals = Array.isArray(p3Scores?.scale_signals) ? p3Scores.scale_signals : [];
  const pivotSignals = Array.isArray(p3Scores?.pivot_signals) ? p3Scores.pivot_signals : [];
  const killSignals = Array.isArray(p3Scores?.kill_signals) ? p3Scores.kill_signals : [];
  const valReport = p1Scores?.validation_report as any;
  const exeReport = p2Scores?.execution_report as any;

  // Maturity
  const getMaturityLevel = (score: number | null) => {
    if (score === null) return 0;
    if (score >= 80) return 3;
    if (score >= 65) return 2;
    if (score >= 45) return 1;
    return 0;
  };
  const maturityLabels = ["Conceptual", "Structured", "Operational", "Scalable"];
  const maturityDimensions = [
    { label: "Validation", level: getMaturityLevel(p1) },
    { label: "Execution", level: getMaturityLevel(p2) },
    { label: "Growth", level: getMaturityLevel(p3) },
    { label: "Economics", level: getMaturityLevel(p3Scores ? Number(p3Scores.economics_score) : null) },
    { label: "Governance", level: getMaturityLevel(p3Scores ? Number(p3Scores.scale_score) : null) },
  ];

  const SectionHeader = ({ icon: Icon, title, number }: { icon: any; title: string; number: number }) => (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Section {number}</span>
        <h3 className="text-base font-bold leading-tight">{title}</h3>
      </div>
    </div>
  );

  const MetricRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold ${highlight ? "text-primary" : ""}`}>{value}</span>
    </div>
  );

  const RiskItem = ({ risk }: { risk: { text: string; source: string } }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-start gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs cursor-default hover:bg-muted/50 transition-colors">
          <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
          <span className="line-clamp-2">{risk.text}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs"><span className="font-semibold">Source:</span> {risk.source}</p>
        <p className="text-xs mt-1">{risk.text}</p>
      </TooltipContent>
    </Tooltip>
  );

  const SignalCard = ({ signal }: { signal: any }) => {
    const text = typeof signal === "string" ? signal : signal?.signal || signal?.text || JSON.stringify(signal);
    const metric = typeof signal === "object" ? signal?.metric_threshold || signal?.metric : null;
    const window = typeof signal === "object" ? signal?.observation_period || signal?.window : null;
    const consequence = typeof signal === "object" ? signal?.decision_consequence || signal?.consequence : null;
    return (
      <div className="rounded-lg border border-border/60 p-3 space-y-1.5">
        <p className="text-xs font-medium">{text}</p>
        {metric && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metric:</span> {metric}</p>}
        {window && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Window:</span> {window}</p>}
        {consequence && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Action:</span> {consequence}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* ═══ SECTION 1: EXECUTIVE VENTURE SNAPSHOT ═══ */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <SectionHeader icon={BarChart3} title="Executive Venture Snapshot" number={1} />
          {hasAllPhases && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={runSynthesis} disabled={synthesizing}>
              <RefreshCw className={`h-3 w-3 ${synthesizing ? "animate-spin" : ""}`} />
              {synthesizing ? "Analyzing..." : "Re-analyze"}
            </Button>
          )}
        </div>

        {/* Phase scores */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Viability (P1)</p>
            <p className={`text-2xl font-bold ${p1 !== null ? "text-primary" : "text-muted-foreground/30"}`}>{p1 !== null ? p1.toFixed(0) : "—"}</p>
            {s && <p className="text-[10px] text-muted-foreground mt-0.5">Weight: {(s.weights_used.p1 * 100).toFixed(0)}% → +{(p1! * s.weights_used.p1).toFixed(1)}</p>}
            {!s && p1 !== null && <p className="text-[10px] text-muted-foreground mt-0.5">Weight: 40% → +{(p1 * 0.4).toFixed(1)}</p>}
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Execution (P2)</p>
            <p className={`text-2xl font-bold ${p2 !== null ? "text-accent" : "text-muted-foreground/30"}`}>{p2 !== null ? p2.toFixed(0) : "—"}</p>
            {s && <p className="text-[10px] text-muted-foreground mt-0.5">Weight: {(s.weights_used.p2 * 100).toFixed(0)}% → +{(p2! * s.weights_used.p2).toFixed(1)}</p>}
            {!s && p2 !== null && <p className="text-[10px] text-muted-foreground mt-0.5">Weight: 30% → +{(p2 * 0.3).toFixed(1)}</p>}
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Growth (P3)</p>
            <p className={`text-2xl font-bold ${p3 !== null ? "text-primary" : "text-muted-foreground/30"}`}>{p3 !== null ? p3.toFixed(0) : "—"}</p>
            {s && <p className="text-[10px] text-muted-foreground mt-0.5">Weight: {(s.weights_used.p3 * 100).toFixed(0)}% → +{(p3! * s.weights_used.p3).toFixed(1)}</p>}
            {!s && p3 !== null && <p className="text-[10px] text-muted-foreground mt-0.5">Weight: 30% → +{(p3 * 0.3).toFixed(1)}</p>}
          </div>
          <div className={`rounded-xl p-4 text-center ${compositeScore !== null ? "bg-primary text-primary-foreground" : "border border-border/60 bg-card"}`}>
            <p className={`text-[10px] uppercase tracking-widest mb-1 ${compositeScore !== null ? "opacity-70" : "text-muted-foreground"}`}>Composite Score</p>
            <p className={`text-2xl font-bold ${compositeScore === null ? "text-muted-foreground/30" : ""}`}>{compositeScore ?? "—"}</p>
            {classification && <p className="text-[10px] font-semibold mt-0.5 opacity-90">{classification}</p>}
          </div>
        </div>

        {/* Verdict + Constraint */}
        {verdict && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className={`lg:col-span-2 rounded-xl p-5 border-2 ${verdictConfig[verdict]?.color || "bg-muted border-border"}`}>
              <div className="flex items-center gap-3 mb-2">
                {verdictConfig[verdict] && (() => { const Icon = verdictConfig[verdict].icon; return <Icon className="h-5 w-5" />; })()}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest opacity-60">Venture Verdict</p>
                  <p className="text-xl font-bold">{verdict}</p>
                </div>
              </div>
              <p className="text-sm opacity-80">{s?.verdict_reasoning || verdictConfig[verdict]?.desc || ""}</p>
            </div>
            <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-destructive" />
                <p className="text-[10px] font-medium uppercase tracking-widest text-destructive/70">Primary Constraint</p>
              </div>
              <p className="text-sm font-bold text-destructive">{s?.dominant_constraint || "—"}</p>
              {s?.secondary_constraint && <p className="text-[10px] text-muted-foreground mt-1">Secondary: {s.secondary_constraint}</p>}
            </div>
          </div>
        )}

        {/* Structural Friction Flags */}
        {s?.structural_friction_flags?.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Cross-Phase Friction ({s.structural_friction_flags.length})</p>
              {s.friction_ceiling < 100 && <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">Score capped at {s.friction_ceiling}</Badge>}
            </div>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {s.structural_friction_flags.map((f: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-amber-900">
                  <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Capital + Timeline */}
        {hasAllPhases && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-accent" />
                <p className="text-sm font-bold">Capital Overview</p>
                {s?.capital_tier && <Badge variant="outline" className="text-[10px] ml-auto">{s.capital_tier}</Badge>}
              </div>
              <div className="space-y-0.5">
                <MetricRow label="Minimum Viable Capital" value={fmt(p2Scores?.capital_minimum)} />
                <MetricRow label="Recommended Capital" value={fmt(p2Scores?.capital_recommended)} highlight />
                <MetricRow label="Risk Capital Threshold" value={fmt(p2Scores?.capital_risk)} />
                <MetricRow label="12-Month Total Exposure" value={s?.total_capital_12mo ? fmt(s.total_capital_12mo) : "—"} />
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold">Timeline Overview</p>
              </div>
              <div className="space-y-0.5">
                <MetricRow label="Time to MVP" value={s?.timeline?.time_to_mvp || (p2Scores?.timeline_min_weeks ? `${Number(p2Scores.timeline_min_weeks).toFixed(0)} weeks` : "—")} />
                <MetricRow label="Time to Revenue" value={s?.timeline?.time_to_revenue || (p2Scores?.timeline_max_weeks ? `${Number(p2Scores.timeline_max_weeks).toFixed(0)} weeks` : "—")} />
                <MetricRow label="Retention Proof" value={s?.timeline?.time_to_retention_proof || "—"} />
                <MetricRow label="Scale Eligibility" value={s?.timeline?.scale_eligibility || p3Scores?.scale_recommendation || "—"} highlight />
              </div>
              {s?.timeline?.flags?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/40">
                  {s.timeline.flags.map((f: string, i: number) => (
                    <p key={i} className="text-[10px] text-amber-700 flex items-center gap-1"><AlertTriangle className="h-2.5 w-2.5" />{f}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ SCORING AUDIT (Collapsible) ═══ */}
      {s?.scoring_audit && (
        <Collapsible open={auditOpen} onOpenChange={setAuditOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-2">
              {auditOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              <span className="font-medium uppercase tracking-wider">Scoring Decision Audit</span>
              <div className="flex-1 h-px bg-border/60" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><span className="text-muted-foreground">Base Score:</span> <span className="font-bold">{s.scoring_audit.step1_base}</span></div>
                <div><span className="text-muted-foreground">Conflicts:</span> <span className="font-bold text-destructive">{s.scoring_audit.step3_conflict_penalty}</span></div>
                <div><span className="text-muted-foreground">Constraint:</span> <span className="font-bold text-destructive">{s.scoring_audit.step4_constraint_penalty}</span></div>
                <div><span className="text-muted-foreground">Coherence:</span> <span className="font-bold text-green-700">+{s.scoring_audit.step5_coherence_bonus}</span></div>
                <div><span className="text-muted-foreground">Risk Penalty:</span> <span className="font-bold text-destructive">{s.scoring_audit.step6_risk_penalty}</span></div>
                <div><span className="text-muted-foreground">Assumptions:</span> <span className="font-bold text-destructive">{s.scoring_audit.step7_assumption_penalty}</span></div>
                <div><span className="text-muted-foreground">Capital:</span> <span className="font-bold text-destructive">{s.scoring_audit.step8_capital_penalty}</span></div>
                <div><span className="text-muted-foreground">Final:</span> <span className="font-bold text-primary text-sm">{s.scoring_audit.step9_final}</span></div>
              </div>
              {s.scoring_audit.step2_hard_caps?.length > 0 && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Hard Caps Applied:</p>
                  {s.scoring_audit.step2_hard_caps.map((cap: string, i: number) => (
                    <p key={i} className="text-destructive">• {cap}</p>
                  ))}
                </div>
              )}
              {s.cross_phase_conflicts?.length > 0 && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Cross-Phase Conflicts:</p>
                  {s.cross_phase_conflicts.map((c: any, i: number) => (
                    <p key={i} className="text-amber-700">• {c.name} ({c.penalty})</p>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-border/40 grid grid-cols-3 gap-2 text-[10px]">
                <div>Weights: P1={s.weights_used.p1} P2={s.weights_used.p2} P3={s.weights_used.p3}</div>
                <div>High Risks: {s.high_risk_count}</div>
                <div>Unvalidated: {s.unvalidated_assumptions_count} {s.revenue_assumption_unvalidated && "⚠️ Revenue"}</div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ═══ SECTION 2: PHASE SUMMARIES ═══ */}
      {hasAllPhases && (
        <div className="space-y-5">
          <SectionHeader icon={Layers} title="Phase Intelligence Summaries" number={2} />
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Phase 1 */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Market Validation</p>
                <Badge variant="outline" className="text-xs">{p1?.toFixed(0)}/100</Badge>
              </div>
              <div className="space-y-0.5">
                <MetricRow label="Demand" value={s?.phase_summaries?.phase1?.demand_classification || valReport?.demand_classification || p1Scores?.classification || "—"} />
                <MetricRow label="ICP Precision" value={s?.phase_summaries?.phase1?.icp_precision || valReport?.icp_precision_tier || "—"} />
                <MetricRow label="Competitive" value={s?.phase_summaries?.phase1?.competitive_intensity || valReport?.competitive_intensity || "—"} />
                <MetricRow label="Founder Leverage" value={s?.phase_summaries?.phase1?.founder_leverage || valReport?.founder_leverage_tier || "—"} />
              </div>
              {validatedAssumptions.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Validated ({validatedAssumptions.length})</p>
                  {validatedAssumptions.slice(0, 3).map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] py-0.5">
                      <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                      <span className="line-clamp-1">{a.assumption}</span>
                    </div>
                  ))}
                </div>
              )}
              {unvalidatedAssumptions.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-destructive/70 font-medium mb-1">Fragile ({unvalidatedAssumptions.length})</p>
                  {unvalidatedAssumptions.slice(0, 3).map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] py-0.5">
                      <XCircle className="h-3 w-3 text-destructive shrink-0" />
                      <span className="line-clamp-1">{a.assumption}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Phase 2 */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Execution Structure</p>
                <Badge variant="outline" className="text-xs">{p2?.toFixed(0)}/100</Badge>
              </div>
              <div className="space-y-0.5">
                <MetricRow label="Mode" value={s?.phase_summaries?.phase2?.execution_mode?.replace(/_/g, " ") || p2Scores?.execution_mode?.replace(/_/g, " ") || "—"} />
                <MetricRow label="Maturity" value={p2Scores?.classification || "—"} />
                <MetricRow label="Capital" value={fmt(p2Scores?.capital_recommended)} />
                <MetricRow label="Timeline" value={p2Scores?.timeline_min_weeks ? `${Number(p2Scores.timeline_min_weeks).toFixed(0)}w` : "—"} />
              </div>
              {exeReport?.mves_summary && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">MVES</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-3">{exeReport.mves_summary}</p>
                </div>
              )}
            </div>
            {/* Phase 3 */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Growth & GTM</p>
                <Badge variant="outline" className="text-xs">{p3?.toFixed(0)}/100</Badge>
              </div>
              <div className="space-y-0.5">
                <MetricRow label="Growth Maturity" value={p3Scores?.classification || "—"} />
                <MetricRow label="LTV/CAC" value={p3Scores?.economics_ltv_cac_ratio ? `${Number(p3Scores.economics_ltv_cac_ratio).toFixed(1)}x` : "—"} highlight />
                <MetricRow label="Engine" value={s?.phase_summaries?.phase3?.growth_engine_type || blueprint?.growth_engine_type || "—"} />
                <MetricRow label="Constraint" value={s?.phase_summaries?.phase3?.primary_growth_constraint || blueprint?.primary_growth_constraint || "—"} />
              </div>
              {p3Scores?.entry_icp && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Entry</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{p3Scores.entry_icp}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SECTION 3: RISK MATRIX ═══ */}
      {allRisks.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={AlertTriangle} title="Venture Risk Matrix" number={3} />
          {highRisks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <p className="text-xs font-bold text-destructive uppercase tracking-wider">High Severity ({highRisks.length})</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {highRisks.map((r, i) => <RiskItem key={`h-${i}`} risk={r} />)}
              </div>
            </div>
          )}
          {modRisks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Moderate ({modRisks.length})</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {modRisks.map((r, i) => <RiskItem key={`m-${i}`} risk={r} />)}
              </div>
            </div>
          )}
          {lowRisks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Low ({lowRisks.length})</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {lowRisks.map((r, i) => <RiskItem key={`l-${i}`} risk={r} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ SECTION 4: 90-DAY PLAN ═══ */}
      {roadmap.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={Activity} title="Strategic 90-Day Execution Plan" number={4} />
          <div className="grid sm:grid-cols-3 gap-4">
            {roadmap.slice(0, 3).map((month: any, i: number) => {
              const title = month.month || month.title || `Month ${i + 1}`;
              const focus = month.focus || month.strategic_focus || "";
              const deliverables = Array.isArray(month.deliverables) ? month.deliverables : (Array.isArray(month.core_deliverables) ? month.core_deliverables : []);
              const kpis = Array.isArray(month.kpis) ? month.kpis : (Array.isArray(month.kpi_targets) ? month.kpi_targets : []);
              const gate = month.gate || month.decision_gate || "";
              return (
                <div key={i} className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-primary text-primary-foreground" : i === 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                    <p className="text-sm font-bold">{title}</p>
                  </div>
                  {focus && <p className="text-[11px] text-muted-foreground italic">{focus}</p>}
                  {deliverables.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Deliverables</p>
                      {deliverables.slice(0, 4).map((d: any, j: number) => (
                        <p key={j} className="text-[11px] flex items-start gap-1"><CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />{typeof d === "string" ? d : d.name || JSON.stringify(d)}</p>
                      ))}
                    </div>
                  )}
                  {kpis.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">KPIs</p>
                      {kpis.slice(0, 3).map((k: any, j: number) => (
                        <p key={j} className="text-[11px] text-muted-foreground">• {typeof k === "string" ? k : k.metric || JSON.stringify(k)}</p>
                      ))}
                    </div>
                  )}
                  {gate && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 px-2 py-1.5">
                      <p className="text-[10px] font-semibold text-amber-800">Decision Gate</p>
                      <p className="text-[10px] text-amber-700">{gate}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ SECTION 5: SCALE / PIVOT / KILL ═══ */}
      {(scaleSignals.length > 0 || pivotSignals.length > 0 || killSignals.length > 0) && (
        <div className="space-y-4">
          <SectionHeader icon={Shield} title="Scale / Pivot / Kill Governance" number={5} />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Scale ({scaleSignals.length})</p>
              </div>
              {scaleSignals.slice(0, 3).map((sig: any, i: number) => <SignalCard key={i} signal={sig} />)}
              {scaleSignals.length === 0 && <p className="text-xs text-muted-foreground">Not yet defined</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRightLeft className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pivot ({pivotSignals.length})</p>
              </div>
              {pivotSignals.slice(0, 3).map((sig: any, i: number) => <SignalCard key={i} signal={sig} />)}
              {pivotSignals.length === 0 && <p className="text-xs text-muted-foreground">Not yet defined</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-bold text-destructive uppercase tracking-wider">Kill ({killSignals.length})</p>
              </div>
              {killSignals.slice(0, 3).map((sig: any, i: number) => <SignalCard key={i} signal={sig} />)}
              {killSignals.length === 0 && <p className="text-xs text-muted-foreground">Not yet defined</p>}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SECTION 6: ECONOMIC SENSITIVITY ═══ */}
      {(s?.economic_sensitivity || p3Scores) && (
        <div className="space-y-4">
          <SectionHeader icon={DollarSign} title="Economic Sensitivity Panel" number={6} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Base LTV/CAC</p>
              <p className="text-xl font-bold text-primary">{(s?.economic_sensitivity?.base_ltv_cac || Number(p3Scores?.economics_ltv_cac_ratio) || 0).toFixed(1)}x</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">If CAC +20%</p>
              <p className="text-xl font-bold text-amber-700">{(s?.economic_sensitivity?.cac_plus_20 || (Number(p3Scores?.economics_ltv_cac_ratio) / 1.2) || 0).toFixed(1)}x</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">If Retention -15%</p>
              <p className="text-xl font-bold text-orange-700">{s?.economic_sensitivity?.retention_minus_15_ltv || Math.round(Number(p3Scores?.economics_ltv_estimate || 0) * 0.85)}</p>
              <p className="text-[10px] text-muted-foreground">Adj. LTV</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Burn Risk</p>
              <p className={`text-xl font-bold ${(s?.economic_sensitivity?.burn_risk_index || Number(p3Scores?.economics_burn_risk_index)) >= 7 ? "text-destructive" : (s?.economic_sensitivity?.burn_risk_index || Number(p3Scores?.economics_burn_risk_index)) >= 4 ? "text-amber-700" : "text-green-700"}`}>
                {(s?.economic_sensitivity?.burn_risk_index || Number(p3Scores?.economics_burn_risk_index) || 0).toFixed(0)}/10
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SECTION 7: INVESTMENT READINESS ═══ */}
      {hasAllPhases && (
        <div className="space-y-4">
          <SectionHeader icon={Flame} title="Investment Readiness Snapshot" number={7} />
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total Capital (12mo)</p>
                <p className="text-lg font-bold">{s?.total_capital_12mo ? fmt(s.total_capital_12mo) : fmt(p2Scores?.capital_recommended)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Capital Tier</p>
                <p className="text-lg font-bold">{s?.capital_tier || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">LTV/CAC Health</p>
                <p className={`text-lg font-bold ${Number(p3Scores?.economics_ltv_cac_ratio) >= 3 ? "text-green-700" : Number(p3Scores?.economics_ltv_cac_ratio) >= 1.5 ? "text-amber-700" : "text-destructive"}`}>
                  {p3Scores?.economics_ltv_cac_ratio ? `${Number(p3Scores.economics_ltv_cac_ratio).toFixed(1)}x` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Exit Scale Potential</p>
                <p className="text-lg font-bold">{compositeScore && compositeScore >= 75 ? "Strong" : compositeScore && compositeScore >= 60 ? "Moderate" : "Limited"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SECTION 8: ASSUMPTION TRACKER ═══ */}
      {assumptions.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={Eye} title="Assumption Tracker" number={8} />
          {s?.revenue_assumption_unvalidated && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Revenue-critical assumption unvalidated — classification capped at "Repairable but Fragile"
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
              <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">Validated ({validatedAssumptions.length})</p>
              <div className="space-y-1.5">
                {validatedAssumptions.map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
                    <span>{a.assumption}</span>
                  </div>
                ))}
                {validatedAssumptions.length === 0 && <p className="text-[11px] text-muted-foreground">None validated</p>}
              </div>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
              <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">Unvalidated ({unvalidatedAssumptions.length})</p>
              <div className="space-y-1.5">
                {unvalidatedAssumptions.map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <XCircle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                    <span>{a.assumption}</span>
                  </div>
                ))}
                {unvalidatedAssumptions.length === 0 && <p className="text-[11px] text-muted-foreground">All validated</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SECTION 9: MATURITY MAP ═══ */}
      {hasAllPhases && (
        <div className="space-y-4">
          <SectionHeader icon={Layers} title="Venture Maturity Map" number={9} />
          <div className="rounded-xl border border-border/60 bg-card p-5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium"></th>
                  {maturityDimensions.map(d => (
                    <th key={d.label} className="text-center py-2 px-3 font-semibold">{d.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...maturityLabels].reverse().map((label, rowIdx) => {
                  const level = maturityLabels.length - 1 - rowIdx;
                  return (
                    <tr key={label} className="border-t border-border/40">
                      <td className="py-2.5 pr-4 font-medium text-muted-foreground whitespace-nowrap">{label}</td>
                      {maturityDimensions.map(d => {
                        const isActive = d.level === level;
                        const isPast = d.level > level;
                        return (
                          <td key={d.label} className="text-center py-2.5 px-3">
                            <div className={`mx-auto h-5 w-5 rounded-full flex items-center justify-center ${
                              isActive ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
                              isPast ? "bg-primary/20" : "bg-muted"
                            }`}>
                              {isActive && <CircleDot className="h-3 w-3" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ SECTION 10: STRATEGIC NARRATIVE ═══ */}
      {hasAllPhases && (
        <div className="space-y-4">
          <SectionHeader icon={Lightbulb} title="Strategic Narrative Summary" number={10} />
          <div className="rounded-xl border-l-4 border-l-primary bg-card border border-border/60 p-6 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">Market Thesis</p>
              <p className="text-sm text-muted-foreground">{s?.narrative?.market_thesis || `Viability score of ${p1?.toFixed(0) || "—"} with ${p1Scores?.classification || "pending"} classification.`}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-accent font-semibold mb-1">Execution Thesis</p>
              <p className="text-sm text-muted-foreground">{s?.narrative?.execution_thesis || `Execution follows ${p2Scores?.execution_mode?.replace(/_/g, " ") || "lean"} approach with ${fmt(p2Scores?.capital_recommended)} capital.`}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">Growth Thesis</p>
              <p className="text-sm text-muted-foreground">{s?.narrative?.growth_thesis || `Growth readiness at ${p3?.toFixed(0) || "—"} with ${p3Scores?.classification || "pending"} classification.`}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Investment Case & Constraint</p>
              <p className="text-sm text-muted-foreground">{s?.narrative?.investment_case || `Composite score: ${compositeScore ?? "—"}. Verdict: ${verdict || "Pending"}.`}</p>
            </div>
          </div>
        </div>
      )}

      {/* Version History */}
      {snapshots.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold">Version History</h3>
          </div>
          <div className="space-y-1.5">
            {snapshots.slice(0, 10).map(snap => (
              <div key={snap.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">{snap.phase.toUpperCase()}</Badge>
                  <span className="text-xs font-medium">v{snap.version}</span>
                  <span className="text-[10px] text-muted-foreground">Score: {snap.score ? Number(snap.score).toFixed(0) : "—"}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{new Date(snap.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Not all phases */}
      {!hasAllPhases && (
        <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-muted-foreground">
          <p className="text-sm">Complete all 3 phases to unlock the full Startup Summary Dashboard with venture synthesis.</p>
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <span className={p1 !== null ? "text-primary font-semibold" : ""}>{p1 !== null ? "✓" : "○"} Phase 1</span>
            <span className={p2 !== null ? "text-accent font-semibold" : ""}>{p2 !== null ? "✓" : "○"} Phase 2</span>
            <span className={p3 !== null ? "text-primary font-semibold" : ""}>{p3 !== null ? "✓" : "○"} Phase 3</span>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="flex justify-center pt-2">
        <Button className="gap-2" onClick={onExportPDF} disabled={!hasAllPhases}>
          <FileDown className="h-4 w-4" /> Export Full Venture Blueprint
        </Button>
      </div>
    </div>
  );
}

function fallbackClass(s: number): string {
  if (s >= 85) return "Venture-Grade";
  if (s >= 75) return "Structurally Sound";
  if (s >= 65) return "Repairable but Fragile";
  if (s >= 55) return "High Structural Risk";
  return "Not Venture-Ready";
}
