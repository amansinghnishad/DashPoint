import { Link } from "react-router-dom";

import {
  IconClose,
  IconDownload,
  LogOut,
  Settings,
  Sun,
  Moon,
} from "@/shared/ui/icons/icons";

const getSidebarDisplayName = (user) => {
  const username = String(user?.username || "").trim();
  if (username) return username;

  const explicitName = String(user?.name || "").trim();
  if (explicitName) return explicitName;

  const fullName = [user?.firstName, user?.lastName]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");
  if (fullName) return fullName;

  const email = String(user?.email || "").trim();
  if (email) return email.split("@")[0];

  return "User";
};

const getSidebarInitials = (user) =>
  getSidebarDisplayName(user)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "DP";

export default function SideBarView({
  isOpen,
  onClose,
  setIsHovered,
  isExpanded,
  menuItems,
  activeTab,
  setActiveTab,
  onInstallClick,
  user,
  onAccountOpen,
  onSettingsOpen,
  isDark,
  toggleTheme,
  logoutUser,
  isInstalled,
}) {
  const displayName = getSidebarDisplayName(user);
  const initials = getSidebarInitials(user);

  return (
    <>
      {/* Mobile drawer overlay */}
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-[84] lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 h-full transform transition-all duration-300 ease-in-out z-[85] \
          ${isOpen ? "translate-x-0" : "-translate-x-full"} \
          lg:translate-x-0 \
          bg-canvas border-r border-hairline \
          ${isExpanded ? "w-60 shadow-xl" : "w-16"}`}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full py-4">
          {/* Top Logo Icon */}
          <div className="px-4 mb-8 flex items-center justify-center relative">
            <div
              className={`flex items-center w-full ${isExpanded ? "justify-between" : "justify-center"}`}
            >
              {isExpanded ? (
                <Link
                  to="/"
                  className="font-waldenburg-light text-xl font-bold text-ink tracking-tight select-none"
                  onClick={onClose}
                >
                  DASHPOINT
                </Link>
              ) : (
                <Link
                  to="/"
                  className="w-10 h-10 rounded-xl bg-[#0c0a09] flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
                  onClick={onClose}
                >
                  <span className="font-waldenburg-light text-lg font-bold text-[#ffffff] tracking-tighter select-none">
                    DP
                  </span>
                </Link>
              )}

              {isOpen ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="lg:hidden p-1.5 rounded-full hover:bg-canvas-soft text-ink"
                  aria-label="Close sidebar"
                >
                  <IconClose size={18} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              const btnClass = isActive
                ? "bg-ink text-canvas shadow-sm font-semibold"
                : "text-muted hover:text-ink hover:bg-canvas-soft";

              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab?.(item.id);
                      onClose?.();
                    }}
                    className={`flex items-center rounded-xl transition-all duration-200 ${
                      isExpanded
                        ? "w-full px-4 py-3 gap-3 justify-start text-sm font-medium"
                        : "mx-auto w-10 h-10 justify-center"
                    } ${btnClass}`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon size={20} />
                    {isExpanded ? <span>{item.label}</span> : null}
                  </button>
                </div>
              );
            })}

            {/* Install PWA Option (Mobile Only) */}
            {!isInstalled ? (
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={onInstallClick}
                  className={`w-full flex items-center rounded-xl transition-all duration-200 px-4 py-3 gap-3 justify-start text-sm font-medium text-muted hover:text-ink hover:bg-canvas-soft`}
                >
                  <IconDownload size={20} />
                  <span>Download app</span>
                </button>
              </div>
            ) : null}
          </nav>

          {/* Account and preferences */}
          <div className="border-t border-hairline/60 px-3 pt-4">
            <div className={`flex items-center ${isExpanded ? "flex-row justify-center gap-1.5" : "flex-col items-center gap-2"}`}>
              {/* Account Button */}
              <button
                type="button"
                onClick={() => {
                  onAccountOpen?.();
                  onClose?.();
                }}
                className="group inline-flex h-10 w-10 items-center justify-start overflow-hidden whitespace-nowrap rounded-xl border border-hairline/60 px-2.5 text-muted transition-[width,background-color,color] duration-300 ease-out hover:w-28 hover:bg-canvas-soft hover:text-ink focus-visible:w-28 focus-visible:bg-canvas-soft focus-visible:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Account"
                aria-label={`Account for ${displayName}`}
              >
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {initials}
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="absolute inset-0 h-full w-full rounded-full object-cover"
                      onError={(event) => event.currentTarget.remove()}
                    />
                  ) : null}
                </span>
                <span className="ml-0 max-w-0 overflow-hidden text-xs font-semibold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-16 group-focus-visible:opacity-100">Account</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`group inline-flex h-10 w-10 items-center justify-start overflow-hidden whitespace-nowrap rounded-xl border border-hairline/60 px-3 text-muted transition-[width,background-color,color] duration-300 ease-out hover:bg-canvas-soft hover:text-ink focus-visible:bg-canvas-soft focus-visible:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isExpanded ? "hover:w-24 focus-visible:w-24" : "hover:w-28 focus-visible:w-28"}`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
                <span className="ml-0 max-w-0 overflow-hidden text-xs font-semibold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-16 group-focus-visible:opacity-100">{isDark ? "Light" : "Dark"}</span>
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={() => {
                  onSettingsOpen?.();
                  onClose?.();
                }}
                className={`group inline-flex h-10 w-10 items-center justify-start overflow-hidden whitespace-nowrap rounded-xl border border-hairline/60 px-3 text-muted transition-[width,background-color,color] duration-300 ease-out hover:bg-canvas-soft hover:text-ink focus-visible:bg-canvas-soft focus-visible:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isExpanded ? "hover:w-28 focus-visible:w-28" : "hover:w-32 focus-visible:w-32"}`}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={18} className="shrink-0" />
                <span className="ml-0 max-w-0 overflow-hidden text-xs font-semibold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-20 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-20 group-focus-visible:opacity-100">Settings</span>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logoutUser}
                className={`group inline-flex h-10 w-10 items-center justify-start overflow-hidden whitespace-nowrap rounded-xl border border-semantic-error/20 px-3 text-semantic-error transition-[width,background-color,color] duration-300 ease-out hover:bg-semantic-error/10 focus-visible:bg-semantic-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-error ${isExpanded ? "hover:w-24 focus-visible:w-24" : "hover:w-28 focus-visible:w-28"}`}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={18} className="shrink-0" />
                <span className="ml-0 max-w-0 overflow-hidden text-xs font-semibold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-16 group-focus-visible:opacity-100">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
