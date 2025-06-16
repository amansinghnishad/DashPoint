/**
 * Register form validation utilities
 */

export const validateForm = (formData) => {
  const newErrors = {};

  // Username validation
  if (!formData.username.trim()) {
    newErrors.username = "Username is required";
  } else if (formData.username.trim().length < 3) {
    newErrors.username = "Username must be at least 3 characters";
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    newErrors.username =
      "Username can only contain letters, numbers, and underscores";
  }

  // First name validation
  if (!formData.firstName.trim()) {
    newErrors.firstName = "First name is required";
  } else if (formData.firstName.trim().length < 2) {
    newErrors.firstName = "First name must be at least 2 characters";
  }

  // Last name validation
  if (!formData.lastName.trim()) {
    newErrors.lastName = "Last name is required";
  } else if (formData.lastName.trim().length < 2) {
    newErrors.lastName = "Last name must be at least 2 characters";
  }

  // Email validation
  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Please enter a valid email";
  }

  // Password validation
  if (!formData.password.trim()) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    newErrors.password =
      "Password must contain at least one lowercase letter, one uppercase letter, and one number";
  }

  // Confirm password validation
  if (!formData.confirmPassword.trim()) {
    newErrors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
  }

  return {
    errors: newErrors,
    isValid: Object.keys(newErrors).length === 0,
  };
};

/**
 * Process backend error response
 */
export const processBackendErrors = (result) => {
  if (result.details && Array.isArray(result.details)) {
    return result.details;
  } else if (typeof result.error === "string") {
    return [{ msg: result.error }];
  } else if (Array.isArray(result.error)) {
    return result.error;
  }
  return [];
};

/**
 * Format form data for submission
 */
export const formatFormData = (formData) => ({
  username: formData.username.trim(),
  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  email: formData.email.trim(),
  password: formData.password,
});
