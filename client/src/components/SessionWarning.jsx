import { useState, useEffect } from "react";
import { AlertTriangle, Clock, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const SessionWarning = () => {
  const { sessionWarning, extendSession, logoutUser } = useAuth();
  const [countdown, setCountdown] = useState(300); // 5 minutes

  useEffect(() => {
    if (sessionWarning) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            logoutUser();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sessionWarning, logoutUser]);

  const handleExtendSession = async () => {
    const success = await extendSession();
    if (success) {
      setCountdown(300); // Reset countdown
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!sessionWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Session Expiring Soon
            </h3>
            <p className="text-sm text-gray-600">
              Your session will expire in {formatTime(countdown)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <Clock size={16} />
            <span>
              You will be automatically logged out for security reasons.
            </span>
          </div>
          <p className="text-sm text-gray-700">
            Click "Stay Logged In" to extend your session, or "Logout" to logout
            now.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleExtendSession}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={logoutUser}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 300) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
