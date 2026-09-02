import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Store,
  Lock,
  Mail,
  User as UserIcon,
  KeyRound,
  ShieldCheck,
  Clock,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  login as apiLogin,
  register as apiRegister,
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPasswordWithToken,
} from "@/lib/api";

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState("signin"); // 'signin' | 'register' | 'forgot_email' | 'forgot_otp' | 'forgot_newpass'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password & OTP state
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleLogin = async (demo = false) => {
    setLoading(true);
    try {
      const res = await apiLogin(
        demo ? "demo" : username || "demo",
        demo ? "demo" : password || "demo",
        true,
        demo,
      );
      localStorage.setItem("ci_token", res.token);
      localStorage.setItem("ci_user", JSON.stringify(res.user));
      toast.success(demo ? "Instant demo unlocked" : `Welcome back, ${res.user?.store_name || res.user?.username}`);
      nav("/dashboard");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Sign-in failed. Check credentials or try Instant Access.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim() || !email.trim()) {
      toast.error("Please fill in username, email, and password");
      return;
    }
    setLoading(true);
    try {
      const res = await apiRegister(
        username.trim(),
        email.trim(),
        password.trim(),
        storeName.trim() || "My Supermarket"
      );
      localStorage.setItem("ci_token", res.token);
      localStorage.setItem("ci_user", JSON.stringify(res.user));
      toast.success(`Store account created! Welcome to ${res.user?.store_name}`);
      nav("/dashboard");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Step 1: Send OTP to email
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      toast.error("Please enter a valid store email address");
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordResetOTP(resetEmail.trim());
      toast.success(res.message || "6-digit verification code dispatched");
      setOtpTimer(60);
      setMode("forgot_otp");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // OTP Step 2: Verify 6-digit OTP code
  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyPasswordResetOTP(resetEmail.trim(), otpCode.trim());
      setResetToken(res.reset_token);
      toast.success("Security code verified! Set your new password.");
      setMode("forgot_newpass");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  // OTP Step 3: Set new password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPasswordWithToken(resetToken, newPassword);
      toast.success(res.message || "Password updated successfully!");
      setMode("signin");
      setPassword(newPassword);
      setUsername(resetEmail);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,255,58,0.35), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.15), transparent 60%)",
        }}
      />

      {/* Top brand strip */}
      <div className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full accent-bg dot-pulse" />
          <div className="text-[11px] tracking-[0.28em] uppercase text-[color:var(--ink-muted)]">
            Insight Cart
          </div>
        </div>
        <div className="text-[11px] tracking-[0.28em] uppercase text-[color:var(--ink-dim)] hidden sm:block">
          Retail Intelligence Platform · v2.0
        </div>
      </div>

      {/* Editorial split */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 px-8 lg:px-16 pt-8 lg:pt-16 pb-16">
        {/* Left: editorial statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="lg:col-span-7 flex flex-col justify-center"
        >
          <div className="metadata-label mb-6">
            Retail intelligence — reimagined
          </div>
          <h1 className="editorial-headline text-6xl sm:text-7xl lg:text-[7.5rem]">
            Your retail,
            <br />
            <span className="italic text-[color:var(--accent)]">
              understood.
            </span>
          </h1>
          <p className="mt-8 text-[color:var(--ink-2)] text-lg max-w-md leading-relaxed">
            Turn daily sales and inventory into clear decisions. 7-day demand forecasting,
            automatic morning restock planning, and profit margin intelligence.
          </p>

          <div className="hair-divider mt-14 max-w-md" />
          <div className="mt-6 grid grid-cols-3 gap-8 max-w-md">
            {[
              { k: "Forecasting", v: "7-Day AI" },
              { k: "Restock Alerts", v: "Automated" },
              { k: "Live Ingestion", v: "POS & CSV" },
            ].map((s) => (
              <div key={s.k}>
                <div className="metadata-label">{s.k}</div>
                <div className="mt-2 font-editorial text-2xl">{s.v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: login / register / OTP panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          className="lg:col-span-5 flex items-center"
        >
          <div className="surface-elev p-8 sm:p-10 w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="metadata-label">
                  {mode.startsWith("forgot") ? "Security Verification" : "Store Access"}
                </div>
                <div className="mt-1 font-editorial text-3xl">
                  {mode === "signin" && "Sign In"}
                  {mode === "register" && "Create Store"}
                  {mode === "forgot_email" && "Reset Password"}
                  {mode === "forgot_otp" && "Enter Security Code"}
                  {mode === "forgot_newpass" && "Set New Password"}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border hairline-strong flex items-center justify-center">
                {mode.startsWith("forgot") ? (
                  <ShieldCheck className="w-4 h-4 text-[color:var(--accent)]" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full accent-bg" />
                )}
              </div>
            </div>

            {/* Mode Switcher Tabs (Only visible in signin / register) */}
            {!mode.startsWith("forgot") && (
              <div className="flex border-b hairline-strong mb-6 pb-2 gap-6">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`text-xs uppercase tracking-wider pb-1 transition-colors ${
                    mode === "signin"
                      ? "text-[color:var(--accent)] border-b-2 border-[color:var(--accent)] font-medium"
                      : "text-[color:var(--ink-dim)] hover:text-[color:var(--ink)]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`text-xs uppercase tracking-wider pb-1 transition-colors ${
                    mode === "register"
                      ? "text-[color:var(--accent)] border-b-2 border-[color:var(--accent)] font-medium"
                      : "text-[color:var(--ink-dim)] hover:text-[color:var(--ink)]"
                  }`}
                >
                  New Store Account
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* 1. SIGN IN MODE */}
              {mode === "signin" && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="username" className="metadata-label block mb-2">
                      Username or Email
                    </label>
                    <input
                      id="username"
                      data-testid="login-username-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="owner@store.com"
                      className="w-full bg-transparent border-b hairline-strong pb-3 text-lg text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="metadata-label">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(username.includes("@") ? username : "");
                          setMode("forgot_email");
                        }}
                        className="text-xs text-[color:var(--ink-muted)] hover:text-[color:var(--accent)] transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="password"
                      data-testid="login-password-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-b hairline-strong pb-3 text-lg text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                    />
                  </div>

                  <button
                    data-testid="login-submit-btn"
                    onClick={() => handleLogin(false)}
                    disabled={loading}
                    className="btn-ghost w-full h-12 mt-6 justify-between"
                  >
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-[color:var(--hairline-strong)]" />
                    <span className="metadata-label">or</span>
                    <div className="flex-1 h-px bg-[color:var(--hairline-strong)]" />
                  </div>

                  <button
                    data-testid="login-demo-btn"
                    onClick={() => handleLogin(true)}
                    disabled={loading}
                    className="btn-primary w-full h-12 justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Instant Demo Access
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="mt-4 text-center text-xs text-[color:var(--ink-muted)]">
                    New store?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="text-[color:var(--accent)] hover:underline ml-1"
                    >
                      Create account
                    </button>
                  </p>
                </motion.div>
              )}

              {/* 2. REGISTER MODE */}
              {mode === "register" && (
                <motion.form
                  key="register"
                  onSubmit={handleRegister}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="metadata-label block mb-2">Store / Business Name</label>
                    <div className="relative">
                      <Store className="w-4 h-4 absolute left-0 top-3 text-[color:var(--ink-dim)]" />
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Royal Mart Supermarket"
                        className="w-full bg-transparent border-b hairline-strong pl-6 pb-2 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="metadata-label block mb-2">Owner Username</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-0 top-3 text-[color:var(--ink-dim)]" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. store_manager"
                        required
                        className="w-full bg-transparent border-b hairline-strong pl-6 pb-2 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="metadata-label block mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-0 top-3 text-[color:var(--ink-dim)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@supermarket.com"
                        required
                        className="w-full bg-transparent border-b hairline-strong pl-6 pb-2 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="metadata-label block mb-2">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-0 top-3 text-[color:var(--ink-dim)]" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent border-b hairline-strong pl-6 pb-2 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full h-12 mt-4 justify-between"
                  >
                    <span>Create Store & Ingest Data</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="mt-4 text-center text-xs text-[color:var(--ink-muted)]">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-[color:var(--accent)] hover:underline ml-1"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}

              {/* 3. FORGOT PASSWORD STEP 1: EMAIL */}
              {mode === "forgot_email" && (
                <motion.form
                  key="forgot_email"
                  onSubmit={handleRequestOTP}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <p className="text-xs text-[color:var(--ink-muted)] leading-relaxed">
                    Enter the email associated with your store account. We will dispatch a 6-digit verification code to reset your password.
                  </p>

                  <div>
                    <label className="metadata-label block mb-2">Store Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-0 top-3 text-[color:var(--ink-dim)]" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="owner@store.com"
                        required
                        autoFocus
                        className="w-full bg-transparent border-b hairline-strong pl-6 pb-2 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full h-12 mt-4 justify-between"
                  >
                    <span>Send 6-Digit Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="btn-ghost w-full h-10 text-xs justify-center gap-2 text-[color:var(--ink-muted)]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </motion.form>
              )}

              {/* 4. FORGOT PASSWORD STEP 2: 6-DIGIT OTP */}
              {mode === "forgot_otp" && (
                <motion.form
                  key="forgot_otp"
                  onSubmit={handleVerifyOTP}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <p className="text-xs text-[color:var(--ink-muted)] leading-relaxed">
                    A 6-digit verification code has been dispatched to{" "}
                    <strong className="text-[color:var(--ink)]">{resetEmail}</strong>. Valid for 10 minutes.
                  </p>

                  <div>
                    <label className="metadata-label block mb-2">6-Digit Security Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      required
                      autoFocus
                      className="w-full bg-black/40 border hairline-strong rounded-2xl p-4 text-center text-3xl font-mono tracking-[0.4em] text-[color:var(--accent)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[color:var(--ink-dim)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[color:var(--accent)]" /> Code expires in 10m
                    </span>
                    {otpTimer > 0 ? (
                      <span>Resend in {otpTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOTP}
                        className="text-[color:var(--accent)] hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="btn-primary w-full h-12 mt-4 justify-between"
                  >
                    <span>Verify Security Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("forgot_email")}
                    className="btn-ghost w-full h-10 text-xs justify-center gap-2 text-[color:var(--ink-muted)]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change Email
                  </button>
                </motion.form>
              )}

              {/* 5. FORGOT PASSWORD STEP 3: NEW PASSWORD */}
              {mode === "forgot_newpass" && (
                <motion.form
                  key="forgot_newpass"
                  onSubmit={handleResetPassword}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-xs text-[color:var(--ink-muted)] leading-relaxed">
                    Identity verified for <strong className="text-[color:var(--ink)]">{resetEmail}</strong>. Enter your new password below:
                  </p>

                  <div>
                    <label className="metadata-label block mb-2">New Store Password</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-0 top-3 text-[color:var(--ink-dim)]" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min. 4 chars)"
                        required
                        autoFocus
                        className="w-full bg-transparent border-b hairline-strong pl-6 pb-2 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="metadata-label block mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-0 top-3 text-[color:var(--ink-dim)]" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        required
                        className="w-full bg-transparent border-b hairline-strong pl-6 pb-2 text-base text-[color:var(--ink)] placeholder:text-[color:var(--ink-dim)] focus:outline-none focus:border-[color:var(--accent)] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full h-12 mt-4 justify-between"
                  >
                    <span>Update Password & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="btn-ghost w-full h-10 text-xs justify-center gap-2 text-[color:var(--ink-muted)]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 text-xs text-[color:var(--ink-dim)] leading-relaxed">
              Multi-Store Intelligence · Real-Time Stockout Prevention · Automated Restock Planning.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom marquee */}
      <div className="relative z-10 border-t hairline px-8 lg:px-16 py-6 flex items-center justify-between text-[color:var(--ink-dim)] text-xs tracking-[0.22em] uppercase">
        <span>Store Intelligence · Demand Forecasting · Automated Restock</span>
        <span className="hidden sm:block">© Insight Cart</span>
      </div>
    </div>
  );
}
