import { Zap } from "lucide-react";

export const LoginHeader = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-4 sm:px-8 py-4 sm:py-6 border-b border-purple-700">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-yellow-400 to-pink-400 rounded-xl p-2">
          <Zap className="text-purple-900" size={20} sm:size={24} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Dash<span className="text-yellow-300">Point</span>
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm">
            Welcome Back - Everything's Free!
          </p>
        </div>
      </div>
    </div>
  );
};
