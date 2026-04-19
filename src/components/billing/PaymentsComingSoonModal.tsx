import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";

interface PaymentsComingSoonModalProps {
  onClose: () => void;
}

export default function PaymentsComingSoonModal({ onClose }: PaymentsComingSoonModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
            <Clock className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-xl font-bold">Payments Coming Soon</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Payments will be activated shortly. Start with the free plan while we finalize integration.
          </p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Continue with Free Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
