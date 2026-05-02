import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  FileDown, RotateCcw, Lock, ArrowRight, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Star, Lightbulb, Shield, Target, Users, DollarSign, Swords,
  UserCheck, Brain, HelpCircle, Rocket, BarChart3, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { ScoreTooltip, getLayerTooltip } from "@/components/ui/score-tooltip";
import { Button } from "../ui/button";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface Phase1DashboardProps {
  projectId: string;
  onRerun: () => void;
  onLockProceed?: () => void;
}

// Severity badge styling
const severityColor = (s: string) => {
  const sl = s?.toLowerCase();
  if (sl === "low") return "bg-green-100 text-green-800 border-green-200";
  if (sl === "moderate" || sl === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
  if (sl === "high" || sl === "critical") return "bg-red-100 text-red-800 border-red-200";
  return "bg-muted text-muted-foreground";
};

const statusColor = (s: string) => {
  const sl = s?.toLowerCase();
  if (sl === "strong" || sl === "validated" || sl === "defensible") return "text-green-700 bg-green-50";
  if (sl === "moderate" || sl === "emerging" || sl === "clear") return "text-amber-700 bg-amber-50";
  if (sl === "weak" || sl === "untested" || sl === "unclear" || sl === "none") return "text-red-700 bg-red-50";
  return "text-muted-foreground bg-muted";
};

const classColor = (c: string) => {
  if (c === "Strategic Opportunity") return "text-green-600 bg-green-50 border-green-200";
  if (c === "Conditional Build") return "text-amber-600 bg-amber-50 border-amber-200";
  if (c === "High Risk Pivot") return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const classIcon = (c: string) => {
  if (c === "Strategic Opportunity") return <CheckCircle2 className="h-5 w-5" />;
  if (c === "Conditional Build") return <TrendingUp className="h-5 w-5" />;
  if (c === "High Risk Pivot") return <AlertTriangle className="h-5 w-5" />;
  return <XCircle className="h-5 w-5" />;
};

const getBarColor = (score: number) => {
  if (score >= 70) return "hsl(var(--primary))";
  if (score >= 50) return "hsl(var(--accent))";
  return "hsl(var(--destructive))";
};


export default function Phase1Dashboard({ projectId, onRerun, onLockProceed }: Phase1DashboardProps) {
  const [scores, setScores] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);

  useEffect(() => { loadData(); }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase1/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const projectData = data.data;
        
        // Set scores data
        setScores({
          viability_score: projectData.phase1_score,
          classification: projectData.phase1_classification,
          phase1_analysis: projectData.phase1_analysis
        });

        // Set alternative routes from AI analysis
        const routes = projectData.phase1_analysis?.alternative_routes?.map((route: any, index: number) => ({
          id: `route${index}`,
          title: route.route,
          description: route.description,
          is_original: index === 0,
          recommended: index === 0
        })) || [];

        setRoutes(routes);
        const recommended = routes.find((r: any) => r.recommended);
        const orig = routes.find((r: any) => r.is_original);
        setSelectedRoute(recommended?.id || orig?.id || null);
      } else {
        // If API fails, show no data
        setScores(null);
        setRoutes([]);
      }
    } catch (error) {
      console.error('Failed to load Phase 1 dashboard data:', error);
      setScores(null);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    if (!selectedRoute) { toast.error("Please select a route before proceeding."); return; }
    setShowLockModal(true);
  };

  const confirmLock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase1/${projectId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setShowLockModal(false);
        toast.success("Phase 1 locked. Navigating to Phase 2...");
        onLockProceed?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to lock Phase 1");
      }
    } catch (error) {
      toast.error("Network error while locking Phase 1");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!scores) return <div className="text-center py-16 text-muted-foreground">No scoring data yet.</div>;

  const report = (scores.phase1_analysis as any) || {};
  const exec = report.executive_summary || {};
  const problem = report.problem_intensity || {};
  const market = report.market_opportunity || {};
  const buyer = report.buyer_economics || {};
  const competitive = report.competitive_positioning || {};
  const founder = report.founder_advantage || {};
  const assumptionMap = report.assumption_map || {};
  const riskClusters = report.risk_clusters || report.risk_flags || [];
  const validationGaps = report.validation_gaps || [];
  const buildReadiness = report.build_readiness || {};
  const confidenceBreakdown = report.confidence_breakdown || {};
  const validationMaturity = report.validation_maturity || "Early";
  const reasoning = report.ai_reasoning_trace || report.reasoning || {};
  const scoringDecisions = report.scoring_decisions || {};
  const strategicRoutes = report.strategic_routes || {};
  
  const analysis = scores.phase1_analysis || {};
  const scoringLayers = analysis.scoring_layers || {};
  
  // Use confidence index from executive_summary
  const confidenceIndex = exec.confidence_index || 
    Math.round(((scoringLayers.problem_validation?.score || 0) + 
                 (scoringLayers.solution_fit?.score || 0) + 
                 (scoringLayers.market_opportunity?.score || 0) + 
                 (scoringLayers.founder_market_fit?.score || 0) + 
                 (scoringLayers.business_model?.score || 0)) / 5);
  
  // Calculate dynamic weights based on actual AI scores
  const totalScore = (problem.score || scoringLayers.problem_validation?.score || 0) + 
                     (competitive.score || scoringLayers.solution_fit?.score || 0) + 
                     (market.score || scoringLayers.market_opportunity?.score || 0) + 
                     (founder.score || scoringLayers.founder_market_fit?.score || 0) + 
                     (buyer.score || scoringLayers.business_model?.score || 0);
  
  const layerData = [
    { layer: "Problem Validation", key: "Problem", score: problem.score || scoringLayers.problem_validation?.score || 0, weight: totalScore > 0 ? Math.round(((problem.score || scoringLayers.problem_validation?.score || 0) / totalScore) * 100) + "%" : "30%" },
    { layer: "Solution Fit", key: "Solution", score: competitive.score || scoringLayers.solution_fit?.score || 0, weight: totalScore > 0 ? Math.round(((competitive.score || scoringLayers.solution_fit?.score || 0) / totalScore) * 100) + "%" : "25%" },
    { layer: "Market Opportunity", key: "Market", score: market.score || scoringLayers.market_opportunity?.score || 0, weight: totalScore > 0 ? Math.round(((market.score || scoringLayers.market_opportunity?.score || 0) / totalScore) * 100) + "%" : "20%" },
    { layer: "Founder-Market Fit", key: "Founder", score: founder.score || scoringLayers.founder_market_fit?.score || 0, weight: totalScore > 0 ? Math.round(((founder.score || scoringLayers.founder_market_fit?.score || 0) / totalScore) * 100) + "%" : "15%" },
    { layer: "Business Model", key: "Business", score: buyer.score || scoringLayers.business_model?.score || 0, weight: totalScore > 0 ? Math.round(((buyer.score || scoringLayers.business_model?.score || 0) / totalScore) * 100) + "%" : "10%" },
  ];

  const maturityColor = (m: string) => {
    if (m === "Investment-Ready") return "bg-green-100 text-green-800";
    if (m === "Structured") return "bg-blue-100 text-blue-800";
    if (m === "Emerging") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  const renderAssumptionGroup = (title: string, assumptions: any[]) => {
    if (!assumptions?.length) return null;
    return (
      <div className="space-y-2">
        <h6 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h6>
        {assumptions.map((a: any, i: number) => (
          <div key={i} className="rounded-lg border p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium flex-1">{a.assumption}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor(a.status)}`}>
                {a.status}
              </span>
            </div>
            {a.why && <p className="text-xs text-muted-foreground mt-1">{a.why}</p>}
            {a.validation_method && <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium">Validate:</span> {a.validation_method}</p>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ========== 1. EXECUTIVE VALIDATION SUMMARY ========== */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            <CardTitle className="text-lg">Executive Validation Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Top metric row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
              <p className="text-3xl font-bold text-primary">{Number(scores.viability_score).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Viability Score</p>
            </div>
            <div className={`rounded-xl p-4 text-center border ${classColor(scores.classification)}`}>
              <div className="flex items-center justify-center gap-2">
                {classIcon(scores.classification)}
                <p className="text-base font-bold">{scores.classification}</p>
              </div>
              <p className="text-xs mt-1 opacity-70">Classification</p>
            </div>
            <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 text-center">
              <p className="text-xl font-bold text-accent">{Number(confidenceIndex).toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Confidence Index</p>
            </div>
            <div className="rounded-xl p-4 text-center border">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${maturityColor(validationMaturity)}`}>
                {validationMaturity}
              </span>
              <p className="text-xs text-muted-foreground mt-2">Validation Maturity</p>
            </div>
          </div>
          {/* Strategic insight */}
          {exec.headline && <p className="text-sm font-semibold text-primary">{exec.headline}</p>}
          {exec.strategic_insight && (
            <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
              <p className="text-sm leading-relaxed">{exec.strategic_insight}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== AI REASONING TRACE ========== */}
      {reasoning.stage2_problem_strength && (
        <Card className="border border-indigo-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-600" />
              AI Reasoning Trace
              <span className="text-xs text-muted-foreground font-normal">(8-stage analysis before scoring)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Tier Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: "Problem", tier: reasoning.stage2_problem_strength?.tier },
                { label: "Market", tier: reasoning.stage3_market_structure?.tier },
                { label: "Economics", tier: reasoning.stage4_economic_viability?.tier },
                { label: "Competition", tier: reasoning.stage5_competitive_gravity?.tier },
                { label: "Founder", tier: reasoning.stage6_founder_leverage?.tier },
                { label: "Validation", tier: reasoning.stage8_validation_maturity?.maturity },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border p-2 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">{s.label}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    s.tier?.includes("Strong") || s.tier?.includes("Low Gravity") || s.tier?.includes("Structured") || s.tier?.includes("Revenue")
                      ? "bg-green-100 text-green-800"
                      : s.tier?.includes("Weak") || s.tier?.includes("High Gravity") || s.tier?.includes("Competitive Pressure") || s.tier?.includes("Idea")
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                  }`}>{s.tier || "—"}</span>
                </div>
              ))}
            </div>

            {/* Assumption Risk Density */}
            {reasoning.stage7_assumption_risk && (
              <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Assumption Risk Density</p>
                  <p className="text-[10px] text-muted-foreground">{reasoning.stage7_assumption_risk.high_risk_count} of {reasoning.stage7_assumption_risk.total_assumptions} assumptions are high-risk</p>
                </div>
                <span className={`text-sm font-bold ${
                  (reasoning.stage7_assumption_risk.assumption_risk_density || 0) > 50 ? "text-red-600" : "text-green-600"
                }`}>{reasoning.stage7_assumption_risk.assumption_risk_density}%</span>
              </div>
            )}

            {/* Scoring Decision Transparency */}
            {scoringDecisions.tier_modifiers_applied && (
              <div className="rounded-lg border-l-4 border-indigo-300 bg-indigo-50/50 p-3">
                <p className="text-xs font-semibold text-indigo-800 mb-1">Scoring Decision Audit</p>
                <p className="text-xs text-indigo-700">{scoringDecisions.tier_modifiers_applied}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Raw weighted: <strong>{scoringDecisions.weighted_raw}</strong></span>
                  <span className="text-xs text-muted-foreground">→ Final: <strong>{scoringDecisions.viability_final}</strong></span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Layer Breakdown - visual only, no numeric scores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            Layer Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {layerData.map((entry) => {
              const tooltip = getLayerTooltip(entry.layer, entry.score);
              return (
                <ScoreTooltip key={entry.key} label={entry.layer} score={entry.score} meaning={tooltip.meaning} reason={tooltip.reason} improvement={tooltip.improvement}>
                  <div className="cursor-help">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{entry.layer} <span className="text-muted-foreground">({entry.weight})</span></span>
                      <span className="font-bold" style={{ color: getBarColor(entry.score) }}>{entry.score}</span>
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

      {/* ========== 2. PROBLEM INTENSITY ========== */}
      <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-destructive" />
              Problem Intensity & Urgency Analysis
              {problem.problem_strength_tier && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto ${
                  problem.problem_strength_tier === "Strong" ? "bg-green-100 text-green-800" :
                  problem.problem_strength_tier === "Weak" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                }`}>{problem.problem_strength_tier}</span>
              )}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-primary">{problem.score || "N/A"}</p>
              <p className="text-xs text-muted-foreground">Problem Intensity</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(problem.spending_evidence)}`}>
                {problem.spending_evidence || "N/A"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Spending Evidence</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(problem.coping_cost)}`}>
                {problem.coping_cost || "N/A"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Coping Cost</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${severityColor(problem.urgency_index)}`}>
                {problem.urgency_index || "N/A"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Urgency Index</p>
            </div>
          </div>
          {problem.narrative && (
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-muted pl-3">{problem.narrative}</p>
          )}
        </CardContent>
      </Card>

      {/* ========== 3. MARKET OPPORTUNITY ========== */}
      <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Market Opportunity Structure
              {market.market_structure_tier && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto ${
                  market.market_structure_tier === "Structured Market" ? "bg-green-100 text-green-800" :
                  market.market_structure_tier === "Competitive Pressure Market" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                }`}>{market.market_structure_tier}</span>
              )}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Target Segment</span></div>
              <p className="text-sm font-medium">{market.segment_definition || "Not analyzed"}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border p-2 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(market.market_size_tier)}`}>{market.market_size_tier || "N/A"}</span>
                <p className="text-[10px] text-muted-foreground mt-1">Market Size</p>
              </div>
              <div className="rounded-lg border p-2 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(market.purchasing_power)}`}>{market.purchasing_power || "N/A"}</span>
                <p className="text-[10px] text-muted-foreground mt-1">Purchasing Power</p>
              </div>
              <div className="rounded-lg border p-2 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(market.infrastructure_ready ? 'Ready' : 'Not Ready')}`}>{market.infrastructure_ready ? 'Ready' : 'Not Ready'}</span>
                <p className="text-[10px] text-muted-foreground mt-1">Infrastructure</p>
              </div>
              <div className="rounded-lg border p-2 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${severityColor(market.timing_window === "Too Early" || market.timing_window === "Late" ? "High" : market.timing_window === "Early" ? "Moderate" : "Low")}`}>{market.timing_window || "N/A"}</span>
                <p className="text-[10px] text-muted-foreground mt-1">Timing Window</p>
              </div>
            </div>
          </div>
          {market.narrative && (
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-blue-200 pl-3">{market.narrative}</p>
          )}
        </CardContent>
      </Card>

      {/* ========== 4. BUYER ECONOMICS ========== */}
      <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Buyer Economics Model Snapshot
              {buyer.economic_viability_tier && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto ${
                  buyer.economic_viability_tier === "Strong Economic Model" ? "bg-green-100 text-green-800" :
                  buyer.economic_viability_tier === "Weak Model" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                }`}>{buyer.economic_viability_tier}</span>
              )}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Who Pays</p>
              <p className="text-sm font-medium">{buyer.who_pays || "Not defined"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Revenue Model</p>
              <p className="text-sm font-medium">{buyer.revenue_model || "Not defined"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Model Clarity</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(buyer.revenue_model_clarity)}`}>{buyer.revenue_model_clarity || "N/A"}</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(buyer.unit_economics_tier)}`}>{buyer.unit_economics_tier || "N/A"}</span>
              <p className="text-xs text-muted-foreground mt-1">Unit Economics Tier</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(buyer.capital_intensity)}`}>{buyer.capital_intensity || "N/A"}</span>
              <p className="text-xs text-muted-foreground mt-1">Capital Intensity</p>
            </div>
          </div>
          {buyer.narrative && (
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-green-200 pl-3">{buyer.narrative}</p>
          )}
        </CardContent>
      </Card>

      {/* ========== 5. COMPETITIVE POSITIONING ========== */}
      <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Swords className="h-4 w-4 text-orange-600" />
              Competitive Positioning Analysis
              {competitive.competitive_pressure_tier && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto ${
                  competitive.competitive_pressure_tier === "Low Gravity" ? "bg-green-100 text-green-800" :
                  competitive.competitive_pressure_tier === "High Gravity" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                }`}>{competitive.competitive_pressure_tier}</span>
              )}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Direct Competitors</p>
              <p className="text-sm">{competitive.direct_competitors || "Not analyzed"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Substitute Alternatives</p>
              <p className="text-sm">{competitive.substitute_alternatives || "Not analyzed"}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(competitive.differentiation_clarity)}`}>{competitive.differentiation_clarity || "N/A"}</span>
              <p className="text-xs text-muted-foreground mt-1">Differentiation</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(competitive.switching_friction)}`}>{competitive.switching_friction || "N/A"}</span>
              <p className="text-xs text-muted-foreground mt-1">Switching Friction</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(competitive.platform_dependency)}`}>{competitive.platform_dependency || "N/A"}</span>
              <p className="text-xs text-muted-foreground mt-1">Platform Dependency</p>
            </div>
          </div>
          {competitive.narrative && (
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-orange-200 pl-3">{competitive.narrative}</p>
          )}
        </CardContent>
      </Card>

      {/* ========== 6. FOUNDER ADVANTAGE ========== */}
      <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              Founder Strategic Advantage
              {founder.founder_leverage_tier && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto ${
                  founder.founder_leverage_tier === "Strong Leverage" ? "bg-green-100 text-green-800" :
                  founder.founder_leverage_tier === "Weak Leverage" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                }`}>{founder.founder_leverage_tier}</span>
              )}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: "Domain", value: founder.domain_leverage },
              { label: "Distribution", value: founder.distribution_access },
              { label: "Talent", value: founder.talent_access },
              { label: "Capital", value: founder.capital_access },
              { label: "Network", value: founder.network_leverage },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-2 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(item.value)}`}>{item.value || "N/A"}</span>
                <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          {founder.narrative && (
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-purple-200 pl-3">{founder.narrative}</p>
          )}
        </CardContent>
      </Card>

      {/* ========== 7. ASSUMPTION MAP ========== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-600" />
            Core Assumption Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {renderAssumptionGroup("Market Assumptions", assumptionMap.market_assumptions)}
          {renderAssumptionGroup("Economic Assumptions", assumptionMap.economic_assumptions)}
          {renderAssumptionGroup("Behavioral Assumptions", assumptionMap.behavioral_assumptions)}
          {renderAssumptionGroup("Execution Assumptions", assumptionMap.execution_assumptions)}

          {(assumptionMap.ai_recommended_assumptions || assumptionMap.recommended_assumptions)?.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  <h6 className="text-xs font-semibold uppercase tracking-wider text-accent">AI-Recommended Assumptions to Test</h6>
                </div>
                {(assumptionMap.ai_recommended_assumptions || assumptionMap.recommended_assumptions).map((a: any, i: number) => (
                  <div key={i} className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                    <p className="text-sm font-medium">{a.assumption}</p>
                    {a.rationale && <p className="text-xs text-muted-foreground mt-1">{a.rationale}</p>}
                    {a.validation_method && <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium">Validate:</span> {a.validation_method}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ========== 8. RISK CLUSTERS ========== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-destructive" />
            Primary Risk Clusters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Market Risk", data: riskClusters.market_risk },
              { label: "Economic Risk", data: riskClusters.economic_risk },
              { label: "Competitive Risk", data: riskClusters.competitive_risk },
              { label: "Execution Risk", data: riskClusters.execution_risk },
            ].map(({ label, data }) => data ? (
              <div key={label} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h6 className="text-sm font-semibold">{label}</h6>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${severityColor(data.severity)}`}>
                    {data.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{data.explanation}</p>
                <p className="text-xs"><span className="font-medium text-primary">Mitigate:</span> {data.mitigation}</p>
              </div>
            ) : null)}
          </div>
        </CardContent>
      </Card>

      {/* ========== 9. STRATEGIC ROUTE OPTIONS ========== */}
      {routes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Strategic Pivot Options
            </CardTitle>
            <p className="text-xs text-muted-foreground">Select your preferred route before proceeding to Phase 2.</p>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {routes.map((route) => {
                const isSelected = selectedRoute === route.id;
                const isRecommended = route.recommended;
                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route.id)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-medium text-sm">{route.title}</h5>
                        {isRecommended && (
                          <Badge className="bg-accent/10 text-accent text-[10px] gap-1">
                            <Star className="h-3 w-3" /> Recommended
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{route.description}</p>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-accent mb-2" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 10. VALIDATION GAPS ========== */}
      {validationGaps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-600" />
              Validation Gaps — What You Don't Know Yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationGaps.map((gap: any, i: number) => (
                <div key={i} className="rounded-lg border p-3 flex items-start gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 border ${severityColor(gap.importance)}`}>
                    {gap.importance}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{gap.question}</p>
                    {gap.experiment && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Experiment:</span> {gap.experiment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 11. BUILD READINESS ========== */}
      <Card className={`border-2 ${
        buildReadiness.signal?.includes("Ready") ? "border-green-200" :
        buildReadiness.signal?.includes("Field") ? "border-red-200" : "border-amber-200"
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Build Readiness Signal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`rounded-lg p-4 text-center ${
            buildReadiness.signal?.includes("Ready") ? "bg-green-50" :
            buildReadiness.signal?.includes("Field") ? "bg-red-50" : "bg-amber-50"
          }`}>
            <p className={`text-base font-bold ${
              buildReadiness.signal?.includes("Ready") ? "text-green-700" :
              buildReadiness.signal?.includes("Field") ? "text-red-700" : "text-amber-700"
            }`}>{buildReadiness.signal || "Pending Analysis"}</p>
            {buildReadiness.explanation && <p className="text-sm text-muted-foreground mt-2">{buildReadiness.explanation}</p>}
          </div>
        </CardContent>
      </Card>

      {/* ========== 12. CONFIDENCE BREAKDOWN ========== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Confidence Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-5 gap-3">
            {[
              { label: "Evidence Strength", value: confidenceBreakdown.evidence_strength },
              { label: "Assumption Clarity", value: confidenceBreakdown.assumption_clarity },
              { label: "Market Clarity", value: confidenceBreakdown.market_clarity },
              { label: "Economic Clarity", value: confidenceBreakdown.economic_clarity },
              { label: "Competitive Realism", value: confidenceBreakdown.competitive_realism },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold text-primary">{item.value != null ? `${item.value}%` : "—"}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          {confidenceBreakdown.narrative && (
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-muted pl-3">{confidenceBreakdown.narrative}</p>
          )}
        </CardContent>
      </Card>

      {/* ========== STRATEGIC ROUTES ========== */}
      {strategicRoutes.recommended_route && (
        <Card className="border border-purple-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Rocket className="h-4 w-4 text-purple-600" />
              Strategic Routes & Decision Path
              <span className="text-xs text-muted-foreground font-normal">(Recommended path with alternatives)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recommended Route */}
            <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <h6 className="font-semibold text-purple-900 mb-1">Recommended Route</h6>
                  <p className="font-medium text-purple-800 mb-2">{strategicRoutes.recommended_route.route}</p>
                  <p className="text-sm text-purple-700 mb-3">{strategicRoutes.recommended_route.description}</p>
                  {strategicRoutes.recommended_route.why_improves && (
                    <div className="bg-purple-100 rounded p-2">
                      <p className="text-xs font-semibold text-purple-800 mb-1">Why This Improves:</p>
                      <p className="text-xs text-purple-700">{strategicRoutes.recommended_route.why_improves}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alternative Routes */}
            {strategicRoutes.alternative_routes?.length > 0 && (
              <div className="space-y-3">
                <h6 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Alternative Routes</h6>
                {strategicRoutes.alternative_routes.map((route: any, index: number) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-1">{route.route}</p>
                        <p className="text-sm text-gray-600">{route.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== ACTIONS ========== */}
      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Button variant="outline" className="gap-2" onClick={onRerun}>
          <RotateCcw className="h-4 w-4" /> Re-run Scoring
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => toast.info("PDF export coming soon!")}>
          <FileDown className="h-4 w-4" /> Export Phase 1 PDF
        </Button>
        <Button variant="hero" className="gap-2" onClick={handleLock} disabled={!selectedRoute}>
          <Lock className="h-4 w-4" /> Lock & Proceed to Phase 2
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Lock Modal */}
      <Dialog open={showLockModal} onOpenChange={setShowLockModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Finalize Phase 1?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to finalize Phase 1? You can edit later but changes will create a new version.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowLockModal(false)}>Cancel</Button>
            <Button variant="hero" onClick={confirmLock}>Confirm & Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}