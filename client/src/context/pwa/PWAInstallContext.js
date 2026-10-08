import { createContext, useContext } from "react";

export const PWAInstallContext = createContext(null);

export function usePWAInstall() {
  const context = useContext(PWAInstallContext);
  if (!context) throw new Error("usePWA must be used within PWAInstallProvider");
  return context;
}
