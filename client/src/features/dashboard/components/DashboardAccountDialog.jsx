import { AccountSettings } from "./DashboardSettingsPanel";
import { useAuth } from "../../../context/AuthContext";
import Modal from "../../../shared/ui/modals/Modal";

export default function DashboardAccountDialog({ open, onClose }) {
  const { user } = useAuth();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Your account"
      description="Manage your profile, sign-in method, and password."
      size="lg"
      closeLabel="Close account"
    >
      <AccountSettings user={user} />
    </Modal>
  );
}
