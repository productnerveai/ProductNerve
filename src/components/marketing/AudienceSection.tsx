import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Users, Target, Zap, BarChart3 } from "lucide-react";

const audiences = [
  { icon: Rocket, label: "Early-stage founders" },
  { icon: Users, label: "Startup teams" },
  { icon: Target, label: "Venture studios" },
  { icon: Zap, label: "Accelerators" },
  { icon: BarChart3, label: "Corporate innovation teams" },
];

export default function AudienceSection() {
  return (
    <section className="py-28 bg-muted/30">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Built For</h2>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {audiences.map(({ icon: Icon, label }) => (
            <div key={label} className="glass-card rounded-xl px-6 py-4 flex items-center gap-3">
              <Icon className="h-5 w-5 text-accent" />
              <span className="font-medium text-sm">{label}</span>
            </div>
          ))}
        </div>
        <Link to="/signup">
          <Button variant="outline">Get Started</Button>
        </Link>
      </div>
    </section>
  );
}
