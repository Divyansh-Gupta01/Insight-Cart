import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
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

export default function AuthModal({ open, onClose, initialMode = "signin" }) {
  const nav = useNavigate();
  const [mode, setMode] = useState(initialMode); // 'signin' | 'register' | 'forgot_email' | 'forgot_otp' | 'forgot_newpass'
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
    if (open) setMode(initialMode);
  }, [open, initialMode]);

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
      onClose();
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
      onClose();
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
      if (res.otp_preview) {
        setOtpCode(res.otp_preview);
        toast.info(`Security verification code: ${res.otp_preview}`);
      }
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

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 text-left"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              {mode.startsWith("forgot") ? "SECURITY VERIFICATION" : "STORE ACCESS"}
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {mode === "signin" && "Sign In to Store"}
              {mode === "register" && "Create Store Account"}
              {mode === "forgot_email" && "Reset Store Password"}
              {mode === "forgot_otp" && "Enter 6-Digit Code"}
              {mode === "forgot_newpass" && "Set New Password"}
            </h3>
          </div>

          {/* Mode Switcher Tabs */}
          {!mode.startsWith("forgot") && (
            <div className="flex border-b border-slate-200 mb-6 gap-6">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`text-xs font-headline tracking-wider uppercase pb-2 transition-colors ${
                  mode === "signin"
                    ? "text-emerald-700 border-b-2 border-emerald-700 font-bold"
                    : "text-slate-400 hover:text-slate-700 font-semibold"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`text-xs font-headline tracking-wider uppercase pb-2 transition-colors ${
                  mode === "register"
                    ? "text-emerald-700 border-b-2 border-emerald-700 font-bold"
                    : "text-slate-400 hover:text-slate-700 font-semibold"
                }`}
              >
                New Store
              </button>
            </div>
          )}

          {/* 1. SIGN IN MODE */}
          {mode === "signin" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5 uppercase">
                  Username or Email
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="owner@store.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-600 uppercase">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(username.includes("@") ? username : "");
                      setMode("forgot_email");
                    }}
                    className="text-xs text-slate-500 hover:text-emerald-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>

              <button
                onClick={() => handleLogin(false)}
                disabled={loading}
                className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Continue to Store Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-mono text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                onClick={() => handleLogin(true)}
                disabled={loading}
                className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all"
              >
                <Sparkles className="w-4 h-4 text-lime-300" />
                <span>Instant Demo Access (1-Click)</span>
              </button>
            </div>
          )}

          {/* 2. REGISTER MODE */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1 uppercase">
                  Store / Business Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Royal Mart Supermarket"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1 uppercase">
                  Owner Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. store_manager"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@store.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1 uppercase">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all mt-2"
              >
                <span>Create Store &amp; Ingest Data</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD STEP 1: EMAIL */}
          {mode === "forgot_email" && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Enter your registered store email. We will dispatch a 6-digit security code to reset your password.
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5 uppercase">
                  Store Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="owner@store.com"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <span>Send 6-Digit Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMode("signin")}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </form>
          )}

          {/* 4. FORGOT PASSWORD STEP 2: 6-DIGIT OTP */}
          {mode === "forgot_otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                A 6-digit code has been dispatched to <strong className="text-slate-900">{resetEmail}</strong>.
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5 uppercase">
                  6-Digit Security Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center text-2xl font-mono tracking-[0.4em] text-emerald-700 font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Code expires in 10m</span>
                {otpTimer > 0 ? (
                  <span>Resend in {otpTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <span>Verify Security Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 5. FORGOT PASSWORD STEP 3: NEW PASSWORD */}
          {mode === "forgot_newpass" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Identity verified for <strong className="text-slate-900">{resetEmail}</strong>. Enter your new password:
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5 uppercase">
                  New Password (min. 4 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5 uppercase">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <span>Update Password &amp; Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
