import { UserPlus } from "lucide-react";

export const RegisterHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
        <UserPlus className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
      <p className="text-gray-600 mt-2">
        Join us to start managing your dashboard
      </p>
    </div>
  );
};
