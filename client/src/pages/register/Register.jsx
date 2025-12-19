import { useState } from "react";
import { Mail, Lock, User, Zap, Gift, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Navigation } from "../landing/components/Navigation";
import { Footer } from "../landing/components/Footer";
import { Input, Button, ErrorList } from "../../components/ui";
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

  const [_showPassword, _setShowPassword] = useState(false);
  const [_showConfirmPassword, _setShowConfirmPassword] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {" "}
      {/* Background Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-blue-200/40 rounded-full blur-lg animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute bottom-40 left-20 w-20 h-20 bg-indigo-200/50 rounded-full blur-md animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-28 h-28 bg-purple-300/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-yellow-200/30 to-pink-200/30 rounded-lg transform rotate-45 blur-sm animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-gradient-to-r from-green-200/40 to-cyan-200/40 rounded-full blur-sm animate-bounce"
          style={{ animationDuration: "4s" }}
        ></div>

        {/* Additional floating elements for register page */}
        <div
          className="absolute top-60 left-1/3 w-8 h-8 bg-gradient-to-r from-indigo-200/40 to-purple-200/40 rounded-full blur-sm animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute top-80 right-1/3 w-6 h-6 bg-gradient-to-r from-pink-200/50 to-yellow-200/50 rounded-full blur-sm animate-bounce"
          style={{ animationDuration: "5s" }}
        ></div>

        {/* Background pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>
      <Navigation />
      <div className="relative z-10 pt-24 pb-8 px-2 sm:px-4">
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-4 sm:px-8 py-4 sm:py-6 border-b border-purple-700">
            <div className="flex items-center space-x-3">
              <img
                src="/logo-vertical.png"
                alt="DashPoint Logo"
                className="h-16"
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row">
            {" "}
            {/* Left Panel - Information */}
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-purple-100/70 via-blue-100/70 to-indigo-100/70 backdrop-blur-sm p-4 sm:p-8 border-r border-white/30">
              <div className="h-full flex flex-col justify-center">
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      <Gift className="mr-2" size={16} />
                      Launch Special - Everything Free!
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Create Your Free Account
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Join DashPoint and unlock your complete productivity
                      dashboard. All premium features are completely free during
                      our launch phase - no credit card required, no hidden
                      fees!
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border border-purple-200">
                    <h3 className="font-medium text-purple-900 mb-2">
                      🎉 What You Get Free
                    </h3>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li className="flex items-center">
                        <CheckCircle
                          className="text-purple-600 mr-2"
                          size={16}
                        />
                        AI-powered content extraction & organization
                      </li>
                      <li className="flex items-center">
                        <CheckCircle
                          className="text-purple-600 mr-2"
                          size={16}
                        />
                        Advanced task management & sticky notes
                      </li>
                      <li className="flex items-center">
                        <CheckCircle
                          className="text-purple-600 mr-2"
                          size={16}
                        />
                        Real-time widgets & customizable dashboard
                      </li>
                      <li className="flex items-center">
                        <CheckCircle
                          className="text-purple-600 mr-2"
                          size={16}
                        />
                        Cross-platform access & secure cloud storage
                      </li>
                    </ul>
                  </div>{" "}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Zap className="text-yellow-500 mt-0.5" size={20} />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Lightning Fast Setup
                        </h3>
                        <p className="text-sm text-gray-600">
                          Get started in under 60 seconds with instant access
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle
                        className="text-green-500 mt-0.5"
                        size={20}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Privacy Protected
                        </h3>
                        <p className="text-sm text-gray-600">
                          Enterprise-grade security with no data sharing
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Gift className="text-purple-500 mt-0.5" size={20} />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Launch Special
                        </h3>
                        <p className="text-sm text-gray-600">
                          Early users get lifetime benefits & priority support
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
                  {" "}
                  <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      Join DashPoint Free
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Create your account and start boosting productivity
                    </p>
                  </div>{" "}
                  <ErrorList errors={backendErrors} />
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {" "}
                      <Input
                        label="First Name"
                        placeholder="First name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        error={errors.firstName}
                        icon={<User size={16} />}
                        required
                      />
                      <Input
                        label="Last Name"
                        placeholder="Last name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        error={errors.lastName}
                        icon={<User size={16} />}
                        required
                      />
                    </div>{" "}
                    <Input
                      label="Username"
                      placeholder="Choose a username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      error={errors.username}
                      icon={<User size={16} />}
                      required
                    />{" "}
                    <Input
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      icon={<Mail size={16} />}
                      required
                    />{" "}
                    <Input
                      type="password"
                      label="Password"
                      placeholder="Create a password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      icon={<Lock size={16} />}
                      required
                    />
                    <Input
                      type="password"
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={errors.confirmPassword}
                      icon={<Lock size={16} />}
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      loading={isLoading}
                      className="w-full"
                      size="lg"
                    >
                      Join DashPoint Free
                    </Button>
                  </form>
                  <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/30">
                    {" "}
                    <p className="text-xs sm:text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
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
          <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 backdrop-blur-sm px-4 sm:px-8 py-3 sm:py-4 border-t border-white/30">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
              <p>© 2025 DashPoint. All rights reserved.</p>
              <p>Version 1.0</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
