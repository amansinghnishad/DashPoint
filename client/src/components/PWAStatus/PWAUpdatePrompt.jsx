import { useEffect, useRef } from "react";
import { usePWAUpdates } from "../../hooks/usePWAUpdates";
import { useToast } from "../../hooks/useToast";

export default function PWAUpdatePrompt() {
  const { showUpdatePrompt, offlineReady, updateApp, dismissUpdate } =
    usePWAUpdates();
  const toast = useToast();
  const hasShownOfflineReady = useRef(false);

  useEffect(() => {
    if (!offlineReady) return;
    if (hasShownOfflineReady.current) return;
    hasShownOfflineReady.current = true;
    toast.success("App is ready to use offline.");
  }, [offlineReady, toast]);

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
      <div className="dp-surface dp-border dp-text flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-sm">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Update available</p>
          <p className="dp-text-muted text-xs">
            Refresh to get the latest version.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
