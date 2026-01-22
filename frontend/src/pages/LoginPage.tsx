import { useState } from "react";
import { Shield, Lock, Eye, EyeOff, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignup = () => {
    navigate("/signup");
  };

  const onAdminPanel = () => {
    navigate("/admin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      /* 1️⃣ LOGIN */
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;
      if (!data.user) throw new Error("Login failed");

      /* 2️⃣ EMAIL VERIFICATION */
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error("Please verify your email first.");
      }

      /* 3️⃣ CHECK USER REQUEST STATUS */
const { data: request, error: requestError } = await supabase
  .from("user_request")
  .select("status, role")
  .eq("id", data.user.id)
  .maybeSingle();

if (requestError) throw requestError;

if (!request) {
  await supabase.auth.signOut();
  throw new Error("Your access request is pending admin approval.");
}

if (request.status === "pending") {
  await supabase.auth.signOut();
  throw new Error("Your account is awaiting admin approval.");
}

if (request.status === "rejected") {
  await supabase.auth.signOut();
  throw new Error("Your request was rejected.");
}

/* ✅ ROLE-BASED REDIRECT */
if (request.role === "admin") {
  navigate("/admin", { replace: true });
} else {
  navigate("/", { replace: true });
}

      /* 4️⃣ ENSURE PROFILE EXISTS */
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "User",
        });
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen surface-gradient flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl secure-gradient shadow-elevated mb-6 animate-shield-pulse">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">StegoSafe</h1>
          <p className="text-muted-foreground text-sm">
            Secure Steganographic Messaging
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Username or Email
              </label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your username or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="secure"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Login Securely
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Don't have an account?
            </p>
            <Button
              variant="outline"
              onClick={onSignup}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Request Access
            </Button>
          </div>

          {/* Helper Text */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p>
                All communications are protected using advanced steganographic
                techniques and end-to-end encryption.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by military-grade encryption
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
