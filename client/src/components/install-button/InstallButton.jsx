import { Download, Smartphone } from "lucide-react";
import { Button } from "../ui";
import { usePWA } from "../../hooks/usePWA";

export const InstallButton = ({ className = "", compact = false }) => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  // Don't show the button if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={installApp}
      variant="primary"
      className={`
        inline-flex items-center gap-2
        bg-violet-600 hover:bg-violet-700 
        shadow-lg hover:shadow-xl
        ${className}
      `}
      title="Install DashPoint as an app"
    >
      <Download className="w-4 h-4" />
      {!compact && <span className="hidden sm:inline">Install App</span>}
      <Smartphone className={`w-4 h-4 sm:hidden ${compact ? "hidden" : ""}`} />
    </Button>
  );
};
