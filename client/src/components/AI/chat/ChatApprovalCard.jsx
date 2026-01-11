export default function ChatApprovalCard({
  pendingAction,
  isSending,
  onApprove,
  onCancel,
}) {
  if (!pendingAction) return null;

  return (
    <div className="dp-surface dp-border mb-2 rounded-2xl border p-3 shadow-lg">
      <p className="dp-text text-sm font-semibold">Action requires approval</p>
      <p className="dp-text-muted mt-1 text-xs">
        The AI wants to perform an action. Approve to continue.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={isSending}
          className="dp-btn-primary inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSending}
          className="dp-btn-secondary inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
