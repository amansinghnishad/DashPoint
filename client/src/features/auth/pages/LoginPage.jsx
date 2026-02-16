import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes/paths";
import { Eye, EyeOff, Lock, Mail, Zap, Gift, Star } from "@/shared/ui/icons";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import { GoogleLogin } from "@react-oauth/google";

const isValidEmail = (value) => {
  const v = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

export default function Login() {
  const navigate = useNavigate();
  const { loginUser, loginWithGoogle, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    clearError?.();
  }, [clearError]);

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    if (!email.trim()) return "Email is required.";
    if (!isValidEmail(email)) return "Enter a valid email.";
    return null;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  }, [password, touched.password]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setTouched({ email: true, password: true });

    if (!email.trim() || !password) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      setFormError("Please enter a valid email.");
      return;
    }

    const result = await loginUser({ email: email.trim(), password });
    if (result?.success) {
      navigate(APP_ROUTES.DASHBOARD, { replace: true });
      return;
    }

    setFormError(result?.error || "Login failed.");
  };

  const labelClass = "text-white";
  const iconClass = "text-white/60";
  const fieldWrapClass =
    "border-white/10 bg-white/5 focus-within:ring-2 focus-within:ring-amber-300/30";
  const inputClass = "text-white placeholder-white/40";
  const subtleClass = "text-white/70";
  const linkClass = "text-white hover:text-amber-300";

  return (
    <AuthLayout
      pageTitle="Sign in"
      pageSubtitle="Welcome back. Access your DashPoint workspace."
      formTitle="Welcome back"
      formSubtitle="Sign in to your DashPoint account"
      asideTitle="Welcome back to DashPoint"
      asideDescription={
        "Sign in to access your personalized productivity dashboard. Everything is free during our launch - no subscriptions, no hidden fees."
      }
      asideItems={[
        {
          Icon: Gift,
          title: "Everything Free",
          description: "Access premium features at no cost during launch.",
        },
        {
          Icon: Zap,
          title: "Lightning Fast",
          description: "Optimized performance for instant productivity boosts.",
        },
        {
          Icon: Star,
          title: "Premium Experience",
          description: "A clean dashboard with focused productivity tools included.",
        },
      ]}
      asideFooterTitle="Launch benefits"
      asideFooterItems={[
        "- All premium features unlocked",
        "- No payment required",
        "- Early access advantage",
      ]}
      alert={
        formError || error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {formError || error}
          </div>
        ) : null
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label
            className={`text-sm font-medium ${labelClass}`}
            htmlFor="email"
          >
            Email address
          </label>
          <div
            className={`mt-2 flex items-center gap-2 rounded-2xl border px-3 py-2 ${fieldWrapClass}`}
          >
            <Mail size={16} className={iconClass} />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
              className={`w-full bg-transparent text-sm outline-none ${inputClass}`}
              placeholder="you@example.com"
            />
          </div>
          {emailError && (
            <p id="email-error" className="mt-2 text-xs text-red-200">
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label
            className={`text-sm font-medium ${labelClass}`}
            htmlFor="password"
          >
            Password
          </label>
          <div
            className={`mt-2 flex items-center gap-2 rounded-2xl border px-3 py-2 ${fieldWrapClass}`}
          >
            <Lock size={16} className={iconClass} />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : undefined}
              className={`w-full bg-transparent text-sm outline-none ${inputClass}`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg p-1 text-white/60 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="mt-2 text-xs text-red-200">
              {passwordError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className={`flex items-center gap-2 ${subtleClass}`}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded text-amber-300 focus:ring-amber-300 border-white/20 bg-white/5"
            />
            Remember me
          </label>

          <Link to={APP_ROUTES.REGISTER} className={`transition-colors ${linkClass}`}>
            New here?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="dp-btn-primary mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-white/50">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const cred = credentialResponse?.credential;
                if (!cred) {
                  setFormError("Google sign-in failed. Please try again.");
                  return;
                }

                const result = await loginWithGoogle?.(cred);
                if (result?.success) {
                  navigate(APP_ROUTES.DASHBOARD, { replace: true });
                } else {
                  setFormError(result?.error || "Google sign-in failed.");
                }
              }}
              onError={() =>
                setFormError("Google sign-in failed. Please try again.")
              }
              useOneTap
            />
          </div>
        ) : null}

        <p className={`text-center text-sm ${subtleClass}`}>
          Don't have an account?{" "}
          <Link to={APP_ROUTES.REGISTER} className={`font-semibold ${linkClass}`}>
            Create one free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
