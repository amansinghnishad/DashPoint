import { ArrowUp, Loader2, RotateCcw } from "@/shared/ui/icons";

export default function ChatInputBar({
  inputRef,
  prompt,
  setPrompt,
  placeholder,
  isSending,
  canSend,
  hasMessages,
  onSubmit,
  onClear,
  onEscape,
  onFocus,
}) {
  return (
    <div className="dp-surface dp-border rounded-2xl border shadow-lg">
      <div className="flex items-center gap-2 p-2">
        <input
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onEscape?.();
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (canSend) onSubmit?.();
            }
          }}
          placeholder={placeholder}
          className="dp-surface dp-text w-full rounded-xl px-4 py-2 text-sm outline-none"
          aria-label="AI prompt"
        />

        {hasMessages ? (
          <button
            type="button"
            onClick={onClear}
            disabled={isSending}
            className="dp-btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl disabled:opacity-60"
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <RotateCcw size={18} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend}
          className="dp-btn-primary inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors disabled:opacity-60"
          aria-label="Send"
          title="Send"
        >
          {isSending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ArrowUp size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
