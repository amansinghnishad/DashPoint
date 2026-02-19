import { CalendarDays, Home, IconUpload, Youtube } from "@/shared/ui/icons";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import useTheme from "../../../hooks/useTheme";
import { usePWA } from "../../../hooks/usePWA";
import { useToast } from "../../../hooks/useToast";
import SideBarView from "./SideBarView";

export const SideBar = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  // onNotificationsOpen,
  onSettingsOpen,
  // onShortcutsOpen,
}) => {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const toast = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = Boolean(isOpen || isHovered);
  const isDark = theme === "dark";
  const fullLogoSrc = isDark ? "/Dark-mode-logo.png" : "/Light-mode-logo.png";

  const menuItems = [
    { id: "collections", label: "Home", icon: Home },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "files", label: "File Manager", icon: IconUpload },
  ];

  const itemBaseClass = "dp-text-muted dp-hover-bg dp-hover-text";
  const subBorderClass = "dp-border";
  const mutedTextClass = "dp-text-muted";

  const isIOS = () => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const iOSDevice = /iPad|iPhone|iPod/i.test(ua);
    const iPadOS = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
    return iOSDevice || iPadOS;
  };

  const onInstallClick = () => {
    if (isInstalled) {
      toast.info("DashPoint is already installed.");
      return;
    }

    if (!isInstallable) {
      if (isIOS()) {
        toast.info(
          "On iPhone/iPad: tap Share → Add to Home Screen to install.",
        );
      } else {
        toast.info(
          "Install prompt isn’t available yet. Use the browser menu (⋯) → Install app. If you’re on a non-HTTPS URL (or a network IP), install won’t show until you deploy to HTTPS.",
        );
      }
      return;
    }

    installApp();
  };

  return (
    <SideBarView
      isOpen={isOpen}
      onClose={onClose}
      setIsHovered={setIsHovered}
      isExpanded={isExpanded}
      subBorderClass={subBorderClass}
      fullLogoSrc={fullLogoSrc}
      menuItems={menuItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      itemBaseClass={itemBaseClass}
      onInstallClick={onInstallClick}
      mutedTextClass={mutedTextClass}
      user={user}
      onSettingsOpen={onSettingsOpen}
      isDark={isDark}
      toggleTheme={toggleTheme}
      logoutUser={logoutUser}
    />
  );
};
