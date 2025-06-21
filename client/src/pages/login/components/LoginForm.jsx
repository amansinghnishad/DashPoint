import { Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Input, Button, ErrorDisplay } from "../../../components/ui";

export const LoginForm = ({
  formData,
  onInputChange,
  onSubmit,
  errors,
  isLoading,
  authError,
}) => {
  return (
    <div className="w-full lg:w-1/2 p-4 sm:p-8">
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Sign in to your DashPoint account
            </p>
          </div>

          {authError && (
            <div className="mb-4">
              <ErrorDisplay message={authError} />
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              error={errors.email}
              icon={<Mail size={16} />}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={onInputChange}
              error={errors.password}
              icon={<Lock size={16} />}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-purple-600 hover:text-purple-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-white/30">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
