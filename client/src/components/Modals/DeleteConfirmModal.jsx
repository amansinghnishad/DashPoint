import { useCallback, useMemo } from "react";
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
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className="dp-danger inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
            disabled={busy}
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="dp-text-muted text-sm">This action can’t be undone.</div>
    </Modal>
  );
}
