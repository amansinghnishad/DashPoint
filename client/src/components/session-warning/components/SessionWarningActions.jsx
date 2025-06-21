import { Button } from "../../ui";

export const SessionWarningActions = ({ onExtendSession, onLogout }) => {
  return (
    <div className="flex space-x-3">
      <Button onClick={onExtendSession} variant="primary" className="flex-1">
        Stay Logged In
      </Button>
      <Button onClick={onLogout} variant="secondary" className="flex-1">
        Logout
      </Button>
    </div>
  );
};
