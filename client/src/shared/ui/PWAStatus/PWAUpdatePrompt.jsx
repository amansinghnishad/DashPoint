import { useEffect, useRef } from "react";

import { usePWAUpdates } from "../../../hooks/usePWAUpdates";
import { useToast } from "../../../hooks/useToast";
import { BUILD_INFO } from "../../config/buildInfo";

export default function PWAUpdatePrompt() {
  const { showUpdatePrompt, offlineReady, registrationError, updateApp, dismissUpdate } =
    usePWAUpdates();
  const toast = useToast();
  const hasShownOfflineReady = useRef(false);

  useEffect(() => {
    if (!offlineReady) return;
    if (hasShownOfflineReady.current) return;
    hasShownOfflineReady.current = true;
    toast.success("App is ready to use offline.");
  }, [offlineReady, toast]);

  useEffect(() => {
    if (registrationError) toast.error("Could not enable offline updates. Please reload later.");
  }, [registrationError, toast]);

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] sm:left-1/2 sm:right-auto sm:w-[calc(100vw-2rem)] sm:max-w-xl sm:-translate-x-1/2">
      <div className="dp-surface dp-border dp-text flex flex-col gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Update available</p>
          <p className="dp-text-muted text-pretty text-xs">
            Version {BUILD_INFO.version} is ready. Refresh to apply the update.
          </p>
        </div>

        <div className="flex shrink-0 justify-end gap-2">
          <button
            type="button"
            onClick={dismissUpdate}
            className="dp-btn-secondary rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
          >
            Later
          </button>
          <button
            type="button"
            onClick={updateApp}
            className="dp-btn-primary rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
