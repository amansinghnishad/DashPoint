import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export const usePWAUpdates = () => {
  const wasDismissed = () => {
    try {
      return sessionStorage.getItem("dashpoint-update-dismissed") === "true";
    } catch {
      return false;
    }
  };

  const [showUpdatePrompt, setShowUpdatePrompt] = useState(() => {
    return !wasDismissed();
  });
  const [registrationError, setRegistrationError] = useState(null);

  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.error("SW registration error", error);
      setRegistrationError(error instanceof Error ? error.message : String(error));
    },
  });

  useEffect(() => {
    if (needRefresh && !wasDismissed()) {
      setShowUpdatePrompt(true);
    }
  }, [needRefresh]);

  const updateApp = () => {
    updateServiceWorker(true);
    setShowUpdatePrompt(false);
  };

  const dismissUpdate = () => {
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
    try {
      sessionStorage.setItem("dashpoint-update-dismissed", "true");
    } catch {
      // Session storage can be unavailable in privacy-restricted browsers.
    }
  };

  return {
    showUpdatePrompt,
    offlineReady,
    registrationError,
    updateApp,
    dismissUpdate,
  };
};
