import { Settings, UserRoundCog } from "lucide-react";
import { useEffect, useState } from "react";

import { AccountSettings } from "./DashboardSettingsPanel";
import { useAuth } from "../../../context/AuthContext";
import Modal from "../../../shared/ui/modals/Modal";

function getAccountName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    "Your account"
  );
}

export default function DashboardAccountDialog({ open, onClose, onSettingsOpen }) {
  const { user } = useAuth();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const name = getAccountName(user);
  const initials =
    name
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DP";

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  return (
    <>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[89] cursor-default"
            aria-label="Close account menu"
            onClick={onClose}
          />
          <div
            role="dialog"
            aria-label="Account menu"
            className="fixed bottom-20 left-3 z-[90] w-[min(17rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-hairline bg-surface-card p-1.5 shadow-2xl lg:left-[4.75rem]"
          >
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2.5">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-bold text-primary">
                {initials}
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="absolute h-9 w-9 rounded-full object-cover"
                    onError={(event) => event.currentTarget.remove()}
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">{name}</span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {user?.email || "No email available"}
                </span>
              </span>
            </div>

            <div className="my-1 border-t border-hairline" />
            <button
              type="button"
              onClick={() => {
                onClose?.();
                setEditProfileOpen(true);
              }}
              className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-ink transition hover:bg-canvas-soft"
            >
              <UserRoundCog size={17} className="text-muted" />
              Edit profile
            </button>
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onSettingsOpen?.();
              }}
              className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-ink transition hover:bg-canvas-soft"
            >
              <Settings size={17} className="text-muted" />
              Settings
            </button>
          </div>
        </>
      ) : null}

      <Modal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Edit profile"
        description="Update your profile and sign-in details."
        size="md"
        closeLabel="Close profile settings"
      >
        <AccountSettings user={user} />
      </Modal>
    </>
  );
}
