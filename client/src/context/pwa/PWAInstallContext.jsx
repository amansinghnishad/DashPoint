import { useCallback, useEffect, useMemo, useState } from "react";

import { PWAInstallContext } from "./PWAInstallContext.js";

const getInstalledState = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.navigator.standalone === true ||
    document.referrer.includes("android-app://")
  );
};

const getIOSState = () => {
  if (typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)
  );
};

export function PWAInstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(getInstalledState);
  const [isIOSDevice, setIsIOSDevice] = useState(getIOSState);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    const displayMode = window.matchMedia?.("(display-mode: standalone)");
    const handleDisplayModeChange = (event) => setIsInstalled(event.matches);

    setIsInstalled(getInstalledState());
    setIsIOSDevice(getIOSState());
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    displayMode?.addEventListener?.("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      displayMode?.removeEventListener?.("change", handleDisplayModeChange);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;
    const promptEvent = deferredPrompt;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") setIsInstalled(true);
    return outcome === "accepted";
  }, [deferredPrompt]);

  const value = useMemo(
    () => ({
      isInstallable: Boolean(deferredPrompt),
      isInstalled,
      isIOSDevice,
      installApp,
    }),
    [deferredPrompt, installApp, isInstalled, isIOSDevice],
  );

  return <PWAInstallContext.Provider value={value}>{children}</PWAInstallContext.Provider>;
}
