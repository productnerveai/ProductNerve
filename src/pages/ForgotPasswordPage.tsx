import { useState } from "react";
import { Link } from "react-router-dom";
import logoMark from "@/assets/logo-mark.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  // const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // const { error } = await resetPassword(email);
    setLoading(false);
    // if (error) {
    //   toast.error(error.message);
    // } else {
    //   setSent(true);
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg mb-8">
          <img src={logoMark} alt="Product Nerve AI" className="h-8 w-8 rounded-lg" />
          Product Nerve AI
        </Link>

        {sent ? (
          <div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-sm text-muted-foreground mb-6">We've sent a password reset link to {email}</p>
            <Link to="/login">
              <Button variant="outline" className="w-full">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
            <p className="text-sm text-muted-foreground mb-6">Enter your email to receive a reset link</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground mt-4 inline-block">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
