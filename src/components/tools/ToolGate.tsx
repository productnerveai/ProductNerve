import { Badge } from "@/components/ui/badge";

interface ToolGateProps {
  toolName: string;
  children: React.ReactNode;
}

export default function ToolGate({ toolName, children }: ToolGateProps) {
  // Simplified ToolGate - always grants access for demo purposes
  // In a real app, this would check subscription plans and usage limits
  
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          Demo Mode: Full Access
        </Badge>
        <Badge variant="outline" className="text-xs">
          All Features Unlocked
        </Badge>
      </div>
      {children}
    </div>
  );
}
