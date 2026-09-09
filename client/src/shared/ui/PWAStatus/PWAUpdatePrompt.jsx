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
    <div className="fixed inset-x-4 bottom-4 z-[90] sm:inset-x-auto sm:left-1/2 sm:w-[min(36rem,calc(100vw-2rem))] sm:-translate-x-1/2">
      <div className="bg-surface-card border border-hairline text-ink flex w-full flex-col gap-4 rounded-2xl px-4 py-4 shadow-2xl backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">Update available</p>
          <p className="text-muted mt-1 text-xs leading-relaxed">
            Version {BUILD_INFO.version} is ready. Refresh to apply the update.
          </p>
        </div>

        <div className="flex shrink-0 justify-end gap-2 sm:justify-start">
          <button
            type="button"
            onClick={dismissUpdate}
            className="bg-transparent hover:bg-canvas-soft border border-hairline text-ink rounded-xl px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            type="button"
            onClick={updateApp}
            className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
