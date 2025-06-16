import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { DEFAULT_SESSION_COUNTDOWN } from "../utils/sessionHelpers";

/**
 * Custom hook for session warning functionality
 */
export const useSessionWarning = () => {
  const { sessionWarning, extendSession, logoutUser } = useAuth();
  const [countdown, setCountdown] = useState(DEFAULT_SESSION_COUNTDOWN);

  // Countdown timer effect
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

  // Handle extending the session
  const handleExtendSession = async () => {
    const success = await extendSession();
    if (success) {
      setCountdown(DEFAULT_SESSION_COUNTDOWN); // Reset countdown
    }
    return success;
  };

  // Handle logout
  const handleLogout = () => {
    logoutUser();
  };

  return {
    sessionWarning,
    countdown,
    handleExtendSession,
    handleLogout
  };
};
