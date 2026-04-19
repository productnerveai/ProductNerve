import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight, BarChart3, Layers, Rocket, Shield, TrendingUp, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="hero-gradient text-primary-foreground relative overflow-hidden">
      {/* Asymmetrical background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] rounded-full bg-white/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[600px] rotate-12 rounded-3xl bg-white/6 blur-2xl" />
        <div className="absolute top-20 left-1/3 w-px h-64 bg-gradient-to-b from-transparent via-white/25 to-transparent" />
        <div className="absolute bottom-32 right-1/3 w-px h-48 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        {/* Stacked geometric shapes */}
        <div className="absolute top-16 right-[15%] w-16 h-16 border-2 border-white/20 rounded-lg rotate-45" />
        <div className="absolute top-24 right-[17%] w-12 h-12 border-2 border-white/15 rounded-lg rotate-[30deg]" />
        <div className="absolute bottom-24 left-[10%] w-20 h-20 border-2 border-white/20 rounded-full" />
      </div>

      <div className="container relative py-28 md:py-40">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <h1 className="text-4xl md:text-[56px] font-bold tracking-tight leading-[1.1] mb-6">
              Build Startups With Structure.{" "}
              <span className="text-gradient">Not Guesswork.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl">
              Product Nerve AI helps founders validate ideas, design execution plans, and build
              startups with clarity before writing a single line of code.
            </p>
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/signup">
                      <Button variant="hero" size="lg" className="gap-2">
                        Start Your First Project <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-foreground text-background text-xs max-w-[220px] text-center">
                    Create a workspace and build your venture blueprint
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/signup">
                      <Button variant="hero-outline" size="lg">
                        Validate Your First Idea
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-foreground text-background text-xs max-w-[220px] text-center">
                    Run your idea through our Venture Pressure Engine
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <p className="text-sm text-primary-foreground/40 mt-4">
              Free tools included. No credit card required.
            </p>
          </div>

          <div className="hidden md:block animate-fade-up-delay-2">
            <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur-sm p-6 shadow-2xl relative">
              {/* Stacked offset card behind */}
              <div className="absolute -top-3 -right-3 inset-0 rounded-2xl border border-primary-foreground/5 bg-primary-foreground/[0.02] -z-10" />
              <div className="absolute -top-6 -right-6 inset-0 rounded-2xl border border-primary-foreground/[0.03] bg-primary-foreground/[0.01] -z-20" />

              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-accent/60" />
                <div className="h-3 w-3 rounded-full bg-green-400/60" />
                <span className="text-xs text-primary-foreground/40 ml-2">Venture Dashboard</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Venture Score", value: "72", icon: Shield, color: "text-accent" },
                  { label: "Execution Blueprint", value: "64", icon: Zap, color: "text-primary-foreground/80" },
                  { label: "Growth Strategy", value: "58", icon: TrendingUp, color: "text-green-400/80" },
                  { label: "Studio Tools", value: "6", icon: Layers, color: "text-accent/80" },
                ].map(m => (
                  <div key={m.label} className="rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                      <span className="text-[10px] text-primary-foreground/50">{m.label}</span>
                    </div>
                    <p className="text-xl font-bold text-primary-foreground">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {[
                  { label: "Reality Pressure", value: 68 },
                  { label: "Market Environment", value: 74 },
                  { label: "Buyer Economics", value: 55 },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-[10px] text-primary-foreground/50 mb-1">
                      <span>{bar.label}</span>
                      <span>{bar.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-primary-foreground/10">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${bar.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-primary-foreground/10 flex items-center gap-2">
                <Rocket className="h-3.5 w-3.5 text-accent/70" />
                <span className="text-[10px] text-primary-foreground/40">Phase 1 of 3 Complete</span>
                <div className="ml-auto flex gap-1">
                  <div className="h-1.5 w-6 rounded-full bg-accent" />
                  <div className="h-1.5 w-6 rounded-full bg-primary-foreground/10" />
                  <div className="h-1.5 w-6 rounded-full bg-primary-foreground/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
