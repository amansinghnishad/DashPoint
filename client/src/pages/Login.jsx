import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { loginUser, error, clearError } = useAuth();
  const { success: showSuccessToast } = useToast();

  // handleInputChange function
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

  // validateForm function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }; // handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DashPoint</h1>
              <p className="text-blue-100 text-sm">Secure Access Portal</p>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left Panel - Information */}
          <div className="w-1/2 bg-gray-50 p-8 border-r border-gray-200">
            <div className="h-full flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Sign In to Continue
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Access your personalized dashboard with secure
                    authentication. All data is encrypted and protected
                    according to industry standards.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Secure Authentication
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your credentials are protected with enterprise-grade
                        encryption
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Data Privacy
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your personal information remains private and secure
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Session Management
                      </h3>
                      <p className="text-sm text-gray-600">
                        Automatic session timeout for enhanced security
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="w-1/2 p-8">
            <div className="h-full flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Sign In
                  </h2>
                  <p className="text-gray-600">
                    Enter your credentials to access your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your email address"
                        disabled={isLoading}
                      />
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.password
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your password"
                        disabled={isLoading}
                      />
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* General Error */}
                  {(error || errors.general) && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        <p className="text-sm text-red-700 font-medium">
                          {error || errors.general}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <LogIn size={20} />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>© 2025 DashPoint. All rights reserved.</p>
            <p>Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
