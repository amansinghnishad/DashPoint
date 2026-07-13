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
  onSettingsOpen,
  isDark,
  toggleTheme,
  logoutUser,
}) {
  const displayName = getSidebarDisplayName(user);

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
            <div className={`flex items-center w-full ${isExpanded ? "justify-between" : "justify-center"}`}>
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
                  <span className="font-waldenburg-light text-lg font-bold text-[#ffffff] tracking-tighter select-none">DP</span>
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
          </nav>

          {/* Bottom Profile & Actions */}
          <div className="px-3 border-t border-hairline/60 pt-4 space-y-3">
            {/* User Profile Card */}
            {isExpanded ? (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-canvas-soft border border-hairline/40">
                <div className="relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover border border-hairline"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate text-ink">{displayName}</p>
                  <p className="text-xs truncate text-muted-soft">{user?.email || "user@example.com"}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover border border-hairline"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                </div>
              </div>
            )}

            {/* Actions Stack */}
            <div className={`flex ${isExpanded ? "flex-row gap-1.5" : "flex-col gap-2 items-center"}`}>
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center justify-center rounded-xl text-muted hover:text-ink hover:bg-canvas-soft transition-all duration-200 ${
                  isExpanded ? "flex-1 py-2 px-2 gap-1.5 text-xs font-semibold border border-hairline/60" : "w-10 h-10"
                }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isExpanded ? <span>{isDark ? "Light" : "Dark"}</span> : null}
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={() => {
                  onSettingsOpen?.();
                  onClose?.();
                }}
                className={`flex items-center justify-center rounded-xl text-muted hover:text-ink hover:bg-canvas-soft transition-all duration-200 ${
                  isExpanded ? "flex-1 py-2 px-2 gap-1.5 text-xs font-semibold border border-hairline/60" : "w-10 h-10"
                }`}
                title="Settings"
              >
                <Settings size={18} />
                {isExpanded ? <span>Settings</span> : null}
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logoutUser}
                className={`flex items-center justify-center rounded-xl text-semantic-error hover:bg-semantic-error/10 transition-all duration-200 ${
                  isExpanded ? "py-2 px-2 gap-1.5 text-xs font-semibold border border-semantic-error/20" : "w-10 h-10"
                }`}
                title="Logout"
              >
                <LogOut size={18} />
                {isExpanded ? <span>Logout</span> : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
