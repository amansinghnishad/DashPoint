import {
  LoginHeader,
  LoginInfoPanel,
  LoginForm,
  LoginFooter,
} from "./components";
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
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
  );
};
