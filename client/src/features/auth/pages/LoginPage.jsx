import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes/paths";
import { Eye, EyeOff, Lock, Mail, Zap, Gift, Star } from "@/shared/ui/icons";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import { GoogleLogin } from "@react-oauth/google";
import useLoginFormState from "./useLoginFormState";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser, loginWithGoogle, loading, error, clearError } = useAuth();

  const {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    setShowPassword,
    touched,
    setTouched,
    formError,
    setFormError,
    emailError,
    passwordError,
    onSubmit,
  } = useLoginFormState({
    loginUser,
    navigate,
    dashboardRoute: APP_ROUTES.DASHBOARD,
  });

  useEffect(() => {
    clearError?.();
  }, [clearError]);

  const labelClass = "dp-text";
  const iconClass = "dp-text-subtle";
  const fieldWrapClass =
    "dp-border dp-surface-muted transition-all duration-200 focus-within:-translate-y-px focus-within:ring-2 focus-within:ring-white/20";
  const inputClass = "dp-text placeholder-white/40";
  const subtleClass = "dp-text-muted";
  const linkClass = "dp-text hover:opacity-80";

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
          description:
            "A clean dashboard with focused productivity tools included.",
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
          <div className="rounded-2xl border dp-danger px-4 py-3 text-sm">
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
            <p id="email-error" className="mt-2 text-xs dp-text-danger">
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
              className="inline-flex items-center justify-center rounded-lg p-1 dp-text-subtle transition duration-200 hover:opacity-80"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="mt-2 text-xs dp-text-danger">
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
              className="h-4 w-4 rounded dp-border dp-surface-muted"
            />
            Remember me
          </label>

          <Link
            to={APP_ROUTES.REGISTER}
            className={`transition-colors ${linkClass}`}
          >
            New here?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="dp-btn-primary mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 dp-border border-t" />
              <span className="text-xs dp-text-subtle">OR</span>
              <div className="h-px flex-1 dp-border border-t" />
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
          <Link
            to={APP_ROUTES.REGISTER}
            className={`font-semibold ${linkClass}`}
          >
            Create one free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
