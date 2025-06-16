import { useState } from "react";
import { Mail, Lock, User, Shield, FileText, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FormInput } from "./components/FormInput";
import { ErrorDisplay } from "./components/ErrorDisplay";
import {
  validateForm,
  processBackendErrors,
  formatFormData,
} from "./utils/validation";

export const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState([]);
  const { registerUser, error, clearError } = useAuth();
  const navigate = useNavigate();

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

    // Clear backend errors
    if (backendErrors.length > 0) {
      setBackendErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setIsLoading(true);
    setBackendErrors([]);

    try {
      const result = await registerUser(formatFormData(formData));
      if (result.success) {
        // Redirect to login page after successful registration
        navigate("/login");
      } else {
        console.error("Registration failed:", result);
        setBackendErrors(processBackendErrors(result));
      }
    } catch (err) {
      // Error is handled by AuthContext
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-8 py-4 sm:py-6 border-b border-green-700">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <FileText className="text-white" size={20} sm:size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                DashPoint
              </h1>
              <p className="text-green-100 text-xs sm:text-sm">
                Account Registration Form
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row">
          {" "}
          {/* Left Panel - Information */}
          <div className="hidden lg:block lg:w-1/2 bg-gray-50 p-4 sm:p-8 border-r border-gray-200">
            <div className="h-full flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Create Your Account
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Join DashPoint to access your personalized productivity
                    dashboard. All information is securely encrypted and
                    protected.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Account Benefits
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center">
                      <CheckCircle className="text-blue-600 mr-2" size={16} />
                      Personalized dashboard with your preferences
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-blue-600 mr-2" size={16} />
                      Secure cloud storage for all your data
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-blue-600 mr-2" size={16} />
                      Access from any device, anywhere
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-blue-600 mr-2" size={16} />
                      Regular feature updates and improvements
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="text-green-500 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Data Security
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your personal information is protected with bank-level
                        encryption
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Privacy First
                      </h3>
                      <p className="text-sm text-gray-600">
                        We never share your data with third parties
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Free Account
                      </h3>
                      <p className="text-sm text-gray-600">
                        No hidden fees or subscription required
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Right Panel - Registration Form */}
          <div className="w-full lg:w-1/2 p-4 sm:p-8">
            <div className="h-full flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Registration
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Fill out the form below to create your account
                  </p>
                </div>
                <ErrorDisplay error={error} backendErrors={backendErrors} />{" "}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormInput
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={errors.firstName}
                      icon={User}
                      autoComplete="given-name"
                      required
                      compact
                    />

                    <FormInput
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={errors.lastName}
                      icon={User}
                      autoComplete="family-name"
                      required
                      compact
                    />
                  </div>
                  <FormInput
                    id="username"
                    name="username"
                    label="Username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleInputChange}
                    error={errors.username}
                    icon={User}
                    autoComplete="username"
                    required
                    compact
                  />
                  <FormInput
                    id="email"
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    icon={Mail}
                    autoComplete="email"
                    required
                    compact
                  />
                  <FormInput
                    id="password"
                    name="password"
                    label="Password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    icon={Lock}
                    autoComplete="new-password"
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    required
                    compact
                  />
                  <FormInput
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    icon={Lock}
                    autoComplete="new-password"
                    showPasswordToggle
                    showPassword={showConfirmPassword}
                    onTogglePassword={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    required
                    compact
                  />{" "}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>
                <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-green-600 hover:text-green-500 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-8 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
            <p>© 2025 DashPoint. All rights reserved.</p>
            <p>Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
