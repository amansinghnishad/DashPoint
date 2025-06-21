import { Modal } from "../ui";
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
    <Modal
      isOpen={sessionWarning}
      onClose={() => {}} // Don't allow closing by clicking outside
      title=""
      size="sm"
      showCloseButton={false}
    >
      <div className="space-y-4">
        <SessionWarningHeader countdown={countdown} />

        <SessionWarningMessage />

        <SessionWarningActions
          onExtendSession={handleExtendSession}
          onLogout={handleLogout}
        />

        <SessionProgressBar countdown={countdown} />
      </div>
    </Modal>
  );
};
