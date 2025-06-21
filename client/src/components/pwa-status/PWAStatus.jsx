import React from "react";
import { Wifi, WifiOff, Download } from "lucide-react";
import { usePWA } from "../../hooks/usePWA";

export const PWAStatus = ({ className = "" }) => {
  const { isInstalled } = usePWA();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Online/Offline Status */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" title="Online" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" title="Offline" />
        )}
      </div>

      {/* PWA Install Status */}
      {isInstalled && (
        <div className="flex items-center gap-1">
          <Download
            className="w-4 h-4 text-violet-500"
            title="Installed as PWA"
          />
        </div>
      )}
    </div>
  );
};
