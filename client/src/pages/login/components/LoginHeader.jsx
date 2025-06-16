import { Shield } from "lucide-react";

export const LoginHeader = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-8 py-4 sm:py-6 border-b border-blue-700">
      <div className="flex items-center space-x-3">
        <div className="bg-white/20 rounded-full p-2">
          <Shield className="text-white" size={20} sm:size={24} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            DashPoint
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm">
            Secure Access Portal
          </p>
        </div>
      </div>
    </div>
  );
};
