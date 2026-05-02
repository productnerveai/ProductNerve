import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoMark from "@/assets/logo-mark.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { trackEvent, getAttributionData } from "@/lib/tracking";

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    setLoading(true);
    trackEvent('signup_started', { email });
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const { error } = await signUp(email, password, fullName, companyName.trim() || undefined);
    setLoading(false);
    
    if (error) {
      toast.error(error);
    } else {
      const attribution = getAttributionData();
      trackEvent('signup_completed', { email, ...attribution.first_touch });
      toast.success("Check your email to verify your account!");
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg mb-4">
            <img src={logoMark} alt="Product Nerve AI" className="h-8 w-8 rounded-lg" />
            Product Nerve AI
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start building with structure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">First Name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required maxLength={50} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Last Name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required maxLength={50} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Company Name</label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc." maxLength={100} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required maxLength={255} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
