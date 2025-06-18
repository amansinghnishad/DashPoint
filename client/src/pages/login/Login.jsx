import {
  LoginHeader,
  LoginInfoPanel,
  LoginForm,
  LoginFooter,
} from "./components";
import { Navigation } from "../landing/components/Navigation";
import { Footer } from "../landing/components/Footer";
import { useLoginForm } from "./hooks/useLoginForm";

export const Login = () => {
  const {
    formData,
    isLoading,
    errors,
    authError,
    handleInputChange,
    handleSubmit,
  } = useLoginForm();
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
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/50 overflow-hidden">
          <LoginHeader />

          <div className="flex flex-col lg:flex-row">
            <LoginInfoPanel />
            <LoginForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              errors={errors}
              isLoading={isLoading}
              authError={authError}
            />
          </div>

          <LoginFooter />
        </div>
      </div>
      <Footer />
    </div>
  );
};
