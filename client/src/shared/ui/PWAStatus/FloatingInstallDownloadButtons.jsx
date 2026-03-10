import { IconDownload } from "@/shared/ui/icons/icons";

import { usePWA } from "../../../hooks/usePWA";
import { useToast } from "../../../hooks/useToast";

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
        toast.info("On iPhone/iPad: tap Share -> Add to Home Screen to install.");
      } else {
        toast.info(
          "Install prompt isn't available yet. Use the browser menu (...) -> Install app. If you're on a non-HTTPS URL (or a network IP), install won't show until you deploy to HTTPS.",
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
          className="group dp-btn-primary inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl px-3 text-sm font-semibold transition-[width,background-color,color,box-shadow] duration-250 ease-out hover:w-40 focus-visible:w-40"
          aria-label="Download app"
          title="Download app"
        >
          <IconDownload size={16} className="shrink-0" />
          <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-250 ease-out group-hover:ml-2 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100">
            Download now
          </span>
        </button>
      </div>
    </div>
  );
}
