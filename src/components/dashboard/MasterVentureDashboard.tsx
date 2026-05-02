import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileDown, AlertTriangle, CheckCircle2, XCircle, TrendingUp,
  Shield, Clock, DollarSign, Target, Zap, Pause,
  ArrowRightLeft, BarChart3, Layers, Activity,
  CircleDot, Flame, Eye, Lightbulb, RefreshCw, ChevronDown, ChevronUp,
  Brain, Rocket, Users, Tag, Search, Swords,
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

const API_BASE_URL = import.meta.env.VITE_API_URL;

const fmtMoney = (n: any) => {
  const v = Number(n);
  if (isNaN(v) || v === 0) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

const severityColor = (s: string) => {
  const sl = s?.toLowerCase();
  if (sl === "low" || sl === "manageable") return "bg-green-100 text-green-800 border-green-200";
  if (sl === "moderate" || sl === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
  if (sl === "high" || sl === "critical") return "bg-red-100 text-red-800 border-red-200";
  return "bg-muted text-muted-foreground border-border";
};

export default function MasterVentureDashboard({ project, onExportPDF }: MasterVentureDashboardProps) {
  const projectId = project?._id || project?.id;

  // ── Raw phase analysis objects exactly as stored in DB ──
  const [p1, setP1] = useState<any>(null); // phase1_analysis
  const [p2, setP2] = useState<any>(null); // phase2_execution_data.phase2_analysis
  const [p3, setP3] = useState<any>(null); // phase3_growth_data.phase3_analysis

  const [synthesis, setSynthesis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    if (projectId) loadData();
  }, [projectId]);

  // ─────────────────────────────────────────────
  // DATA LOADING — reads the correct nested paths
  // ─────────────────────────────────────────────
  const loadData = async () => {
    if (!projectId) {
      toast.error("Invalid project: Missing project ID");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [r1, r2, r3] = await Promise.all([
        fetch(`${API_BASE_URL}/validation/phase1/${projectId}`, { headers }),
        fetch(`${API_BASE_URL}/validation/phase2/${projectId}`, { headers }),
        fetch(`${API_BASE_URL}/validation/phase3/${projectId}`, { headers }),
      ]);

      const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);

      // FIX: extract phase analysis from API response structure
      const p1Data = d1.data?.phase1_analysis || null;
      const p2Data = d2.data?.phase2_analysis || null;
      const p3Data = d3.data?.phase3_analysis || null;

      setP1(p1Data);
      setP2(p2Data);
      setP3(p3Data);

      if (p1Data && p2Data && p3Data) {
        setTimeout(() => runSynthesis(p1Data, p2Data, p3Data), 100);
      }
    } catch (err) {
      console.error("Failed to load phase data:", err);
      toast.error("Failed to load venture data");
    } finally {
      setLoading(false);
    }
  };

  const runSynthesis = (p1Data = p1, p2Data = p2, p3Data = p3) => {
    if (!p1Data || !p2Data || !p3Data) return;
    setSynthesizing(true);
    try {
      setSynthesis(performVentureSynthesis(p1Data, p2Data, p3Data));
    } catch (err) {
      console.error("Synthesis error:", err);
      toast.error("Failed to synthesize venture analysis");
    } finally {
      setSynthesizing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 12-STAGE SYNTHESIS ENGINE — all paths corrected to match DB
  // ─────────────────────────────────────────────────────────────
  const performVentureSynthesis = (p1d: any, p2d: any, p3d: any) => {
    // ── Shorthand refs matching actual DB structure ──
    const p1Exec   = p1d.executive_summary    || {};
    const p2Exec   = p2d.executive_summary    || {};
    const p3Exec   = p3d.executive_summary    || {};
    const p3Audit  = p3d.scoring_audit        || {};
    const p3Pillars = p3Audit.pillar_scores   || {};
    const p2Audit  = p2d.scoring_audit        || {};
    const p2Pillars = p2Audit.pillar_scores   || {};

    // Correct score sources
    const p1Score = Number(p1Exec.viability_score)    || Number(p1d.scoring_decisions?.viability_final) || 0;
    const p2Score = Number(p2Audit.final_score)        || 0;
    const p3Score = Number(p3Audit.final_score)        || 0;

    // Correct pillar sources
    const p3CustomerClarity   = Number(p3Pillars.customer_clarity?.score)         || 0;
    const p3Distribution      = Number(p3Pillars.distribution_feasibility?.score) || 0;
    const p3Revenue           = Number(p3Pillars.revenue_model?.score)            || 0;
    const p3Retention         = Number(p3Pillars.retention_potential?.score)      || 0;
    const p3Pricing           = Number(p3Pillars.pricing_strategy?.score)         || 0;
    const p3Sales             = Number(p3Pillars.sales_efficiency?.score)         || 0;
    const p3Competitive       = Number(p3Pillars.competitive_advantage?.score)    || 0;

    const p2Capital     = Number(p2Pillars.capital_efficiency?.score)   || 0;
    const p2Team        = Number(p2Pillars.team_composition?.score)     || 0;
    const p2Complexity  = Number(p2Pillars.technical_complexity?.score) || 0;

    const p1ProblemScore  = Number(p1d.problem_intensity?.score)        || 0;
    const p1MarketScore   = Number(p1d.market_opportunity?.score)       || 0;
    const p1CompScore     = Number(p1d.competitive_positioning?.score)  || 0;
    const p1FounderScore  = Number(p1d.founder_advantage?.score)        || 0;

    // ── STAGE 1: Phase normalization ──
    const phaseData = {
      phase1: { viability_score: p1Score, problem_intensity: p1ProblemScore, market_score: p1MarketScore, competitive: p1CompScore, founder: p1FounderScore },
      phase2: { execution_score: p2Score, capital_efficiency: p2Capital, team: p2Team, complexity: p2Complexity },
      phase3: { growth_score: p3Score, customer_clarity: p3CustomerClarity, distribution: p3Distribution, revenue: p3Revenue, retention: p3Retention },
    };

    // ── STAGE 2: Structural conflict detection ──
    const conflicts: { type: string; penalty: number }[] = [];
    if (p1ProblemScore > 75 && p3Distribution < 60)  conflicts.push({ type: "Strong Demand + Weak Distribution",        penalty: -5 });
    if (p1MarketScore > 75  && p2Capital < 60)        conflicts.push({ type: "Viable Market + Capital Misalignment",    penalty: -5 });
    if (p2Score > 75        && p3Revenue < 60)         conflicts.push({ type: "Execution Ready + Weak Revenue Model",   penalty: -5 });
    if (p3Score > 75        && p1ProblemScore < 60)    conflicts.push({ type: "Strong Growth + Speculative Demand",     penalty: -5 });
    if (p1FounderScore < 60 && p3Distribution < 60)   conflicts.push({ type: "Weak Founder Leverage + No Distribution", penalty: -5 });

    // ── STAGE 3: Dominant constraint ──
    const constraints = [
      { name: "Demand Fragility",       severity: p1ProblemScore < 60      ? "high" : "moderate", score: p1ProblemScore },
      { name: "Execution Fragility",    severity: p2Score < 60             ? "high" : "moderate", score: p2Score },
      { name: "Capital Fragility",      severity: p2Capital < 60           ? "high" : "moderate", score: p2Capital },
      { name: "Distribution Weakness",  severity: p3Distribution < 60      ? "high" : "moderate", score: p3Distribution },
      { name: "Retention Uncertainty",  severity: p3Retention < 60         ? "high" : "moderate", score: p3Retention },
      { name: "Revenue Model Risk",     severity: p3Revenue < 60           ? "high" : "moderate", score: p3Revenue },
      { name: "Founder Leverage Gap",   severity: p1FounderScore < 60      ? "high" : "moderate", score: p1FounderScore },
    ];
    const dominantConstraint = constraints.reduce((worst, cur) => cur.score < worst.score ? cur : worst);

    // ── STAGE 4: Adaptive weights ──
    let weights = { p1: 0.4, p2: 0.3, p3: 0.3 };
    if (p1ProblemScore < 60) weights.p1 = 0.5;
    if (p2Score < 60)        weights.p2 = 0.4;
    if (p3Revenue < 60)      weights.p3 = 0.4;

    // ── STAGE 5: Composite score ──
    let baseScore = (p1Score * weights.p1) + (p2Score * weights.p2) + (p3Score * weights.p3);
    const totalConflictPenalty = conflicts.reduce((s, c) => s + c.penalty, 0);
    baseScore += totalConflictPenalty;
    if (conflicts.length >= 3) baseScore = Math.min(baseScore, 70);
    if (conflicts.length >= 5) baseScore = Math.min(baseScore, 60);

    // ── STAGE 6: Classification ──
    let classification = "Not Venture-Ready";
    if      (baseScore >= 85) classification = "Venture-Grade";
    else if (baseScore >= 75) classification = "Structurally Sound";
    else if (baseScore >= 65) classification = "Repairable but Fragile";
    else if (baseScore >= 55) classification = "High Structural Risk";
    if (dominantConstraint.name === "Capital Fragility" && dominantConstraint.severity === "high") {
      classification = "Repairable but Fragile";
      baseScore = Math.min(baseScore, 74);
    }

    // ── STAGE 7: Capital coherence ──
    // FIX: reads from correct path
    const nextFunding = p2d.execution_architecture?.capital_plan?.next_funding || 0;
    const gtmCapital  = 10000; // from intake: "Less than $10,000"
    const totalCapital = Number(String(nextFunding).replace(/[^0-9]/g, "")) + gtmCapital;
    let capitalCoherence = "Self-Sustainable";
    if (totalCapital > 100_000)  capitalCoherence = "Funding Dependent";
    else if (totalCapital > 50_000) capitalCoherence = "Capital Fragile";
    else if (totalCapital > 10_000) capitalCoherence = "Lean but Tight";

    // ── STAGE 8: Timeline synthesis ──
    const milestones = p2d.execution_architecture?.development_approach?.milestones || [];
    const timeline = {
      to_mvp:             milestones[0]?.timeline || "6–8 weeks (post-funding)",
      to_first_revenue:   p2d.execution_architecture?.capital_plan?.burn_rate ? "Within 3 months" : "—",
      to_retention_proof: "Month 2–3 (post-launch)",
      to_scale_eligibility: "1,000 users milestone",
    };

    // ── STAGE 9: Global risk matrix from risk_clusters ──
    // FIX: reads risk_clusters objects (not flat arrays that don't exist)
    const buildRiskList = (clusters: any, phase: string) =>
      Object.entries(clusters || {}).map(([key, val]: [string, any]) => ({
        name: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        severity: val?.severity || "moderate",
        explanation: val?.explanation || val?.detail || "",
        mitigation: val?.mitigation || "",
        phase,
      }));

    const allRisks = [
      ...buildRiskList(p1d.risk_clusters, "Validation"),
      ...buildRiskList(p2d.execution_architecture?.risk_mitigation ? {} : {}, "Execution"),
      // P2 stores risks differently — extract from primary_risks array
      ...(p2d.execution_architecture?.risk_mitigation?.primary_risks || []).map((r: any) => ({
        name: r.risk,
        severity: r.probability || "moderate",
        explanation: r.mitigation || "",
        mitigation: r.mitigation || "",
        phase: "Execution",
      })),
    ];
    const highRiskCount = allRisks.filter(r => r.severity === "high").length;
    if (highRiskCount >= 4) baseScore -= 10;

    // ── STAGE 10: Assumption consolidation ──
    // FIX: reads from assumption_map (the actual DB structure)
    const assumptionMap = p1d.assumption_map || {};
    const allAssumptions = [
      ...(assumptionMap.market_assumptions     || []),
      ...(assumptionMap.behavioral_assumptions || []),
      ...(assumptionMap.economic_assumptions   || []),
      ...(assumptionMap.execution_assumptions  || []),
    ];
    const unvalidatedCount = allAssumptions.filter(a => a.status === "Untested").length;
    const validatedCount   = allAssumptions.filter(a => a.status === "Reasonable" || a.status === "Strong").length;
    if (unvalidatedCount > 5) baseScore -= 5;

    // ── STAGE 11: Verdict ──
    let verdict = "Proceed Structured";
    if      (p1Score < 50)           verdict = "Kill or Radical Pivot";
    else if (p2Score < 50)           verdict = "Delay & Rework";
    else if (p3Score < 50)           verdict = "Do not Scale";
    else if (baseScore >= 75 && highRiskCount <= 2) verdict = "Proceed Structured";
    else if (baseScore >= 65)        verdict = "Proceed Lean";
    else if (baseScore >= 55)        verdict = "Repair & Validate";
    else                              verdict = "Delay & Rework";

    // ── STAGE 12: Strategic narrative ──
    const strategicNarrative = {
      market_thesis: `${p1ProblemScore > 70 ? "Strong" : "Moderate"} problem intensity with ${p1d.problem_intensity?.intensity_level || "meaningful"} urgency. Market opportunity is ${p1d.market_opportunity?.timing_window || "timely"} with ${p1d.market_opportunity?.segment_definition || "defined"} segment definition.`,
      execution_feasibility: `Execution structure is ${p2Score > 70 ? "solid" : "fragile"} at ${p2Score}/100. Capital classified as ${capitalCoherence.toLowerCase()}. Team covers ${(p2d.execution_architecture?.team_structure?.core_team || []).length} core roles with ${p2d.executive_summary?.execution_maturity_tier || "unknown"} maturity.`,
      growth_architecture: `Growth model is ${p3d.growth_mode?.replace(/_/g, " ") || "unspecified"} with ${p3CustomerClarity > 70 ? "high" : "moderate"} customer clarity and ${p3Distribution > 70 ? "strong" : "moderate"} distribution feasibility. Retention score: ${p3Pillars.retention_potential?.score || "—"}/20.`,
      investment_case: `Primary constraint is ${dominantConstraint.name} (${dominantConstraint.severity} severity). With ${allAssumptions.length} assumptions tracked (${unvalidatedCount} untested), composite score stands at ${Math.max(0, Math.min(100, Math.round(baseScore)))}. ${verdict.includes("Proceed") ? "Investment viable with structured monitoring." : "Investment premature at this stage — key constraints must be resolved."}`,
    };

    return {
      composite_score: Math.max(0, Math.min(100, Math.round(baseScore))),
      classification,
      verdict,
      dominant_constraint: dominantConstraint,
      capital_coherence: capitalCoherence,
      timeline,
      all_risks: allRisks,
      risk_matrix: {
        total: allRisks.length,
        high: highRiskCount,
        moderate: allRisks.filter(r => r.severity === "moderate" || r.severity === "manageable").length,
        low: allRisks.filter(r => r.severity === "low").length,
      },
      assumption_tracker: {
        total: allAssumptions.length,
        validated: validatedCount,
        unvalidated: unvalidatedCount,
        by_category: {
          market: assumptionMap.market_assumptions?.length || 0,
          behavioral: assumptionMap.behavioral_assumptions?.length || 0,
          economic: assumptionMap.economic_assumptions?.length || 0,
          execution: assumptionMap.execution_assumptions?.length || 0,
        },
        details: allAssumptions,
      },
      strategic_narrative: strategicNarrative,
      phase_data: phaseData,
      conflicts,
      weights_used: weights,
      synthesis_stages: 12,
    };
  };

  // ─────────────────
  // DERIVED SCORES
  // ─────────────────
  // FIX: all scores read from correct nested paths
  const p1Score = p1 ? (Number(p1.executive_summary?.viability_score) || Number(p1.scoring_decisions?.viability_final) || null) : null;
  const p2Score = p2 ? (Number(p2.scoring_audit?.final_score) || null) : null;
  const p3Score = p3 ? (Number(p3.scoring_audit?.final_score) || null) : null;
  const hasAllPhases = p1Score !== null && p2Score !== null && p3Score !== null;

  const s = synthesis;
  const compositeScore  = s?.composite_score ?? null;
  const classification  = s?.classification ?? null;
  const verdict         = s?.verdict ?? null;

  // ─────────────────────────────────────────────────
  // ASSUMPTION DATA — from actual DB structure
  // ─────────────────────────────────────────────────
  const assumptionMap     = p1?.assumption_map || {};
  const allAssumptions    = [
    ...(assumptionMap.market_assumptions     || []),
    ...(assumptionMap.behavioral_assumptions || []),
    ...(assumptionMap.economic_assumptions   || []),
    ...(assumptionMap.execution_assumptions  || []),
  ];
  const validatedAssumptions   = allAssumptions.filter((a: any) => a.status === "Reasonable" || a.status === "Strong");
  const unvalidatedAssumptions = allAssumptions.filter((a: any) => a.status === "Untested" || a.status === "Weak");

  // Roadmap — correct path
  const roadmap = p3?.ninety_day_roadmap || p3?.gtm_blueprint?.ninety_day_roadmap || [];
  const spk     = p3?.scale_pivot_kill   || {};
  const scaleSignals = spk.scale_signals  || [];
  const pivotSignals = spk.pivot_signals  || [];
  const killSignals  = spk.kill_signals   || [];

  // Phase 3 pillar scores shorthand
  const p3Pillars = p3?.scoring_audit?.pillar_scores || {};

  // Maturity grid
  const getMaturityLevel = (score: number | null) => {
    if (score === null) return 0;
    if (score >= 80) return 3;
    if (score >= 65) return 2;
    if (score >= 45) return 1;
    return 0;
  };
  const maturityLabels = ["Conceptual", "Structured", "Operational", "Scalable"];
  const maturityDimensions = [
    { label: "Validation",  level: getMaturityLevel(p1Score) },
    { label: "Execution",   level: getMaturityLevel(p2Score) },
    { label: "Growth",      level: getMaturityLevel(p3Score) },
    { label: "Economics",   level: getMaturityLevel(p3Pillars.revenue_model ? Number(p3Pillars.revenue_model.score) * 5 : null) },
    { label: "Retention",   level: getMaturityLevel(p3Pillars.retention_potential ? Number(p3Pillars.retention_potential.score) * 5 : null) },
  ];

  // ──────────────
  // CONFIG MAPS
  // ──────────────
  const verdictConfig: Record<string, { color: string; icon: any; desc: string }> = {
    "Proceed Structured":   { color: "bg-green-50 border-green-300 text-green-800",   icon: Shield,        desc: "All systems aligned. Execute with structured monitoring and scaling triggers." },
    "Proceed Lean":         { color: "bg-emerald-50 border-emerald-300 text-emerald-800", icon: Zap,        desc: "Viable but constrained. Proceed lean with tight validation loops and capital discipline." },
    "Repair & Validate":    { color: "bg-amber-50 border-amber-300 text-amber-800",   icon: ArrowRightLeft, desc: "Structural gaps detected. Repair weakest layers and validate before scaling." },
    "Delay & Rework":       { color: "bg-orange-50 border-orange-300 text-orange-800", icon: Pause,        desc: "Critical misalignments present. Rework foundational layers before proceeding." },
    "Do not Scale":         { color: "bg-orange-50 border-orange-300 text-orange-800", icon: Pause,        desc: "Growth layer too weak to scale. Fix GTM fundamentals first." },
    "Kill or Radical Pivot":{ color: "bg-red-50 border-red-300 text-red-800",         icon: XCircle,       desc: "Venture not viable in current form. Radical restructuring required." },
  };

  const classColor = (c: string) => {
    if (c === "Venture-Grade")          return "text-green-700";
    if (c === "Structurally Sound")     return "text-emerald-700";
    if (c === "Repairable but Fragile") return "text-amber-700";
    if (c === "High Structural Risk")   return "text-orange-700";
    return "text-destructive";
  };

  // ──────────────
  // UI COMPONENTS
  // ──────────────
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
    <div className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold ${highlight ? "text-primary" : ""}`}>{value || "—"}</span>
    </div>
  );

  const RiskCard = ({ risk }: { risk: any }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="rounded-lg border border-border/60 p-3 cursor-default hover:bg-muted/50 transition-colors">
          <div className="flex items-start gap-2 mb-1">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border shrink-0 mt-0.5 ${severityColor(risk.severity)}`}>
              {risk.severity}
            </span>
            <p className="text-xs font-medium">{risk.name}</p>
            <Badge variant="outline" className="text-[9px] ml-auto shrink-0">{risk.phase}</Badge>
          </div>
          {risk.explanation && <p className="text-[10px] text-muted-foreground line-clamp-2 pl-1">{risk.explanation}</p>}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs font-semibold mb-1">{risk.name}</p>
        <p className="text-xs">{risk.explanation}</p>
        {risk.mitigation && <p className="text-xs mt-1 text-green-700"><span className="font-semibold">Mitigate:</span> {risk.mitigation}</p>}
      </TooltipContent>
    </Tooltip>
  );

  const SignalCard = ({ signal }: { signal: any }) => {
    const text      = typeof signal === "string" ? signal : signal?.signal || signal?.text || "";
    const metric    = typeof signal === "object" ? signal?.metric_threshold   || signal?.metric    : null;
    const window    = typeof signal === "object" ? signal?.observation_period || signal?.window    : null;
    const consequence = typeof signal === "object" ? signal?.decision_consequence || signal?.consequence : null;
    return (
      <div className="rounded-lg border border-border/60 p-3 space-y-1">
        <p className="text-xs font-medium">{text}</p>
        {metric      && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Metric:</span> {metric}</p>}
        {window      && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Window:</span> {window}</p>}
        {consequence && <p className="text-[10px] text-muted-foreground"><span className="font-medium">Action:</span> {consequence}</p>}
      </div>
    );
  };

  // ─────────────────────────
  // LOADING / EMPTY STATES
  // ─────────────────────────
  if (!projectId) return <div className="flex justify-center py-16 text-muted-foreground">Loading project data...</div>;
  if (loading)    return <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-10">

      {/* ═══════════════════════════════════════════════════
          SECTION 1 — EXECUTIVE VENTURE SNAPSHOT
          Per doc: Viability Score + Classification + Confidence + Strategic Insight
      ═══════════════════════════════════════════════════ */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <SectionHeader icon={BarChart3} title="Executive Venture Snapshot" number={1} />
          {hasAllPhases && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => runSynthesis()} disabled={synthesizing}>
              <RefreshCw className={`h-3 w-3 ${synthesizing ? "animate-spin" : ""}`} />
              {synthesizing ? "Analyzing..." : "Re-analyze"}
            </Button>
          )}
        </div>

        {/* Phase scores + composite */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Viability (P1)</p>
            <p className={`text-3xl font-bold ${p1Score !== null ? "text-primary" : "text-muted-foreground/30"}`}>{p1Score?.toFixed(0) ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{p1?.executive_summary?.classification || "—"}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Execution (P2)</p>
            <p className={`text-3xl font-bold ${p2Score !== null ? "text-accent" : "text-muted-foreground/30"}`}>{p2Score?.toFixed(0) ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{p2?.executive_summary?.execution_maturity_tier || "—"}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Growth (P3)</p>
            <p className={`text-3xl font-bold ${p3Score !== null ? "text-primary" : "text-muted-foreground/30"}`}>{p3Score?.toFixed(0) ?? "—"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{p3?.executive_summary?.growth_maturity_tier || "—"}</p>
          </div>
          <div className={`rounded-xl p-4 text-center ${compositeScore !== null ? "bg-primary text-primary-foreground" : "border border-border/60 bg-card"}`}>
            <p className={`text-[10px] uppercase tracking-widest mb-1 ${compositeScore !== null ? "opacity-70" : "text-muted-foreground"}`}>Composite Score</p>
            <p className={`text-3xl font-bold ${compositeScore === null ? "text-muted-foreground/30" : ""}`}>{compositeScore ?? "—"}</p>
            {classification && <p className={`text-[10px] font-semibold mt-1 ${compositeScore !== null ? "opacity-90" : classColor(classification)}`}>{classification}</p>}
          </div>
        </div>

        {/* Synthesis insight cards */}
        {s && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">Dominant Constraint</p>
              <p className="text-sm font-bold text-amber-900 mt-1">{s.dominant_constraint?.name || "—"}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border mt-1 inline-block ${severityColor(s.dominant_constraint?.severity)}`}>{s.dominant_constraint?.severity}</span>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider">Capital Coherence</p>
              <p className="text-sm font-bold text-blue-900 mt-1">{s.capital_coherence || "—"}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-[10px] font-semibold text-red-800 uppercase tracking-wider">Structural Conflicts</p>
              <p className="text-sm font-bold text-red-900 mt-1">{s.conflicts?.length || 0} detected</p>
              <p className="text-[10px] text-red-700">Penalty: {s.conflicts?.reduce((sum: number, c: any) => sum + c.penalty, 0) || 0} pts</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-[10px] font-semibold text-green-800 uppercase tracking-wider">Synthesis Engine</p>
              <p className="text-sm font-bold text-green-900 mt-1">{s.synthesis_stages || 12} stages</p>
              <p className="text-[10px] text-green-700">Complete</p>
            </div>
          </div>
        )}

        {/* Venture verdict */}
        {verdict && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className={`lg:col-span-2 rounded-xl p-5 border-2 ${verdictConfig[verdict]?.color || "bg-muted border-border"}`}>
              <div className="flex items-center gap-3 mb-2">
                {(() => { const Icon = verdictConfig[verdict]?.icon; return Icon ? <Icon className="h-5 w-5" /> : null; })()}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest opacity-60">Venture Verdict</p>
                  <p className="text-xl font-bold">{verdict}</p>
                </div>
              </div>
              <p className="text-sm opacity-80">{verdictConfig[verdict]?.desc || ""}</p>
            </div>
            <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-destructive" />
                <p className="text-[10px] font-medium uppercase tracking-widest text-destructive/70">Primary Constraint</p>
              </div>
              <p className="text-sm font-bold text-destructive">{s?.dominant_constraint?.name || "—"}</p>
              <p className="text-xs text-muted-foreground mt-2">{s?.dominant_constraint?.severity === "high" ? "Immediate resolution required before scaling" : "Monitor and address before next phase"}</p>
            </div>
          </div>
        )}

        {/* Strategic Narrative — per doc Section 12 */}
        {s?.strategic_narrative && (
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold">Strategic Narrative</p>
              <Badge variant="outline" className="text-[10px] ml-auto">12-Stage AI Synthesis</Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Market Thesis</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.strategic_narrative.market_thesis}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-accent mb-1">Execution Feasibility</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.strategic_narrative.execution_feasibility}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Growth Architecture</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.strategic_narrative.growth_architecture}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Investment Case</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.strategic_narrative.investment_case}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Structural conflicts */}
        {s?.conflicts && s.conflicts.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Structural Conflicts ({s.conflicts.length})</p>
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 ml-auto">
                Total Penalty: {s.conflicts.reduce((sum: number, c: any) => sum + c.penalty, 0)} pts
              </Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {s.conflicts.map((c: any, i: number) => (
                <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-900">{c.type}</p>
                    <p className="text-[10px] text-amber-700">Score penalty: {c.penalty}</p>
                  </div>
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
              </div>
              <MetricRow label="Current Funding"       value={p2?.execution_architecture?.capital_plan?.current_funding || "—"} />
              <MetricRow label="Burn Rate (projected)" value={p2?.execution_architecture?.capital_plan?.burn_rate || "—"} />
              <MetricRow label="Recommended Bridge"    value={p2?.execution_architecture?.capital_plan?.next_funding || "—"} highlight />
              <MetricRow label="Capital Coherence"     value={s?.capital_coherence || "—"} />
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold">Timeline Overview</p>
              </div>
              <MetricRow label="Time to MVP"           value={s?.timeline?.to_mvp || "—"} />
              <MetricRow label="Time to First Revenue" value={s?.timeline?.to_first_revenue || "—"} />
              <MetricRow label="Retention Proof"       value={s?.timeline?.to_retention_proof || "—"} />
              <MetricRow label="Scale Eligibility"     value={s?.timeline?.to_scale_eligibility || "—"} highlight />
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 2 — PHASE INTELLIGENCE SUMMARIES
          Per doc: Phase 1 → Problem + Market + Buyer + Competitive + Founder
                   Phase 2 → Execution + Capital
                   Phase 3 → Growth + GTM
      ═══════════════════════════════════════════════════ */}
      {hasAllPhases && (
        <div className="space-y-5">
          <SectionHeader icon={Layers} title="Phase Intelligence Summaries" number={2} />
          <div className="grid lg:grid-cols-3 gap-4">

            {/* Phase 1 */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Market Validation</p>
                <Badge variant="outline" className="text-xs">{p1Score?.toFixed(0)}/100</Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Problem Intensity</p>
                <MetricRow label="Score"           value={`${p1?.problem_intensity?.score || "—"}/100`} />
                <MetricRow label="Intensity Level" value={p1?.problem_intensity?.intensity_level || "—"} />
                <MetricRow label="Urgency"         value={p1?.problem_intensity?.urgency_index || "—"} />
                <MetricRow label="Spending Evidence" value={p1?.problem_intensity?.spending_evidence || "—"} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Market Opportunity</p>
                <MetricRow label="Segment"         value={p1?.market_opportunity?.segment_definition || "—"} />
                <MetricRow label="Market Size"     value={p1?.market_opportunity?.market_size_tier || "—"} />
                <MetricRow label="Timing Window"   value={p1?.market_opportunity?.timing_window || "—"} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Buyer Economics</p>
                <MetricRow label="Revenue Model"   value={p1?.buyer_economics?.revenue_model_clarity || "—"} />
                <MetricRow label="Unit Economics"  value={p1?.buyer_economics?.unit_economics_tier || "—"} />
                <MetricRow label="Capital Intensity" value={p1?.buyer_economics?.capital_intensity || "—"} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Founder Advantage</p>
                <MetricRow label="Domain Leverage"     value={p1?.founder_advantage?.domain_leverage || "—"} />
                <MetricRow label="Distribution Access" value={p1?.founder_advantage?.distribution_access || "—"} />
                <MetricRow label="Capital Access"      value={p1?.founder_advantage?.capital_access || "—"} />
              </div>
            </div>

            {/* Phase 2 */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Execution Structure</p>
                <Badge variant="outline" className="text-xs">{p2Score?.toFixed(0)}/100</Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Executive Summary</p>
                <MetricRow label="Maturity Tier"    value={p2?.executive_summary?.execution_maturity_tier || "—"} />
                <MetricRow label="Risk Level"       value={p2?.executive_summary?.execution_risk_level || "—"} />
                <MetricRow label="Primary Constraint" value={p2?.executive_summary?.primary_execution_constraint || "—"} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Team Structure</p>
                {(p2?.execution_architecture?.team_structure?.core_team || []).map((role: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] py-0.5">
                    <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                    <span>{role}</span>
                  </div>
                ))}
                {(p2?.execution_architecture?.team_structure?.team_gaps || []).map((gap: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] py-0.5">
                    <XCircle className="h-3 w-3 text-amber-500 shrink-0" />
                    <span className="text-muted-foreground">{gap}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Capital Plan</p>
                <MetricRow label="Current Funding"  value={p2?.execution_architecture?.capital_plan?.current_funding || "—"} />
                <MetricRow label="Next Funding"     value={p2?.execution_architecture?.capital_plan?.next_funding || "—"} highlight />
                <MetricRow label="Burn Rate"        value={p2?.execution_architecture?.capital_plan?.burn_rate || "—"} />
              </div>
              {p2?.execution_architecture?.development_approach?.milestones?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Key Milestones</p>
                  {p2.execution_architecture.development_approach.milestones.slice(0, 2).map((m: any, i: number) => (
                    <div key={i} className="rounded border border-border/40 p-2 mb-1.5">
                      <p className="text-[11px] font-medium">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground">{m.timeline}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phase 3 */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Growth & GTM</p>
                <Badge variant="outline" className="text-xs">{p3Score?.toFixed(0)}/100</Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">GTM Overview</p>
                <MetricRow label="Maturity Tier"   value={p3?.executive_summary?.growth_maturity_tier || "—"} />
                <MetricRow label="Action Directive" value={p3?.executive_summary?.action_directive || "—"} />
                <MetricRow label="Risk Level"       value={p3?.executive_summary?.growth_risk_level || "—"} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Pillar Scores</p>
                {[
                  { label: "Customer Clarity",    key: "customer_clarity",         max: 20 },
                  { label: "Distribution",         key: "distribution_feasibility", max: 15 },
                  { label: "Revenue Model",        key: "revenue_model",            max: 20 },
                  { label: "Retention Potential",  key: "retention_potential",      max: 20 },
                  { label: "Competitive Advantage",key: "competitive_advantage",    max: 20 },
                ].map(({ label, key, max }) => {
                  const score = Number(p3Pillars[key]?.score) || 0;
                  const pct   = Math.min((score / max) * 100, 100);
                  return (
                    <div key={key} className="mb-1.5">
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold">{score}/{max}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "hsl(var(--primary))" : pct >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Growth Confidence</p>
                <MetricRow label="Overall"          value={String(p3?.growth_confidence?.overall || "—")} />
                <MetricRow label="Revenue Model"    value={String(p3?.growth_confidence?.revenue_model || "—")} highlight />
                <MetricRow label="Sales Efficiency" value={String(p3?.growth_confidence?.sales_efficiency || "—")} />
                <MetricRow label="Distribution"     value={String(p3?.growth_confidence?.distribution_feasibility || "—")} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 3 — GLOBAL RISK MATRIX
          Per doc: Clustered by type, severity, mitigation
      ═══════════════════════════════════════════════════ */}
      {s?.all_risks && s.all_risks.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={Shield} title="Global Risk Matrix" number={3} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "High Severity",     count: s.risk_matrix.high,     color: "border-red-200 bg-red-50 text-red-700",    sub: "Immediate attention" },
              { label: "Moderate Severity", count: s.risk_matrix.moderate, color: "border-amber-200 bg-amber-50 text-amber-700", sub: "Monitor closely" },
              { label: "Low Severity",      count: s.risk_matrix.low,      color: "border-blue-200 bg-blue-50 text-blue-700",  sub: "Track progress" },
              { label: "Total Risks",       count: s.risk_matrix.total,    color: "border-border/60 bg-card text-foreground",  sub: "All phases" },
            ].map(({ label, count, color, sub }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium">{label}</p>
                <p className="text-[10px] mt-1 opacity-70">{sub}</p>
              </div>
            ))}
          </div>

          {s.risk_matrix.high > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-destructive" /> High Severity Risks</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {s.all_risks.filter((r: any) => r.severity === "high").map((r: any, i: number) => <RiskCard key={i} risk={r} />)}
              </div>
            </div>
          )}
          {s.risk_matrix.moderate > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-amber-500" /> Moderate Risks</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {s.all_risks.filter((r: any) => r.severity === "moderate" || r.severity === "manageable").map((r: any, i: number) => <RiskCard key={i} risk={r} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 4 — ASSUMPTION TRACKER
          Per doc: Grouped by category, status, validation path
      ═══════════════════════════════════════════════════ */}
      {allAssumptions.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={Eye} title="Core Assumption Map" number={4} />

          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { label: "Market",     count: s?.assumption_tracker?.by_category?.market || assumptionMap.market_assumptions?.length || 0,     color: "bg-blue-50 border-blue-200 text-blue-800" },
              { label: "Behavioral", count: s?.assumption_tracker?.by_category?.behavioral || assumptionMap.behavioral_assumptions?.length || 0, color: "bg-purple-50 border-purple-200 text-purple-800" },
              { label: "Economic",   count: s?.assumption_tracker?.by_category?.economic || assumptionMap.economic_assumptions?.length || 0,   color: "bg-amber-50 border-amber-200 text-amber-800" },
              { label: "Execution",  count: s?.assumption_tracker?.by_category?.execution || assumptionMap.execution_assumptions?.length || 0, color: "bg-teal-50 border-teal-200 text-teal-800" },
            ].map(({ label, count, color }) => (
              <div key={label} className={`rounded-lg border p-3 text-center ${color}`}>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
              <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3">
                Validated / Reasonable ({validatedAssumptions.length})
              </p>
              <div className="space-y-2">
                {validatedAssumptions.map((a: any, i: number) => (
                  <div key={i} className="rounded border border-green-200 bg-green-50 p-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[11px] font-medium">{a.assumption}</p>
                        <Badge variant="outline" className="text-[9px] mt-0.5 border-green-300 text-green-700">{a.status}</Badge>
                      </div>
                    </div>
                    {a.validation && <p className="text-[10px] text-muted-foreground mt-1 pl-5">{a.validation}</p>}
                  </div>
                ))}
                {validatedAssumptions.length === 0 && <p className="text-[11px] text-muted-foreground">None validated yet</p>}
              </div>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
              <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3">
                Untested / Fragile ({unvalidatedAssumptions.length})
              </p>
              <div className="space-y-2">
                {unvalidatedAssumptions.map((a: any, i: number) => (
                  <div key={i} className="rounded border border-red-200 bg-red-50 p-2">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[11px] font-medium">{a.assumption}</p>
                        <Badge variant="outline" className="text-[9px] mt-0.5 border-red-300 text-red-700">{a.status}</Badge>
                      </div>
                    </div>
                    {a.validation && <p className="text-[10px] text-muted-foreground mt-1 pl-5"><span className="font-medium">How to validate:</span> {a.validation}</p>}
                  </div>
                ))}
                {unvalidatedAssumptions.length === 0 && <p className="text-[11px] text-muted-foreground">All assumptions validated</p>}
              </div>
            </div>
          </div>

          {s?.assumption_tracker?.unvalidated > 5 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">⚠ Assumption Fragility Warning</p>
              <p className="text-xs text-amber-700 mt-1">
                {s.assumption_tracker.unvalidated} untested assumptions reduce composite score by 5 points. 
                Prioritize economic and behavioral assumptions before next phase.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 5 — VALIDATION GAPS
          Per doc: Critical questions, missing data, required experiments
      ═══════════════════════════════════════════════════ */}
      {p1?.validation_gaps && (
        <div className="space-y-4">
          <SectionHeader icon={Search} title="Validation Gaps & Open Questions" number={5} />
          <div className="grid sm:grid-cols-3 gap-4">
            {p1.validation_gaps.critical_questions?.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/30 p-4">
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3">Critical Questions</p>
                <div className="space-y-2">
                  {p1.validation_gaps.critical_questions.map((q: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 shrink-0" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {p1.validation_gaps.missing_data?.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">Missing Data</p>
                <div className="space-y-2">
                  {p1.validation_gaps.missing_data.map((d: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <XCircle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {p1.validation_gaps.required_experiments?.length > 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Required Experiments</p>
                <div className="space-y-2">
                  {p1.validation_gaps.required_experiments.map((e: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <Zap className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 6 — BUILD READINESS SIGNAL
          Per doc: Is this idea ready for execution modeling?
      ═══════════════════════════════════════════════════ */}
      {p1?.build_readiness && (
        <div className="space-y-4">
          <SectionHeader icon={Rocket} title="Build Readiness Signal" number={6} />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="lg:col-span-1 rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Readiness Signal</p>
              <p className="text-xl font-bold text-primary">{p1.build_readiness.signal || "—"}</p>
              {p1.build_readiness.confidence_score && (
                <>
                  <p className="text-[10px] text-muted-foreground mt-2 mb-1">Confidence Score</p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p1.build_readiness.confidence_score}%` }} />
                  </div>
                  <p className="text-sm font-bold text-primary mt-1">{p1.build_readiness.confidence_score}/100</p>
                </>
              )}
            </div>
            {p1.build_readiness.next_steps?.length > 0 && (
              <div className="sm:col-span-2 rounded-xl border border-border/60 bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recommended Next Steps</p>
                <div className="space-y-2">
                  {p1.build_readiness.next_steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">{i + 1}</div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 7 — CONFIDENCE SCORE BREAKDOWN
          Per doc: Evidence strength, assumption clarity, market clarity, economic clarity
      ═══════════════════════════════════════════════════ */}
      {p1?.confidence_breakdown && (
        <div className="space-y-4">
          <SectionHeader icon={Brain} title="Confidence Score Breakdown" number={7} />
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Evidence Strength",   value: p1.confidence_breakdown.evidence_strength },
                { label: "Assumption Clarity",  value: p1.confidence_breakdown.assumption_clarity },
                { label: "Market Clarity",      value: p1.confidence_breakdown.market_clarity },
                { label: "Economic Clarity",    value: p1.confidence_breakdown.economic_clarity },
                { label: "Competitive Realism", value: p1.confidence_breakdown.competitive_realism },
              ].map(({ label, value }) => value != null ? (
                <div key={label} className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                  <p className="text-xl font-bold" style={{ color: value >= 70 ? "hsl(var(--primary))" : value >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))" }}>{value}</p>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: value >= 70 ? "hsl(var(--primary))" : value >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))" }} />
                  </div>
                </div>
              ) : null)}
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
              Confidence Index of <strong>{p1.executive_summary?.confidence_index || "—"}</strong> reflects the overall strength of evidence supporting this venture's viability. Higher evidence strength and assumption clarity directly increase investability.
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 8 — STRATEGIC PIVOT OPTIONS
          Per doc: Recommended route + alternatives
      ═══════════════════════════════════════════════════ */}
      {p1?.strategic_routes && (
        <div className="space-y-4">
          <SectionHeader icon={ArrowRightLeft} title="Strategic Pivot Options" number={8} />
          {p1.strategic_routes.recommended_route && (
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="text-xs">Recommended Route</Badge>
              </div>
              <p className="text-sm font-bold mb-2">{p1.strategic_routes.recommended_route.route}</p>
              {p1.strategic_routes.recommended_route.why_improves && (
                <p className="text-xs text-muted-foreground mb-2">{p1.strategic_routes.recommended_route.why_improves}</p>
              )}
              {p1.strategic_routes.recommended_route.changes_required && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 mt-2">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Changes Required</p>
                  <p className="text-xs">{p1.strategic_routes.recommended_route.changes_required}</p>
                </div>
              )}
            </div>
          )}
          {(p1.strategic_routes.alternative_routes || p1.alternative_routes)?.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(p1.strategic_routes.alternative_routes || p1.alternative_routes).map((r: any, i: number) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card p-4">
                  <p className="text-xs font-bold mb-1">{r.route}</p>
                  <p className="text-[11px] text-muted-foreground">{r.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 9 — 90-DAY EXECUTION PLAN
      ═══════════════════════════════════════════════════ */}
      {roadmap.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={Activity} title="Strategic 90-Day Execution Plan" number={9} />
          <div className="grid sm:grid-cols-3 gap-4">
            {roadmap.slice(0, 3).map((month: any, i: number) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-primary text-primary-foreground" : i === 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                  <p className="text-sm font-bold">{month.month || `Month ${i + 1}`}</p>
                  {month.title && <Badge variant="outline" className="text-[9px] ml-auto">{month.title}</Badge>}
                </div>
                {month.strategic_focus && <p className="text-[11px] text-muted-foreground italic">{month.strategic_focus}</p>}
                {month.deliverables?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Deliverables</p>
                    {month.deliverables.slice(0, 4).map((d: string, j: number) => (
                      <p key={j} className="text-[11px] flex items-start gap-1 mb-0.5"><CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />{d}</p>
                    ))}
                  </div>
                )}
                {month.kpi_targets?.length > 0 && (
                  <div className="rounded-md bg-primary/5 px-2 py-1.5">
                    <p className="text-[10px] text-primary font-medium">📊 {Array.isArray(month.kpi_targets) ? month.kpi_targets.join(" · ") : month.kpi_targets}</p>
                  </div>
                )}
                {month.decision_gate && (
                  <div className="rounded-md bg-amber-50 border border-amber-200 px-2 py-1.5">
                    <p className="text-[10px] font-semibold text-amber-800">Decision Gate</p>
                    <p className="text-[10px] text-amber-700">{month.decision_gate}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 10 — SCALE / PIVOT / KILL GOVERNANCE
      ═══════════════════════════════════════════════════ */}
      {(scaleSignals.length > 0 || pivotSignals.length > 0 || killSignals.length > 0) && (
        <div className="space-y-4">
          <SectionHeader icon={Swords} title="Scale / Pivot / Kill Governance" number={10} />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Scale ({scaleSignals.length})</p>
              </div>
              {scaleSignals.length > 0 ? scaleSignals.slice(0, 4).map((sig: any, i: number) => <SignalCard key={i} signal={sig} />) : <p className="text-xs text-muted-foreground">Not yet defined</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRightLeft className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pivot ({pivotSignals.length})</p>
              </div>
              {pivotSignals.length > 0 ? pivotSignals.slice(0, 4).map((sig: any, i: number) => <SignalCard key={i} signal={sig} />) : <p className="text-xs text-muted-foreground">Not yet defined</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-bold text-destructive uppercase tracking-wider">Kill ({killSignals.length})</p>
              </div>
              {killSignals.length > 0 ? killSignals.slice(0, 4).map((sig: any, i: number) => <SignalCard key={i} signal={sig} />) : <p className="text-xs text-muted-foreground">Not yet defined</p>}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 11 — VENTURE MATURITY MAP
      ═══════════════════════════════════════════════════ */}
      {hasAllPhases && (
        <div className="space-y-4">
          <SectionHeader icon={Layers} title="Venture Maturity Map" number={11} />
          <div className="rounded-xl border border-border/60 bg-card p-5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium w-28"></th>
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
                      <td className="py-3 pr-4 font-medium text-muted-foreground whitespace-nowrap">{label}</td>
                      {maturityDimensions.map(d => {
                        const isActive = d.level === level;
                        const isPast   = d.level > level;
                        return (
                          <td key={d.label} className="text-center py-3 px-3">
                            <div className={`mx-auto h-6 w-6 rounded-full flex items-center justify-center ${
                              isActive ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
                              isPast   ? "bg-primary/20" : "bg-muted"
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

      {/* ═══════════════════════════════════════════════════
          SECTION 12 — INVESTMENT READINESS
      ═══════════════════════════════════════════════════ */}
      {hasAllPhases && (
        <div className="space-y-4">
          <SectionHeader icon={Flame} title="Investment Readiness Snapshot" number={12} />
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Composite Score</p>
                <p className="text-2xl font-bold text-primary">{compositeScore ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{classification || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Capital Coherence</p>
                <p className="text-lg font-bold">{s?.capital_coherence || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Confidence Index</p>
                <p className={`text-lg font-bold ${Number(p1?.executive_summary?.confidence_index) >= 70 ? "text-green-700" : Number(p1?.executive_summary?.confidence_index) >= 50 ? "text-amber-700" : "text-destructive"}`}>
                  {p1?.executive_summary?.confidence_index ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Investment Verdict</p>
                <p className={`text-lg font-bold ${verdict?.includes("Proceed") ? "text-green-700" : "text-destructive"}`}>{verdict || "—"}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border/40 grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-primary mb-1">Strategic Insight (P1)</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{p1?.executive_summary?.strategic_insight || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-accent mb-1">Execution Insight (P2)</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{p2?.executive_summary?.strategic_insight || p2?.executive_summary?.action_summary || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Scoring audit (collapsible) ─── */}
      {s && (
        <Collapsible open={auditOpen} onOpenChange={setAuditOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-2">
              {auditOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              <span className="font-medium uppercase tracking-wider">12-Stage Scoring Audit</span>
              <div className="flex-1 h-px bg-border/60" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><span className="text-muted-foreground">P1 Score:</span> <span className="font-bold">{p1Score?.toFixed(0) || "—"}</span></div>
                <div><span className="text-muted-foreground">P2 Score:</span> <span className="font-bold">{p2Score?.toFixed(0) || "—"}</span></div>
                <div><span className="text-muted-foreground">P3 Score:</span> <span className="font-bold">{p3Score?.toFixed(0) || "—"}</span></div>
                <div><span className="text-muted-foreground">Composite:</span> <span className="font-bold text-primary">{compositeScore ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Conflicts:</span> <span className="font-bold text-destructive">{s.conflicts?.length || 0} (penalty: {s.conflicts?.reduce((sum: number, c: any) => sum + c.penalty, 0) || 0})</span></div>
                <div><span className="text-muted-foreground">High Risks:</span> <span className="font-bold text-destructive">{s.risk_matrix?.high || 0}</span></div>
                <div><span className="text-muted-foreground">Unvalidated:</span> <span className="font-bold text-amber-700">{s.assumption_tracker?.unvalidated || 0}</span></div>
                <div><span className="text-muted-foreground">Capital:</span> <span className="font-bold">{s.capital_coherence || "—"}</span></div>
              </div>
              <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                Weights used — P1: {(s.weights_used?.p1 * 100).toFixed(0)}% · P2: {(s.weights_used?.p2 * 100).toFixed(0)}% · P3: {(s.weights_used?.p3 * 100).toFixed(0)}%
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Not all phases complete */}
      {!hasAllPhases && (
        <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-muted-foreground">
          <p className="text-sm">Complete all 3 phases to unlock the full Venture Blueprint with 12-stage synthesis.</p>
          <div className="flex justify-center gap-8 mt-4 text-xs">
            <span className={p1Score !== null ? "text-primary font-semibold" : ""}>{p1Score !== null ? "✓" : "○"} Phase 1 — Validation</span>
            <span className={p2Score !== null ? "text-accent font-semibold" : ""}>{p2Score !== null ? "✓" : "○"} Phase 2 — Execution</span>
            <span className={p3Score !== null ? "text-primary font-semibold" : ""}>{p3Score !== null ? "✓" : "○"} Phase 3 — Growth</span>
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