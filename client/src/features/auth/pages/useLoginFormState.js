import { useCallback, useMemo, useState } from "react";

const isValidEmail = (value) => {
  const v = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

export default function useLoginFormState({ loginUser, navigate, dashboardRoute }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState(null);

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

  const onSubmit = useCallback(async (e) => {
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
      navigate(dashboardRoute, { replace: true });
      return;
    }

    setFormError(result?.error || "Login failed.");
  }, [dashboardRoute, email, loginUser, navigate, password]);

  return {
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
  };
}
