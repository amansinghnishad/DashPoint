import { SessionWarningHeader } from "./components/SessionWarningHeader";
import { SessionWarningMessage } from "./components/SessionWarningMessage";
import { SessionWarningActions } from "./components/SessionWarningActions";
import { SessionProgressBar } from "./components/SessionProgressBar";
import { useSessionWarning } from "./hooks/useSessionWarning";

export const SessionWarning = () => {
  const { sessionWarning, countdown, handleExtendSession, handleLogout } =
    useSessionWarning();

  if (!sessionWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <SessionWarningHeader countdown={countdown} />

        <SessionWarningMessage />

        <SessionWarningActions
          onExtendSession={handleExtendSession}
          onLogout={handleLogout}
        />

        <SessionProgressBar countdown={countdown} />
      </div>
    </div>
  );
};
