import { useRef } from "react";

import { PROVIDER_OPTIONS } from "@/shared/ui/Chat/chatBar.constants";
import ChatCollectionPicker from "@/shared/ui/Chat/components/ChatCollectionPicker";
import ChatMessageBubble from "@/shared/ui/Chat/components/ChatMessageBubble";
import useDashboardChatController from "@/shared/ui/Chat/hooks/useDashboardChatController";
import { ArrowUp, Mic } from "@/shared/ui/icons/icons";

export default function FocusPage() {
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

  const chatRootRef = useRef(null);
  const hasMessages = messages.length > 0;
  const isEmptyState = !hasMessages;

  return (
    <section
      ref={chatRootRef}
      className="relative overflow-hidden"
      onKeyDownCapture={(event) => {
        if (event.key !== "Escape") return;
        if (!chatRootRef.current?.contains(document.activeElement)) return;

        event.preventDefault();
        event.stopPropagation();
        setCollectionPickerOpen(false);
        document.activeElement?.blur?.();
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute bottom-10 left-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />
      </div>

      <div
        className={`relative mx-auto w-full max-w-4xl px-4 pb-12 pt-10 ${
          isEmptyState ? "min-h-[70vh] flex flex-col justify-center" : ""
        }`}
      >
        {hasMessages ? (
          <div className="dp-surface dp-border overflow-hidden rounded-3xl border shadow-lg">
            <div className="relative">
              <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto px-4 py-5 dp-chat-scroll sm:px-5">
                <div className="space-y-3">
                  {messages.map((entry) => (
                    <ChatMessageBubble key={entry.id} entry={entry} />
                  ))}
                </div>
                <div ref={scrollAnchorRef} />
              </div>
              <div className="dp-chat-topfade pointer-events-none absolute inset-x-0 top-0 h-8" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <p className="dp-text text-3xl font-semibold sm:text-4xl">What is the focus today?</p>
            <p className="dp-text-muted mt-3 text-sm sm:text-base">
              Ask DashPoint to summarize, plan, or explore your workspace.
            </p>
          </div>
        )}

        <div
          className={`dp-surface dp-border rounded-3xl border p-3 shadow-xl ${
            isEmptyState ? "mt-5" : "mt-6"
          }`}
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask anything about your workspace..."
              className="dp-surface dp-text min-h-[50px] w-full resize-none rounded-2xl px-4 py-2 text-sm outline-none"
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
              type="button"
              className="dp-btn-secondary inline-flex h-11 w-11 items-center justify-center rounded-2xl"
              aria-label="Voice input"
              title="Voice input"
              disabled={isSending}
            >
              <Mic size={18} />
            </button>

            <button
              type="submit"
              disabled={isSending || !sanitizedDraftMessage || openAiComingSoon}
              className="dp-btn-primary inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send"
              title="Send"
            >
              <ArrowUp size={18} />
            </button>
          </form>

          {openAiComingSoon ? (
            <p className="mt-3 rounded-lg border border-amber-300/60 bg-amber-100/60 px-3 py-1.5 text-xs text-amber-900">
              {openAiComingSoonMessage}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
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

            <p className="text-[11px] dp-text-subtle">
              Tip: Press <span className="font-semibold">Ctrl/Cmd + /</span> to focus.
            </p>
          </div>

          <ChatCollectionPicker
            open={collectionPickerOpen}
            collectionsLoading={collectionsLoading}
            collectionsError={collectionsError}
            collections={collections}
            selectedCollectionIds={selectedCollectionIds}
            onToggleCollection={toggleCollection}
          />
        </div>
      </div>
    </section>
  );
}
