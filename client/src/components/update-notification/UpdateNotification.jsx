import React from "react";
import { RefreshCw, X, Download } from "lucide-react";
import { Button } from "../ui";
import { usePWAUpdates } from "../../hooks/usePWAUpdates";

export const UpdateNotification = () => {
  const { showUpdatePrompt, offlineReady, updateApp, dismissUpdate } =
    usePWAUpdates();

  if (!showUpdatePrompt && !offlineReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Update Available Notification */}
      {showUpdatePrompt && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 mb-2">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Update Available
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                A new version of DashPoint is available. Update now to get the
                latest features.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={updateApp}
                  variant="primary"
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Update Now
                </Button>
                <Button onClick={dismissUpdate} variant="secondary" size="sm">
                  Later
                </Button>
              </div>
            </div>
            <Button
              onClick={dismissUpdate}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      {/* Offline Ready Notification */}
      {offlineReady && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-green-900 dark:text-green-100">
                Ready for Offline Use
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                DashPoint is now available offline. You can use it even without
                an internet connection.
              </p>
            </div>
          </div>
        </div>
      )}{" "}
    </div>
  );
};
