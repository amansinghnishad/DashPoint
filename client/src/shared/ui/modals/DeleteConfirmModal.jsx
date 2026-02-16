import { useCallback, useMemo } from "react";

import { styleTheme } from "../theme/styleTheme";
import Modal from "./Modal";

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  busy = false,
}) {
  const modalTitle = useMemo(() => title || "Confirm delete", [title]);
  const modalDescription = useMemo(
    () => description || "Are you sure you want to delete this item?",
    [description]
  );

  const confirm = useCallback(async () => {
    if (busy) return;
    await onConfirm?.();
  }, [busy, onConfirm]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      disableClose={busy}
      footer={
        <div className={styleTheme.modal.footerActionsEnd}>
          <button
            type="button"
            onClick={onClose}
            className={styleTheme.button.secondary}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className={styleTheme.button.danger}
            disabled={busy}
          >
            {busy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      }
    >
      <div className={styleTheme.text.mutedSmall}>This action can't be undone.</div>
    </Modal>
  );
}
