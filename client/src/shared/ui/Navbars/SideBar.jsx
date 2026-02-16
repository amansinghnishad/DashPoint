import {
  IconClose,
  IconDownload,
  IconUpload,
  // Bell,
  CalendarDays,
  Home,
  // Keyboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Youtube,
} from "@/shared/ui/icons";
import { useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import useTheme from "../../../hooks/useTheme";
import { usePWA } from "../../../hooks/usePWA";
import { useToast } from "../../../hooks/useToast";

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

  const menuItems = useMemo(
    () => [
      { id: "collections", label: "Home", icon: Home },
      { id: "calendar", label: "Calendar", icon: CalendarDays },
      { id: "youtube", label: "YouTube", icon: Youtube },
      { id: "files", label: "File Manager", icon: IconUpload },
    ],
    []
  );

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

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 dp-overlay backdrop-blur-sm z-[84] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      ) : null}

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 h-full transform transition-all duration-300 ease-in-out z-[85] \
					${isOpen ? "translate-x-0" : "-translate-x-full"} \
					lg:translate-x-0 \
					border-r ${subBorderClass} dp-sidebar-surface backdrop-blur-sm shadow-2xl \
					${isExpanded ? "w-64" : "w-64 lg:w-16"}`}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          <div
            className={`p-4 border-b ${subBorderClass} transition-colors duration-200`}
          >
            <div
              className={`flex items-center ${
                isExpanded ? "justify-between" : "justify-center"
              }`}
            >
              <img
                src={isExpanded ? fullLogoSrc : "/logo.png"}
                alt="DashPoint"
                className={`transition-all duration-200 object-contain ${
                  isExpanded ? "h-12 w-auto" : "h-10 w-10"
                }`}
              />
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 dp-hover-bg dp-text-muted dp-hover-text"
                aria-label="Close sidebar"
              >
                <IconClose size={20} />
              </button>
            </div>
          </div>

          <nav
            className={`flex-1 overflow-y-auto scrollable-area ${
              isExpanded ? "p-4" : "p-2"
            }`}
          >
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab?.(item.id);
                        onClose?.();
                      }}
                      className={`w-full flex items-center rounded-xl transition-all duration-200 relative \
												${isActive ? "dp-sidebar-item-active" : itemBaseClass} \
												${
                          isExpanded
                            ? "space-x-3 px-4 py-3 text-left"
                            : "px-0 py-0 lg:mx-auto lg:w-12 lg:h-12 lg:justify-center"
                        }`}
                      title={!isExpanded ? item.label : undefined}
                    >
                      <Icon size={20} />
                      <span
                        className={`font-medium transition-all duration-200 ${
                          isExpanded
                            ? "opacity-100"
                            : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                        }`}
                      >
                        {item.label}
                      </span>

                      {isActive && isExpanded ? (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full" />
                      ) : null}
                    </button>
                  </li>
                );
              })}

              <li className="lg:hidden">
                <button
                  type="button"
                  onClick={onInstallClick}
                  className={`w-full flex items-center rounded-xl transition-all duration-200 relative ${itemBaseClass} space-x-3 px-4 py-3 text-left`}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl dp-hover-bg">
                    <IconDownload size={18} className={mutedTextClass} />
                  </span>
                  <span className="text-sm font-medium">Download app</span>
                </button>
              </li>
            </ul>

            <div
              className={`${
                isExpanded ? "mt-6 pt-4 border-t" : "mt-3 pt-2"
              } border-t dp-border transition-colors duration-200`}
            >
              {/* <button
                type="button"
                onClick={() => {
                  onNotificationsOpen?.();
                  onClose?.();
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 mb-2 ${itemBaseClass} ${
                  isExpanded
                    ? "space-x-3"
                    : "px-0 py-0 lg:mx-auto lg:w-12 lg:h-12 lg:justify-center"
                }`}
                title={!isExpanded ? "Notifications" : undefined}
              >
                <Bell size={20} />
                <span
                  className={`font-medium transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100"
                      : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  }`}
                >
                  Notifications
                </span>
              </button> */}

              {/* <button
                type="button"
                onClick={() => {
                  onShortcutsOpen?.();
                  onClose?.();
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${itemBaseClass} ${
                  isExpanded
                    ? "space-x-3"
                    : "px-0 py-0 lg:mx-auto lg:w-12 lg:h-12 lg:justify-center"
                }`}
                title={!isExpanded ? "Keyboard Shortcuts" : undefined}
              >
                <Keyboard size={20} />
                <span
                  className={`font-medium transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100"
                      : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  }`}
                >
                  Keyboard Shortcuts
                </span>
              </button> */}
            </div>
          </nav>

          <div
            className={`${
              isExpanded ? "p-4" : "p-3"
            } border-t ${subBorderClass} transition-colors duration-200`}
          >
            <div
              className={`flex items-center mb-4 p-3 rounded-xl transition-all duration-200 dp-surface ${
                isExpanded ? "space-x-3" : "mb-3 lg:justify-center"
              }`}
              title={
                !isExpanded ? user?.name || user?.email || "User" : undefined
              }
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg dp-btn-hero">
                  <User size={20} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 dp-border-bg dp-status-online" />
              </div>
              <div
                className={`flex-1 min-w-0 transition-all duration-200 ${
                  isExpanded
                    ? "opacity-100"
                    : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                }`}
              >
                <p className="font-medium truncate dp-text">
                  {user?.name || "User"}
                </p>
                <p className={`text-sm truncate ${mutedTextClass}`}>
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div
                className={`flex ${
                  isExpanded
                    ? "space-x-2"
                    : "lg:flex-col lg:space-x-0 lg:space-y-2"
                }`}
              >
                {isExpanded ? (
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center justify-center p-2 rounded-lg transition-all duration-200 dp-surface dp-hover-bg dp-text-muted dp-hover-text"
                    title={
                      isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                    }
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    onSettingsOpen?.();
                    onClose?.();
                  }}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 dp-surface dp-hover-bg dp-text-muted dp-hover-text ${
                    isExpanded
                      ? "space-x-2"
                      : "lg:flex-initial lg:w-10 lg:h-10 lg:px-0 lg:py-0"
                  }`}
                  title={!isExpanded ? "Settings" : undefined}
                >
                  <Settings size={16} />
                  <span
                    className={`text-sm font-medium transition-all duration-200 ${
                      isExpanded
                        ? "opacity-100"
                        : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                    }`}
                  >
                    Settings
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={logoutUser}
                className={`dp-danger border flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isExpanded
                    ? "w-full"
                    : "lg:w-10 lg:h-10 lg:mx-auto lg:px-0 lg:py-0"
                }`}
                title={!isExpanded ? "Logout" : undefined}
              >
                <LogOut size={16} />
                <span
                  className={`text-sm font-medium transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100"
                      : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                  }`}
                >
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default SideBar;
