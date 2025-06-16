import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../hooks/useToast";
import { validateLoginForm } from "../utils/validation";

export const useLoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { loginUser, error, clearError } = useAuth();
  const { success: showSuccessToast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(formData);
      if (result.success) {
        if (result.isFirstTimeUser) {
          showSuccessToast(
            "Welcome to DashPoint! Setting up your dashboard...",
            3000
          );
        } else {
          showSuccessToast("Welcome back! Redirecting to dashboard...", 3000);
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (err) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    errors,
    authError: error,
    handleInputChange,
    handleSubmit,
  };
};
