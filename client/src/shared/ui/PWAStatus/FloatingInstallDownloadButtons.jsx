import { IconDownload } from "@/shared/ui/icons/icons";

import { getPwaInstallHelp } from "../../../context/pwa/installHelp.js";
import { usePWA } from "../../../hooks/usePWA";
import { useToast } from "../../../hooks/useToast";

export default function FloatingInstallDownloadButtons() {
  const { isInstallable, isInstalled, isIOSDevice, installApp } = usePWA();
  const toast = useToast();

  if (isInstalled) return null;

  const onClick = () => {
    if (isInstalled) {
      toast.info("DashPoint is already installed.");
      return;
    }

    if (!isInstallable) {
      toast.info(getPwaInstallHelp(isIOSDevice));
      return;
    }

    installApp();
  };

  // Keep the footprint small and avoid blocking content interactions.
  // Container is pointer-events-none; buttons re-enable pointer events.
  return (
    <div className="fixed bottom-4 right-4 z-[60] pointer-events-none sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto rounded-2xl border border-hairline bg-surface-card p-1.5 shadow-2xl backdrop-blur-sm sm:p-2">
        <button
          type="button"
          onClick={onClick}
          className="group inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-ink px-3 text-sm font-semibold text-canvas transition-[width,background-color,color,box-shadow] duration-250 ease-out hover:bg-neutral-900 hover:w-40 focus-visible:w-40 cursor-pointer"
          aria-label="Install DashPoint"
          title="Install DashPoint"
        >
          <IconDownload size={16} className="shrink-0" />
          <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-250 ease-out group-hover:ml-2 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100">
            Install app
          </span>
        </button>
      </div>
    </div>
  );
}
