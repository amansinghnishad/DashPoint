import { Download } from "lucide-react";
import { usePWA } from "../../hooks/usePWA";
import { useToast } from "../../hooks/useToast";

export default function FloatingInstallDownloadButtons() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const toast = useToast();

  const isIOS = () => {
    if (typeof navigator === "undefined") return false;
    // iPadOS 13+ may report as Mac; touch points help distinguish.
    const ua = navigator.userAgent || "";
    const iOSDevice = /iPad|iPhone|iPod/i.test(ua);
    const iPadOS = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
    return iOSDevice || iPadOS;
  };

  const onClick = () => {
    if (isInstalled) {
      toast.info("DashPoint is already installed.");
      return;
    }

    if (!isInstallable) {
      if (isIOS()) {
        toast.info(
          "On iPhone/iPad: tap Share → Add to Home Screen to install."
        );
      } else {
        toast.info(
          "Install prompt isn’t available yet. Use the browser menu (⋯) → Install app. If you’re on a non-HTTPS URL (or a network IP), install won’t show until you deploy to HTTPS."
        );
      }
      return;
    }

    installApp();
  };

  // Keep the footprint small and avoid blocking content interactions.
  // Container is pointer-events-none; buttons re-enable pointer events.
  return (
    <div className="hidden lg:block fixed bottom-6 right-6 z-[60] pointer-events-none">
      <div className="pointer-events-auto dp-surface dp-border rounded-2xl border p-2 shadow-2xl backdrop-blur-sm">
        <button
          type="button"
          onClick={onClick}
          className="dp-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          <Download size={16} />
          Download app
        </button>
      </div>
    </div>
  );
}
