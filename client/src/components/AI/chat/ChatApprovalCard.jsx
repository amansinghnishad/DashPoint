export default function ChatApprovalCard({
  pendingAction,
  isSending,
  onApprove,
  onCancel,
}) {
  if (!pendingAction) return null;

  const endpoint = pendingAction?.endpoint || "";
  const method = (pendingAction?.method || "").toUpperCase();

  let title = "Action requires approval";
  let description = "The AI wants to perform an action. Approve to continue.";

  if (endpoint === "/api/calendar/google/schedule") {
    title = "Schedule requires approval";
    description =
      "This will create or change items in your calendar. Approve only if you want to proceed.";
  } else if (endpoint) {
    title = "Action requires approval";
    description = `The AI wants to call ${
      method || ""
    } ${endpoint}. Approve to continue.`.trim();
  }

  return (
    <div className="dp-surface dp-border mb-2 rounded-2xl border p-3 shadow-lg">
      <p className="dp-text text-sm font-semibold">{title}</p>
      <p className="dp-text-muted mt-1 text-xs">{description}</p>
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
