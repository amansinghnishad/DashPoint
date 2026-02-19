import { useCallback, useMemo, useState } from "react";

const isValidEmail = (value) => {
  const v = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

export default function useRegisterFormState({ registerUser, navigate, onError, loginRoute }) {
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

  const onSubmit = useCallback(async (e) => {
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
      navigate(loginRoute, { replace: true });
      return;
    }

    const message = result?.error || "Registration failed.";
    setFormError(message);
    onError?.(message);
  }, [
    confirmPassword,
    email,
    loginRoute,
    name,
    navigate,
    onError,
    password,
    registerUser,
  ]);

  return {
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
  };
}
