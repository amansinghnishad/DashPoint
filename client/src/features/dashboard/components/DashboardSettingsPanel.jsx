import { Check, Clock3, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import Modal from "../../../shared/ui/modals/Modal";

function SectionHeading({ id, title, description }) {
  return (
    <div className="mb-5">
      <h2 id={id} className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}

export function AccountSettings({ user }) {
  const { updateProfile, changePassword } = useAuth();
  const firstName = String(user?.firstName || "");
  const lastName = String(user?.lastName || "");
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ firstName, lastName, username: String(user?.username || "") });
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordExpanded, setPasswordExpanded] = useState(false);
  const name = String([user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Your account").trim();
  const email = String(user?.email || "").trim();
  const initials = name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "DP";
  const signInMethod = user?.authProvider === "google" ? "Google" : "Email and password";
  const isGoogleAccount = user?.authProvider === "google";

  useEffect(() => {
    setProfile({ firstName, lastName, username: String(user?.username || "") });
  }, [firstName, lastName, user?.username]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSaving(true);
    const result = await updateProfile({
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      username: profile.username.trim(),
    });
    setProfileSaving(false);
    if (result.success) setEditing(false);
    else setProfileError(result.error);
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(passwords.newPassword)) {
      setPasswordError("Use at least 6 characters, including an uppercase letter, a lowercase letter, and a number.");
      return;
    }
    setPasswordSaving(true);
    const result = await changePassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
    setPasswordSaving(false);
    if (!result.success) setPasswordError(result.error);
  };

  const fieldClass = "mt-1.5 h-11 w-full rounded-xl border border-hairline bg-canvas px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <section aria-labelledby="account-heading">
      <SectionHeading
        id="account-heading"
        title="Profile and security"
        description="Review or update your profile and sign-in settings."
      />
      <div className="space-y-4">
        <div className="rounded-2xl border border-hairline bg-canvas p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{name}</p>
                <p className="mt-1 break-all text-sm text-muted">{email || "No email available"}</p>
              </div>
            </div>
            {!editing ? <button type="button" onClick={() => { setProfileError(""); setEditing(true); }} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-hairline bg-surface-card px-3 text-xs font-semibold text-ink transition hover:bg-canvas-soft">Edit profile</button> : null}
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="mt-5 border-t border-hairline pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-muted">First name<input autoComplete="given-name" required maxLength={50} value={profile.firstName} onChange={(event) => setProfile((current) => ({ ...current, firstName: event.target.value }))} className={fieldClass} /></label>
                <label className="text-xs font-medium text-muted">Last name<input autoComplete="family-name" required maxLength={50} value={profile.lastName} onChange={(event) => setProfile((current) => ({ ...current, lastName: event.target.value }))} className={fieldClass} /></label>
              </div>
              <label className="mt-3 block text-xs font-medium text-muted">Username<input autoComplete="username" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" value={profile.username} onChange={(event) => setProfile((current) => ({ ...current, username: event.target.value }))} className={fieldClass} aria-describedby="username-help" /></label>
              <p id="username-help" className="mt-1.5 text-xs text-muted-soft">3–30 characters: letters, numbers, and underscores.</p>
              {profileError ? <p role="alert" className="mt-3 text-sm text-semantic-error">{profileError}</p> : null}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => { setProfile({ firstName, lastName, username: String(user?.username || "") }); setEditing(false); setProfileError(""); }} className="h-10 rounded-xl px-4 text-sm font-medium text-muted transition hover:bg-canvas-soft hover:text-ink">Cancel</button>
                <button type="submit" disabled={profileSaving} className="h-10 rounded-xl bg-ink px-4 text-sm font-semibold text-canvas transition hover:opacity-90 disabled:opacity-50">{profileSaving ? "Saving…" : "Save changes"}</button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-hairline bg-canvas p-4">
            <p className="text-xs font-medium text-muted">Sign-in method</p>
            <p className="mt-2 text-sm font-semibold text-ink">{signInMethod}</p>
          </div>
          <div className="rounded-2xl border border-hairline bg-canvas p-4">
            <p className="text-xs font-medium text-muted">Email status</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
              {user?.isEmailVerified ? <Check size={15} className="text-emerald-600" /> : null}
              {user?.isEmailVerified ? "Verified" : "Not verified"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-canvas p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-card text-muted"><LockKeyhole size={17} /></span>
            <div>
              <h3 className="text-sm font-semibold text-ink">Password</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{isGoogleAccount ? "Your password is managed by Google." : "Update the password used to sign in."}</p>
              </div>
            </div>
            {!isGoogleAccount ? (
              <button
                type="button"
                onClick={() => { setPasswordExpanded((expanded) => !expanded); setPasswordError(""); }}
                className="shrink-0 rounded-xl border border-hairline bg-surface-card px-3 py-2 text-xs font-semibold text-ink transition hover:bg-canvas-soft"
              >
                {passwordExpanded ? "Cancel" : "Change password"}
              </button>
            ) : null}
          </div>
          {isGoogleAccount ? (
            <p className="mt-3 rounded-xl bg-surface-card px-3 py-2.5 text-xs text-muted">Password changes are managed in your Google account.</p>
          ) : passwordExpanded ? (
            <form onSubmit={savePassword} className="space-y-3">
              <label className="block text-xs font-medium text-muted">Current password<input autoComplete="current-password" type="password" required value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} className={fieldClass} /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-muted">New password<input autoComplete="new-password" type="password" required value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} className={fieldClass} /></label>
                <label className="block text-xs font-medium text-muted">Confirm new password<input autoComplete="new-password" type="password" required value={passwords.confirmPassword} onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))} className={fieldClass} /></label>
              </div>
              {passwordError ? <p role="alert" className="text-sm text-semantic-error">{passwordError}</p> : null}
              <div className="flex justify-end pt-1">
                <button type="submit" disabled={passwordSaving} className="h-10 rounded-xl bg-ink px-4 text-sm font-semibold text-canvas transition hover:opacity-90 disabled:opacity-50">{passwordSaving ? "Updating…" : "Update password"}</button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-hairline p-4">
          <Clock3 size={17} className="shrink-0 text-muted-soft" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Connected accounts & active sessions</p>
            <p className="mt-1 text-xs text-muted">Manage linked sign-in methods and devices.</p>
          </div>
          <span className="shrink-0 rounded-full bg-canvas-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">Coming soon</span>
        </div>
      </div>
    </section>
  );
}

function ShortcutSettings({ groups }) {
  return (
    <section aria-labelledby="shortcuts-heading">
      <SectionHeading
        id="shortcuts-heading"
        title="Keyboard shortcuts"
        description="Quick ways to move around DashPoint. On Mac, use ⌘; on Windows or Linux, use Ctrl."
      />
      <div className="max-h-[min(52vh,30rem)] space-y-4 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-soft">{group.title}</h3>
            <div className="overflow-hidden rounded-2xl border border-hairline bg-canvas">
              {group.items.map((item) => (
                <div
                  key={`${group.title}-${item.description}`}
                  className="flex min-h-12 items-center justify-between gap-3 border-b border-hairline px-3 py-2.5 last:border-b-0 sm:px-4"
                >
                  <span className="text-sm text-ink">{item.description}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {item.keys.map((key) => (
                      <kbd key={`${item.description}-${key}`} className="min-w-7 rounded-md border border-hairline bg-surface-card px-1.5 py-1 text-center text-[11px] font-medium text-muted">
                        {key}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DashboardSettingsPanel({ open, onClose, shortcutGroups }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      description="Keyboard shortcuts for moving around DashPoint."
      size="lg"
      closeLabel="Close settings"
    >
      <ShortcutSettings groups={shortcutGroups} />
    </Modal>
  );
}
