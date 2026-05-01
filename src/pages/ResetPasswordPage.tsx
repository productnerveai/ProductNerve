import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from URL query params or hash
    const urlToken = searchParams.get('token');
    const hash = window.location.hash;
    
    if (urlToken) {
      setToken(urlToken);
      setValidSession(true);
    } else if (hash.includes("type=recovery")) {
      // Extract token from hash for Supabase compatibility
      const tokenMatch = hash.match(/access_token=([^&]+)/);
      if (tokenMatch) {
        setToken(tokenMatch[1]);
        setValidSession(true);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid reset session");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(token, password);
    setLoading(false);
    
    if (error) {
      toast.error(error);
    } else {
      navigate("/login");
    }
  };

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid or expired link</h1>
          <p className="text-sm text-muted-foreground mb-4">Please request a new password reset.</p>
          <Link to="/forgot-password">
            <Button variant="outline">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Set new password</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Choose a strong password for your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" required minLength={6} />
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required minLength={6} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
