export default function DashboardChatBar({
  className = "",
  show = true,
  placeholder = "Chat will be connected to OpenAI soon...",
}) {
  if (!show) return null;

  return (
    <div
      className={`fixed left-1/2 bottom-4 z-[80] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 ${className}`}
    >
      <div className="px-3 pb-2">
        <p className="dp-text-subtle text-[11px]">
          Tip: Press <span className="font-semibold">Ctrl/⌘ + /</span> to focus.
        </p>
        <p className="dp-text-muted mt-1 text-xs italic">
          Chat functionality has been removed and will be rebuilt shortly.
        </p>
      </div>

      <div className="dp-surface dp-border rounded-2xl border shadow-lg">
        <div className="flex items-center gap-2 p-2">
          <input
            value=""
            onChange={() => {}}
            placeholder={placeholder}
            className="dp-surface dp-text w-full rounded-xl px-4 py-2 text-sm outline-none"
            aria-label="Chat prompt"
            disabled
          />

          <button
            type="button"
            disabled
            className="dp-btn-primary inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors disabled:opacity-60"
            aria-label="Send"
            title="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
