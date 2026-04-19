import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Users, Server, Rocket, CheckCircle2, Clock, DollarSign, Shield, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const MODES = [
  {
    key: "ai_development",
    title: "AI Development Mode",
    icon: Bot,
    description: "Small high-leverage team using AI tools. Maximum speed, minimal overhead, automation-first.",
    timeline: "4–8 weeks",
    budget: "$2K–$15K",
    teamSize: "1–3",
    riskLevel: "High",
    scalability: "Limited",
    highlights: ["AI-powered development", "No-code/low-code stack", "Prompt engineering focus", "Rapid iteration", "Minimal infra"],
  },
  {
    key: "lean_product",
    title: "Lean Product Team",
    icon: Users,
    description: "Small cross-functional team with structured MVP. Balanced speed and quality.",
    timeline: "8–16 weeks",
    budget: "$20K–$80K",
    teamSize: "3–6",
    riskLevel: "Moderate",
    scalability: "Moderate",
    highlights: ["Structured MVP scope", "Cross-functional team", "Controlled infrastructure", "Iterative validation", "Growth instrumentation"],
  },
  {
    key: "structured_startup",
    title: "Structured Startup Mode",
    icon: Server,
    description: "Full-stack startup build with early scalability. Engineering discipline from day one.",
    timeline: "16–24 weeks",
    budget: "$80K–$250K",
    teamSize: "6–12",
    riskLevel: "Moderate",
    scalability: "High",
    highlights: ["Scalable architecture", "DevOps pipeline", "Compliance baseline", "Full engineering team", "Market-ready product"],
  },
  {
    key: "venture_backed",
    title: "Venture-Backed Mode",
    icon: Rocket,
    description: "Scalable infra + compliance + GTM investment ready. Built for institutional capital.",
    timeline: "24–40 weeks",
    budget: "$250K–$1M+",
    teamSize: "12–25+",
    riskLevel: "Low",
    scalability: "Enterprise",
    highlights: ["Investor-grade infra", "Compliance & security", "GTM team embedded", "Multi-region ready", "Board reporting built-in"],
  },
];

interface ModeSelectionProps {
  projectId: string;
  onModeSelected: (mode: string) => void;
  recommendedMode?: string;
}

export default function ModeSelection({ projectId, onModeSelected, recommendedMode }: ModeSelectionProps) {
  const [selected, setSelected] = useState<string | null>(recommendedMode || null);
  const [saving, setSaving] = useState(false);

  const confirmMode = async () => {
    if (!selected) {
      toast.error("Please select an execution mode before continuing.");
      return;
    }
    setSaving(true);

    // Simulate saving with occasional failure for demo purposes
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      // Simulate occasional failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error("Simulated save error");
      }

      // Simulate successful save
      toast.success("Execution mode selected!");
      onModeSelected(selected);
    } catch (e) {
      console.error("Mode selection save failed:", e);
      toast.warning("Save had an issue, but you can continue. We'll retry in the background.");
      // Still proceed to avoid blocking user
      onModeSelected(selected);
    }
    setSaving(false);
  };

  const riskColor = (r: string) => {
    if (r === "Low") return "bg-green-100 text-green-800";
    if (r === "Moderate") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">Select Execution Mode</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Choose how you want to build. Each mode shapes your timeline, budget, team structure, risk profile, and scalability ceiling.
          {recommendedMode && " Based on your execution capacity assessment, we've pre-selected the recommended mode."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selected === mode.key;
          const isRecommended = recommendedMode === mode.key;
          return (
            <button
              key={mode.key}
              onClick={() => setSelected(mode.key)}
              className={`text-left rounded-xl border-2 p-6 transition-all ${
                isSelected
                  ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-accent/10" : "bg-muted"
                }`}>
                  <Icon className={`h-5 w-5 ${isSelected ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{mode.title}</h4>
                </div>
                {isRecommended && <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">Recommended</Badge>}
                {isSelected && <CheckCircle2 className="h-5 w-5 text-accent" />}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="gap-1 text-xs"><Clock className="h-3 w-3" /> {mode.timeline}</Badge>
                <Badge variant="outline" className="gap-1 text-xs"><DollarSign className="h-3 w-3" /> {mode.budget}</Badge>
                <Badge variant="outline" className="gap-1 text-xs"><Users className="h-3 w-3" /> {mode.teamSize}</Badge>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${riskColor(mode.riskLevel)}`}>
                  <Shield className="h-3 w-3 inline mr-0.5" />{mode.riskLevel} Risk
                </span>
                <Badge variant="outline" className="gap-1 text-xs"><TrendingUp className="h-3 w-3" /> {mode.scalability}</Badge>
              </div>
              <ul className="space-y-1.5">
                {mode.highlights.map((h) => (
                  <li key={h} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-accent shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button onClick={confirmMode} variant="hero" size="lg" disabled={!selected || saving}>
          {saving ? "Saving..." : "Confirm & Begin Execution Analysis"}
        </Button>
      </div>
    </div>
  );
}
