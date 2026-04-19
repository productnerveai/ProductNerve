import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section className="hero-gradient text-primary-foreground py-24 md:py-32">
      <div className="container max-w-3xl text-center">
        <h2 className="text-3xl md:text-[44px] font-bold leading-tight mb-4 animate-fade-up">
          Your Startup Idea Deserves More Than Guesswork.
        </h2>
        <p className="text-lg text-primary-foreground/60 mb-10 animate-fade-up-delay-1">
          Start building with structure.
        </p>
        <div className="animate-fade-up-delay-2">
          <Link to="/signup">
            <Button variant="hero" size="lg" className="gap-2">
              Start Your Venture Blueprint <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
