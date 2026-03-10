import { PROVIDER_OPTIONS } from "./chatBar.constants";
import ChatCollectionPicker from "./components/ChatCollectionPicker";
import ChatMessageBubble from "./components/ChatMessageBubble";
import useDashboardChatController from "./hooks/useDashboardChatController";

export default function DashboardChatBar({
  className = "",
  show = true,
  placeholder = "Ask anything about your workspace...",
}) {
  const {
    provider,
    setProvider,
    model,
    setModel,
    message,
    setMessage,
    messages,
    isSending,
    collections,
    collectionsLoading,
    collectionsError,
    selectedCollectionIds,
    setSelectedCollectionIds,
    collectionPickerOpen,
    setCollectionPickerOpen,
    modelOptions,
    openAiComingSoon,
    selectedCollectionsLabel,
    sanitizedDraftMessage,
    inputRef,
    scrollAnchorRef,
    handleSubmit,
    toggleCollection,
    openAiComingSoonMessage,
  } = useDashboardChatController();

  if (!show) return null;

  return (
    <div
      className={`fixed left-1/2 bottom-4 z-[80] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 ${className}`}
    >
      <div className="dp-surface dp-border overflow-hidden rounded-2xl border shadow-xl">
        <div className="max-h-[48vh] space-y-3 overflow-y-auto p-3 dp-chat-scroll">
          {messages.map((entry) => (
            <ChatMessageBubble key={entry.id} entry={entry} />
          ))}
          <div ref={scrollAnchorRef} />
        </div>

        <div className="border-t dp-border p-2">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              className="dp-surface-muted dp-border dp-text rounded-lg border px-2 py-1 text-xs outline-none"
              aria-label="Model provider"
              disabled={isSending}
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="dp-surface-muted dp-border dp-text rounded-lg border px-2 py-1 text-xs outline-none"
              aria-label="Model selection"
              disabled={isSending}
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setCollectionPickerOpen((open) => !open)}
              className="dp-btn-secondary rounded-lg px-2 py-1 text-xs font-medium"
              disabled={collectionsLoading}
            >
              Sources: {selectedCollectionsLabel}
            </button>

            {selectedCollectionIds.length ? (
              <button
                type="button"
                onClick={() => setSelectedCollectionIds([])}
                className="dp-btn-secondary rounded-lg px-2 py-1 text-xs"
              >
                Use all
              </button>
            ) : null}
          </div>

          {openAiComingSoon ? (
            <p className="mb-2 rounded-lg border border-amber-300/60 bg-amber-100/60 px-3 py-1.5 text-xs text-amber-900">
              {openAiComingSoonMessage}
            </p>
          ) : null}

          <ChatCollectionPicker
            open={collectionPickerOpen}
            collectionsLoading={collectionsLoading}
            collectionsError={collectionsError}
            collections={collections}
            selectedCollectionIds={selectedCollectionIds}
            onToggleCollection={toggleCollection}
          />

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={placeholder}
              className="dp-surface dp-text min-h-[44px] w-full resize-none rounded-xl px-4 py-2 text-sm outline-none"
              aria-label="Chat prompt"
              rows={1}
              disabled={isSending}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
            />

            <button
              type="submit"
              disabled={isSending || !sanitizedDraftMessage || openAiComingSoon}
              className="dp-btn-primary inline-flex h-11 min-w-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send"
              title="Send"
            >
              {isSending ? "..." : "Send"}
            </button>
          </form>

          <p className="mt-2 text-[11px] dp-text-subtle">
            Tip: Press <span className="font-semibold">Ctrl/Cmd + /</span> to focus.
          </p>
        </div>
      </div>
    </div>
  );
}
