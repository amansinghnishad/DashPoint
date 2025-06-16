import { Clock } from "lucide-react";

export const SessionWarningMessage = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <Clock size={16} />
        <span>You will be automatically logged out for security reasons.</span>
      </div>
      <p className="text-sm text-gray-700">
        Click "Stay Logged In" to extend your session, or "Logout" to logout
        now.
      </p>
    </div>
  );
};
