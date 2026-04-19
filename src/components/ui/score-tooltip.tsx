import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ScoreTooltipProps {
  label: string;
  score: number;
  meaning: string;
  reason: string;
  improvement: string;
  children: React.ReactNode;
}

export function ScoreTooltip({ label, score, meaning, reason, improvement, children }: ScoreTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3 space-y-1.5">
          <p className="font-semibold text-sm">{label}: {score.toFixed(0)}%</p>
          <p className="text-xs"><span className="font-medium">What it means:</span> {meaning}</p>
          <p className="text-xs"><span className="font-medium">Why this score:</span> {reason}</p>
          <p className="text-xs"><span className="font-medium">To improve:</span> {improvement}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper to generate tooltip content based on score and layer
export function getLayerTooltip(layer: string, score: number) {
  const level = score >= 70 ? "strong" : score >= 50 ? "moderate" : "weak";
  
  const tooltips: Record<string, Record<string, { meaning: string; reason: string; improvement: string }>> = {
    "Reality Pressure": {
      strong: { meaning: "Strong problem intensity with clear spending evidence.", reason: "Users frequently encounter this pain and are willing to pay for solutions.", improvement: "Validate with more user interviews and quantify coping costs." },
      moderate: { meaning: "Moderate problem intensity but gaps in spending signals.", reason: "Problem exists but spending evidence or urgency could be stronger.", improvement: "Gather direct evidence of user spending, increase urgency validation." },
      weak: { meaning: "Weak problem signal — users may not feel enough pain.", reason: "Low frequency, urgency, or spending evidence detected.", improvement: "Re-validate the problem statement, interview more users, find stronger pain points." },
    },
    "Market Physics": {
      strong: { meaning: "Favorable market conditions with strong infrastructure.", reason: "Good purchasing power, digital maturity, and timing alignment.", improvement: "Monitor regulatory changes and expand to adjacent segments." },
      moderate: { meaning: "Mixed market signals — some conditions favorable.", reason: "Gaps in infrastructure, timing, or purchasing power.", improvement: "Address infrastructure gaps, validate timing with market data." },
      weak: { meaning: "Challenging market environment.", reason: "Weak purchasing power, poor infrastructure, or regulatory friction.", improvement: "Consider different geography, wait for better timing, or adjust pricing." },
    },
    "Buyer Economics": {
      strong: { meaning: "Healthy unit economics with clear monetization.", reason: "Good margins, reasonable CAC, and recurring revenue potential.", improvement: "Optimize CAC channels and explore upsell opportunities." },
      moderate: { meaning: "Unit economics need refinement.", reason: "CAC or margins need work, or revenue model unclear.", improvement: "Test pricing, reduce acquisition costs, clarify buyer vs user." },
      weak: { meaning: "Unsustainable buyer economics.", reason: "High CAC, low margins, or no clear monetization.", improvement: "Fundamentally rethink pricing, reduce capital intensity, find cheaper channels." },
    },
    "Competitive Gravity": {
      strong: { meaning: "Low competition with clear differentiation.", reason: "Blue ocean positioning with weak substitutes.", improvement: "Build switching costs and defensibility early." },
      moderate: { meaning: "Moderate competition — differentiation needed.", reason: "Some competitors exist but room for positioning.", improvement: "Sharpen unique value proposition, target underserved niches." },
      weak: { meaning: "Highly competitive with strong substitutes.", reason: "Saturated market with established alternatives.", improvement: "Find a niche, build stronger moats, consider pivot to less competitive segment." },
    },
    "Founder Leverage": {
      strong: { meaning: "Strong founder-market fit with key advantages.", reason: "Domain expertise, network, and capital access aligned.", improvement: "Leverage network for early traction and distribution." },
      moderate: { meaning: "Some founder advantages but gaps exist.", reason: "Missing domain depth, network, or capital access.", improvement: "Build missing capabilities through advisors or co-founders." },
      weak: { meaning: "Significant founder capability gaps.", reason: "Limited domain expertise, network, or execution capacity.", improvement: "Find co-founders with complementary skills, join relevant communities." },
    },
    "Research": {
      strong: { meaning: "Thorough research with strong evidence base.", reason: "Good market coverage, validated assumptions, quality data.", improvement: "Keep research current and expand competitive analysis." },
      moderate: { meaning: "Research foundation present but gaps exist.", reason: "Some assumptions unvalidated or data quality concerns.", improvement: "Conduct more customer interviews, validate key assumptions." },
      weak: { meaning: "Insufficient research — high assumption risk.", reason: "Limited evidence, shallow research, or outdated data.", improvement: "Prioritize customer interviews and competitive research before building." },
    },
    "Scoping": {
      strong: { meaning: "Well-defined MVP scope with clear value loop.", reason: "Tight boundaries, manual-first approach, clear failure mapping.", improvement: "Maintain scope discipline during build phase." },
      moderate: { meaning: "Scope defined but boundaries could tighten.", reason: "Some feature creep risk or unclear value loop.", improvement: "Cut nice-to-haves aggressively, define clearer success metrics." },
      weak: { meaning: "Scope is too broad or undefined.", reason: "Feature creep, no MVP boundaries, or unclear core loop.", improvement: "Define 1 core value loop, cut everything else for v1." },
    },
    "Architecture": {
      strong: { meaning: "Solid technical architecture for the execution mode.", reason: "Good build path, security, and scalability planning.", improvement: "Document architecture decisions for team alignment." },
      moderate: { meaning: "Architecture adequate but has risks.", reason: "Gaps in security, scalability, or vendor dependency.", improvement: "Address security baseline and reduce vendor lock-in." },
      weak: { meaning: "Technical architecture is fragile.", reason: "No clear build path, security gaps, or high tech debt risk.", improvement: "Simplify architecture, address security first, reduce dependencies." },
    },
    "Resource": {
      strong: { meaning: "Resources well-optimized for execution mode.", reason: "Healthy runway, controlled burn, adequate capital buffer.", improvement: "Maintain burn discipline and extend runway where possible." },
      moderate: { meaning: "Resource allocation workable but tight.", reason: "Runway or capital buffer concerns.", improvement: "Reduce burn rate, prioritize spending, explore alternative funding." },
      weak: { meaning: "Resource constraints threaten execution.", reason: "Short runway, high burn, or hiring bottlenecks.", improvement: "Drastically reduce scope to fit budget, seek funding, or extend runway." },
    },
    "MVP": {
      strong: { meaning: "Strong MVP deployment and validation plan.", reason: "Clear pilot cohort, good instrumentation, iteration discipline.", improvement: "Launch fast and iterate based on real user feedback." },
      moderate: { meaning: "MVP plan needs stronger validation framework.", reason: "Pilot cohort or feedback loops need work.", improvement: "Define specific pilot users, add analytics instrumentation." },
      weak: { meaning: "MVP deployment plan is weak.", reason: "No real users defined, poor instrumentation, no iteration plan.", improvement: "Identify 10 pilot users before building, add basic analytics from day 1." },
    },
    "Entry": {
      strong: { meaning: "Clear market entry with strong positioning.", reason: "Sharp segment clarity, effective wedge strategy, good timing.", improvement: "Execute wedge strategy quickly to establish beachhead." },
      moderate: { meaning: "Entry strategy defined but needs refinement.", reason: "Segment or positioning could be sharper.", improvement: "Narrow ICP further, test messaging with target users." },
      weak: { meaning: "Unclear market entry strategy.", reason: "Broad segments, weak positioning, or poor timing.", improvement: "Pick one specific niche, craft compelling wedge, validate messaging." },
    },
    "Org": {
      strong: { meaning: "Well-designed organizational structure.", reason: "Clear roles, hiring triggers, low founder dependency.", improvement: "Document processes for team scalability." },
      moderate: { meaning: "Org design functional but has dependencies.", reason: "Some founder bottleneck or unclear hiring triggers.", improvement: "Reduce founder dependency, define clear decision rights." },
      weak: { meaning: "Organizational design is fragile.", reason: "High founder dependency, unclear roles, poor communication.", improvement: "Hire first key role, document decisions, establish communication rhythms." },
    },
    "Demand": {
      strong: { meaning: "Strong demand generation engine planned.", reason: "Diversified channels, clear CAC model, experiment framework.", improvement: "Launch experiments quickly, track CAC per channel." },
      moderate: { meaning: "Demand generation plan needs more depth.", reason: "Channel concentration risk or unclear CAC.", improvement: "Diversify channels, build content engine, test paid experiments." },
      weak: { meaning: "No clear demand generation strategy.", reason: "Channel dependency, no CAC model, weak traction plan.", improvement: "Start with 2-3 free channels, define CAC targets, plan experiments." },
    },
    "Conversion": {
      strong: { meaning: "Well-defined conversion funnel.", reason: "Clear activation metrics, good onboarding, low dropoff risk.", improvement: "Optimize each funnel stage with A/B testing." },
      moderate: { meaning: "Conversion funnel partially defined.", reason: "Activation metric or onboarding needs work.", improvement: "Define activation metric, map onboarding steps, reduce friction." },
      weak: { meaning: "Conversion architecture is undefined.", reason: "No activation metric, poor onboarding, high dropoff risk.", improvement: "Map the entire funnel, define one key activation metric, simplify onboarding." },
    },
    "Scale Ctrl": {
      strong: { meaning: "Clear scale/pivot/kill triggers defined.", reason: "Good LTV/CAC thresholds and retention metrics.", improvement: "Monitor triggers weekly and act decisively." },
      moderate: { meaning: "Scale controls partially defined.", reason: "Some triggers unclear or thresholds not set.", improvement: "Set specific numerical thresholds for each trigger." },
      weak: { meaning: "No scale control framework.", reason: "Missing thresholds, unclear when to pivot or kill.", improvement: "Define 3 scale, 3 pivot, and 3 kill signals with specific metrics." },
    },
    "Economics": {
      strong: { meaning: "Healthy unit economics with growth potential.", reason: "Good LTV/CAC ratio, manageable burn, clear capital timing.", improvement: "Maintain unit economics as you scale acquisition." },
      moderate: { meaning: "Unit economics workable but watch margins.", reason: "LTV/CAC or burn rate needs monitoring.", improvement: "Improve LTV through retention, reduce CAC through organic channels." },
      weak: { meaning: "Unit economics are unsustainable.", reason: "Poor LTV/CAC, high burn, or hiring misalignment.", improvement: "Fix unit economics before scaling — reduce CAC or increase LTV." },
    },
  };

  const layerTooltips = tooltips[layer];
  if (!layerTooltips) return { meaning: `Score: ${score.toFixed(0)}%`, reason: "Based on AI analysis.", improvement: "Review detailed metrics." };
  return layerTooltips[level] || layerTooltips.moderate;
}
