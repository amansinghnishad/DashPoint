import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Gift, Lock, Mail, Star, User, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../layouts/Auth/AuthLayout";

const isValidEmail = (value) => {
  const v = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

export default function Register() {
  const navigate = useNavigate();
  const { registerUser, loading, error, clearError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    clearError?.();
  }, [clearError]);

  const nameError = useMemo(() => {
    if (!touched.name) return null;
    if (!name.trim()) return "Name is required.";
    if (name.trim().length < 2) return "Name is too short.";
    return null;
  }, [name, touched.name]);

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

  const confirmError = useMemo(() => {
    if (!touched.confirmPassword) return null;
    if (!confirmPassword) return "Please confirm your password.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return null;
  }, [confirmPassword, password, touched.confirmPassword]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      setFormError("Please enter a valid email.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const result = await registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    if (result?.success) {
      navigate("/login", { replace: true });
      return;
    }

    setFormError(result?.error || "Registration failed.");
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
      pageTitle="Create account"
      pageSubtitle="Start using DashPoint in minutes."
      formTitle="Create your account"
      formSubtitle="No credit card required."
      asideTitle="Create your DashPoint account"
      asideDescription={
        "Get your productivity dashboard set up fast. During launch, everything is free — features included."
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
          description: "A clean dashboard with AI-powered tools included.",
        },
      ]}
      asideFooterTitle="What you get"
      asideFooterItems={[
        "• All premium features unlocked",
        "• No payment required",
        "• Early access advantage",
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
            <p id="name-error" className="mt-2 text-xs text-red-200">
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
              className="inline-flex items-center justify-center rounded-lg p-1 text-white/60 hover:text-white"
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
            <p id="confirm-error" className="mt-2 text-xs text-red-200">
              {confirmError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="dp-btn-primary mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating…" : "Create account"}
        </button>

        <p className={`text-center text-sm ${subtleClass}`}>
          Already have an account?{" "}
          <Link to="/login" className={`font-semibold ${linkClass}`}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
