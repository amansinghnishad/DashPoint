import Modal from "./Modal";
import { styleTheme } from "../theme/styleTheme";

export default function InfoModal({
  open,
  onClose,
  title,
  description,
  closeLabel = "Close",
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className={styleTheme.modal.footerActionsEnd}>
          <button
            type="button"
            onClick={onClose}
            className={styleTheme.button.primary}
          >
            {closeLabel}
          </button>
        </div>
      }
    >
      <div className={styleTheme.text.mutedSmall}>{children}</div>
    </Modal>
  );
}
