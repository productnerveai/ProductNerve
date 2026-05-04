import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/tracking";
import logoMark from "@/assets/logo-mark.png";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "text-red-500";
    if (passwordStrength <= 4) return "text-yellow-500";
    return "text-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  const validatePassword = () => {
    const errors = [];
    if (password.length < 6) errors.push("at least 6 characters");
    if (password.length < 8) errors.push("8+ characters recommended");
    if (!/[A-Z]/.test(password)) errors.push("1 uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("1 lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("1 number");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("1 special character");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    const passwordErrors = validatePassword();
    if (passwordErrors.length > 2) {
      toast.error("Please strengthen your password. Include uppercase, lowercase, numbers, and special characters.");
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
      trackEvent('signup_completed', { email });
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
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <TooltipProvider>
                <Tooltip open={showPasswordTooltip} onOpenChange={setShowPasswordTooltip}>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-medium">Password Requirements:</p>
                      <ul className="text-xs space-y-1">
                        <li className={password.length >= 6 ? "text-green-600" : "text-red-600"}>
                          ✓ At least 6 characters
                        </li>
                        <li className={password.length >= 8 ? "text-green-600" : "text-muted-foreground"}>
                          ✓ 8+ characters (recommended)
                        </li>
                        <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          ✓ 1 uppercase letter (A-Z)
                        </li>
                        <li className={/[a-z]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          ✓ 1 lowercase letter (a-z)
                        </li>
                        <li className={/[0-9]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          ✓ 1 number (0-9)
                        </li>
                        <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          ✓ 1 special character (!@#$%^&*)
                        </li>
                      </ul>
                      {password && (
                        <div className="pt-2 border-t">
                          <p className="text-xs">
                            Strength: <span className={`font-medium ${getPasswordStrengthColor()}`}>
                              {getPasswordStrengthText()}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              minLength={6}
              onFocus={() => setShowPasswordTooltip(true)}
              onBlur={() => setShowPasswordTooltip(false)}
            />
            {password && (
              <div className="mt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength <= 2 ? 'bg-red-500' : 
                        passwordStrength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 6) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
              </div>
            )}
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
