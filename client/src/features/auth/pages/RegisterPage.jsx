import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes/paths";
import {
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  Star,
  User,
  Zap,
} from "@/shared/ui/icons";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import { GoogleLogin } from "@react-oauth/google";
import useRegisterFormState from "./useRegisterFormState";

export default function Register() {
  const navigate = useNavigate();
  const { registerUser, loginWithGoogle, loading, error, clearError } =
    useAuth();

  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    touched,
    setTouched,
    formError,
    setFormError,
    nameError,
    emailError,
    passwordError,
    confirmError,
    onSubmit,
  } = useRegisterFormState({
    registerUser,
    navigate,
    loginRoute: APP_ROUTES.LOGIN,
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
      pageTitle="Create account"
      pageSubtitle="Start using DashPoint in minutes."
      formTitle="Create your account"
      formSubtitle="No credit card required."
      asideTitle="Create your DashPoint account"
      asideDescription={
        "Get your productivity dashboard set up fast. During launch, everything is free - features included."
      }
      asideItems={[
        {
          Icon: Gift,
          title: "Everything Free",
          description: "All premium features unlocked during launch.",
        },
        {
          Icon: Zap,
          title: "Fast Setup",
          description: "Create your account and get going in minutes.",
        },
        {
          Icon: Star,
          title: "Premium Experience",
          description:
            "A clean dashboard with focused productivity tools included.",
        },
      ]}
      asideFooterTitle="What you get"
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
          <label className={`text-sm font-medium ${labelClass}`} htmlFor="name">
            Name
          </label>
          <div
            className={`mt-2 flex items-center gap-2 rounded-2xl border px-3 py-2 ${fieldWrapClass}`}
          >
            <User size={16} className={iconClass} />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "name-error" : undefined}
              className={`w-full bg-transparent text-sm outline-none ${inputClass}`}
              placeholder="Your name"
            />
          </div>
          {nameError && (
            <p id="name-error" className="mt-2 text-xs dp-text-danger">
              {nameError}
            </p>
          )}
        </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : undefined}
              className={`w-full bg-transparent text-sm outline-none ${inputClass}`}
              placeholder="Create a password"
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

        <div>
          <label
            className={`text-sm font-medium ${labelClass}`}
            htmlFor="confirmPassword"
          >
            Confirm password
          </label>
          <div
            className={`mt-2 flex items-center gap-2 rounded-2xl border px-3 py-2 ${fieldWrapClass}`}
          >
            <Lock size={16} className={iconClass} />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() =>
                setTouched((t) => ({ ...t, confirmPassword: true }))
              }
              aria-invalid={Boolean(confirmError)}
              aria-describedby={confirmError ? "confirm-error" : undefined}
              className={`w-full bg-transparent text-sm outline-none ${inputClass}`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg p-1 dp-text-subtle transition duration-200 hover:opacity-80"
              aria-label={
                showConfirmPassword
                  ? "Hide password confirmation"
                  : "Show password confirmation"
              }
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirmError && (
            <p id="confirm-error" className="mt-2 text-xs dp-text-danger">
              {confirmError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="dp-btn-primary mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create account"}
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
                  setFormError("Google sign-up failed. Please try again.");
                  return;
                }

                const result = await loginWithGoogle?.(cred);
                if (result?.success) {
                  navigate(APP_ROUTES.DASHBOARD, { replace: true });
                } else {
                  setFormError(result?.error || "Google sign-up failed.");
                }
              }}
              onError={() =>
                setFormError("Google sign-up failed. Please try again.")
              }
            />
          </div>
        ) : null}

        <p className={`text-center text-sm ${subtleClass}`}>
          Already have an account?{" "}
          <Link to={APP_ROUTES.LOGIN} className={`font-semibold ${linkClass}`}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
