import { ArrowUp, Globe, Mic, MicOff, Paperclip, Plus, Sparkles, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ChatPixelAmbient from "./ChatPixelAmbient";
import ChatHistoryDrawer from "./components/ChatHistoryDrawer";
import ChatMessageBubble from "./components/ChatMessageBubble";
import ChatUploadToCollectionModal from "./components/ChatUploadToCollectionModal";
import useDashboardChatController from "./hooks/useDashboardChatController";
import useVoiceRecognition from "../../hooks/useVoiceRecognition";

function SelectedContextChips({ collections, selectedIds, onRemove }) {
  if (!selectedIds.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-hairline/70 px-4 py-3">
      <span className="mr-1 text-[11px] font-medium text-muted-soft">Using</span>
      {selectedIds.map((id) => {
        const collection = collections.find((item) => item.id === id);
        if (!collection) return null;
        return (
          <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-lg border border-hairline bg-canvas px-2.5 py-1 text-xs font-medium text-ink">
            <span className="max-w-48 truncate">{collection.name}</span>
            <button
              type="button"
              onClick={() => onRemove(id)}
              aria-label={`Remove ${collection.name} context`}
              title={`Remove ${collection.name}`}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-canvas-soft hover:text-ink"
            >
              <X size={12} />
            </button>
          </span>
        );
      })}
    </div>
  );
}

export default function ChatInterface({
  showEmptyStateDetails = false,
  isFloating = false,
  placeholder = "Ask your workspace...",
}) {
  const {
    provider,
    setProvider,
    model,
    message,
    setMessage,
    messages,
    isSending,
    collections,
    collectionsLoading,
    collectionsError,
    selectedCollectionIds,
    selectedCollectionsLabel,
    setSelectedCollectionIds,
    collectionPickerOpen,
    setCollectionPickerOpen,
    sessions,
    activeSessionId,
    historyDrawerOpen,
    setHistoryDrawerOpen,
    sessionsLoading,
    selectSession,
    createNewSession,
    renameSession,
    deleteSession,
    openAiComingSoon,
    sanitizedDraftMessage,
    inputRef,
    scrollAnchorRef,
    handleSubmit,
    toggleCollection,
    openAiComingSoonMessage,
  } = useDashboardChatController();

  const {
    isListening,
    transcript: voiceTranscript,
    interimTranscript,
    error: voiceError,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  // Sync voice transcript into message input
  useEffect(() => {
    if (!isListening) return;
    const combined = (voiceTranscript + (interimTranscript ? ` ${interimTranscript}` : "")).trim();
    if (combined) {
      setMessage(combined);
    }
  }, [interimTranscript, isListening, setMessage, voiceTranscript]);

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
      inputRef.current?.focus();
    }
  };

  const chatRootRef = useRef(null);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const hasMessages = messages.length > 0;
  const isEmptyState = !hasMessages;

  useEffect(() => {
    const openHistory = () => setHistoryDrawerOpen(true);
    window.addEventListener("dashpoint:open-chat-history", openHistory);
    return () => window.removeEventListener("dashpoint:open-chat-history", openHistory);
  }, [setHistoryDrawerOpen]);

  const handleSuggestionClick = (text) => {
    setMessage(text);
    inputRef.current?.focus();
  };

  // Click outside handler to dismiss dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (chatRootRef.current && !chatRootRef.current.contains(e.target)) {
        setCollectionPickerOpen(false);
        setModelPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [setCollectionPickerOpen]);

  // Determine if we show the active "AI Chat" full page layout
  const showFullPageChatLayout = showEmptyStateDetails && hasMessages;
  const providerLabel = provider === "gemini" ? "Google Gemini" : provider === "openai" ? "OpenAI" : "Auto";
  const selectedModelLabel = model === "auto"
    ? provider === "auto" ? "Auto" : `${providerLabel} · Auto`
    : `${providerLabel === "Auto" ? "" : `${providerLabel} · `}${model}`;

  return (
    <div
      ref={chatRootRef}
      className={`flex w-full flex-col ${showFullPageChatLayout ? "dp-chat-active" : ""} ${
        !isFloating
          ? showFullPageChatLayout
            ? "relative min-h-0 flex-1 justify-start"
            : "relative min-h-0 flex-1 justify-center items-center"
          : "justify-end"
      }`}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") {
          if (!chatRootRef.current?.contains(document.activeElement)) return;
          event.preventDefault();
          event.stopPropagation();
          setCollectionPickerOpen(false);
          setModelPickerOpen(false);
          document.activeElement?.blur?.();
        }
      }}
    >
      {/* Decorative background for Focus Page */}
      {showEmptyStateDetails && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 50% 20%, rgba(200, 184, 224, 0.15) 0%, transparent 60%)",
            }}
          />
        </div>
      )}

      {showEmptyStateDetails && <ChatPixelAmbient variant="assistant" />}

      {/* Focus Page Active Chat Mode Header */}
      {showFullPageChatLayout ? (
          <div className="relative z-10 flex w-full justify-end px-4 py-3">
          <button
            type="button"
            onClick={createNewSession}
            className="dp-btn-secondary inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-colors"
            title="Start new conversation"
          >
            <Plus size={14} />
            <span>New chat</span>
          </button>
        </div>
      ) : null}

      {/* Workspace Indicator and Title for Focus Page Empty State */}
      {showEmptyStateDetails && isEmptyState && (
        <div className="text-center flex flex-col items-center w-full select-none max-w-[720px] px-4">
          <h2 className="font-waldenburg-light text-5xl md:text-[56px] text-ink leading-[1.1] tracking-tight mb-10">
            What is the <br />
            <span className="italic block mt-1">focus today?</span>
          </h2>
        </div>
      )}

      <div
        className={
          !isFloating
            ? showFullPageChatLayout
              ? "relative z-10 flex min-h-0 w-full flex-1 flex-col"
              : "relative z-10 flex w-full max-w-[720px] flex-col px-4"
            : "relative z-10 w-full"
        }
      >
        {/* Render Chat History */}
        {hasMessages &&
          (showFullPageChatLayout ? (
            /* Focus Page Active History: Rendered directly on the canvas without card container */
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin">
              <div className="mx-auto w-full max-w-5xl space-y-5 py-2">
                {messages.map((entry) => (
                  <ChatMessageBubble key={entry.id} entry={entry} />
                ))}
                <div ref={scrollAnchorRef} />
              </div>
            </div>
          ) : (
            /* Floating drawer active history: Wrapped inside card container */
            <div className="bg-surface-card border border-hairline rounded-2xl overflow-hidden shadow-sm mb-4 w-full">
              <div className="max-h-[30vh] overflow-y-auto px-4 py-4 scrollbar-thin">
                <div className="space-y-4">
                  {messages.map((entry) => (
                    <ChatMessageBubble key={entry.id} entry={entry} />
                  ))}
                </div>
                <div ref={scrollAnchorRef} />
              </div>
            </div>
          ))}

        {/* Input container wrapper */}
        <div className={`relative w-full ${showFullPageChatLayout ? "mt-auto shrink-0 px-4 pb-5 pt-3" : ""}`}>
          {/* Add Context (Collections) Popover Dropdown */}
          {collectionPickerOpen && (
            <div className={`absolute ${showFullPageChatLayout ? "bottom-[calc(100%+0.5rem)] left-4" : "bottom-[56px] left-4"} z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-hairline bg-surface-card p-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)] animate-fade-in flex flex-col select-none`}>
              <div className="px-3 py-2 text-[10px] font-bold text-muted-soft uppercase tracking-wider border-b border-hairline/60 mb-1">
                Add workspace context
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-0.5">
                {collectionsLoading ? (
                  <div className="px-3 py-2 text-xs text-muted font-medium">
                    Loading collections...
                  </div>
                ) : collectionsError ? (
                  <div className="px-3 py-2 text-xs text-semantic-error font-semibold">
                    {collectionsError}
                  </div>
                ) : !collections.length ? (
                  <div className="px-3 py-2 text-xs text-muted font-medium">
                    No collections found
                  </div>
                ) : (
                  collections.map((c) => {
                    const selected = selectedCollectionIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          toggleCollection(c.id);
                          setCollectionPickerOpen(false);
                        }}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left text-xs font-semibold text-ink hover:bg-canvas-soft transition-colors"
                      >
                        <span className="truncate flex-1 pr-1">{c.name}</span>
                        {selected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              {selectedCollectionIds.length > 0 && (
                <div className="border-t border-hairline/60 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCollectionIds([]);
                      setCollectionPickerOpen(false);
                    }}
                    className="w-full text-center px-3 py-1.5 text-[10px] font-bold text-muted hover:text-ink transition-colors block"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Model Selection Popover Dropdown */}
          {modelPickerOpen && (
            <div className={`absolute ${showFullPageChatLayout ? "bottom-[calc(100%+0.5rem)] left-16" : "bottom-[56px] left-[110px]"} z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-hairline bg-surface-card p-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)] animate-fade-in flex flex-col select-none`}>
              <div className="px-3 py-2 text-[10px] font-bold text-muted-soft uppercase tracking-wider border-b border-hairline/60 mb-1">
                Choose a model
              </div>
              {[
                {
                  value: "auto",
                  label: "Auto Router (recommended)",
                  desc: "Dynamically routes prompts to fastest engine",
                },
                {
                  value: "gemini",
                  label: "Google Gemini",
                  desc: "Optimized for large context reasoning",
                },
                { value: "openai", label: "OpenAI GPT", desc: "Best for coding & rapid responses" },
              ].map((opt) => {
                const isActive = opt.value === provider;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setProvider(opt.value);
                      setModelPickerOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-semibold text-ink hover:bg-canvas-soft transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block font-bold">{opt.label}</span>
                      <span className="block text-[9px] text-muted-soft mt-0.5 leading-snug">
                        {opt.desc}
                      </span>
                    </div>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Prompt card/capsule input rendering */}
          {showFullPageChatLayout ? (
            /* Full-page conversation composer */
            <form
              onSubmit={handleSubmit}
              className="mx-auto w-full max-w-5xl rounded-2xl border border-hairline bg-surface-card shadow-lg transition-shadow focus-within:shadow-xl"
            >
              <SelectedContextChips
                collections={collections}
                selectedIds={selectedCollectionIds}
                onRemove={(id) => toggleCollection(id)}
              />
              <textarea
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={isListening ? "Listening... speak clearly" : placeholder}
                className="block min-h-[5rem] max-h-48 w-full resize-y bg-transparent px-5 py-4 text-sm leading-relaxed text-ink placeholder-muted-soft outline-none"
                aria-label="Chat prompt"
                rows={1}
                disabled={isSending}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline/70 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-1">
                  <button type="button" onClick={() => { setCollectionPickerOpen(false); setModelPickerOpen(false); setUploadModalOpen(true); }} className="inline-flex h-9 items-center gap-2 rounded-xl px-2.5 text-xs font-medium text-muted transition-colors hover:bg-canvas-soft hover:text-ink" title="Upload files directly to a collection" aria-label="Upload files directly to a collection">
                    <Upload size={16} /><span className="hidden sm:inline">Upload</span>
                  </button>
                  <button type="button" onClick={() => { setModelPickerOpen(false); setCollectionPickerOpen(!collectionPickerOpen); }} className="inline-flex h-9 items-center gap-2 rounded-xl px-2.5 text-xs font-medium text-muted transition-colors hover:bg-canvas-soft hover:text-ink" title={selectedCollectionsLabel || "Add workspace context"} aria-label={selectedCollectionsLabel || "Add workspace context"} aria-expanded={collectionPickerOpen}>
                    <Paperclip size={16} /><span className="hidden sm:inline">{selectedCollectionIds.length ? `${selectedCollectionIds.length} selected` : "Add context"}</span>
                  </button>
                  <button type="button" onClick={() => { setCollectionPickerOpen(false); setModelPickerOpen(!modelPickerOpen); }} className="inline-flex h-9 items-center gap-2 rounded-xl px-2.5 text-xs font-medium text-muted transition-colors hover:bg-canvas-soft hover:text-ink" title={`Choose model · ${selectedModelLabel}`} aria-label={`Choose model · ${selectedModelLabel}`} aria-expanded={modelPickerOpen}>
                    <Globe size={16} /><span className="hidden sm:inline">Model · {selectedModelLabel}</span>
                  </button>
                  {voiceSupported && <button type="button" onClick={handleToggleVoice} className={`inline-flex h-9 items-center gap-2 rounded-xl px-2.5 text-xs font-medium transition-colors hover:bg-canvas-soft ${isListening ? "text-rose-500" : "text-muted hover:text-ink"}`} title={isListening ? "Stop voice dictation" : "Voice dictation"} aria-label={isListening ? "Stop voice dictation" : "Voice dictation"} aria-pressed={isListening}>{isListening ? <MicOff size={16} /> : <Mic size={16} />}<span className="hidden sm:inline">{isListening ? "Listening" : "Voice"}</span></button>}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {voiceError && <span role="status" className="max-w-48 truncate text-[11px] text-semantic-error">{voiceError}</span>}
                  <span className="hidden select-none text-[11px] font-medium text-muted-soft sm:inline">Press <kbd className="rounded border border-hairline bg-canvas px-1 font-mono">⌘</kbd> + <kbd className="rounded border border-hairline bg-canvas px-1 font-mono">Enter</kbd></span>
                <button
                  type="submit"
                  disabled={isSending || !sanitizedDraftMessage || openAiComingSoon}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-canvas transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                  title="Send message"
                >
                  <ArrowUp size={18} />
                </button>
              </div>
              </div>
            </form>
          ) : (
            /* Focus Page Empty State or Floating Assistant Drawer: Standard prompt card layout */
            <div className="rounded-2xl border border-hairline bg-surface-card p-3 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-4">
              <SelectedContextChips
                collections={collections}
                selectedIds={selectedCollectionIds}
                onRemove={(id) => toggleCollection(id)}
              />
              <form onSubmit={handleSubmit} className="flex items-start gap-3">
                <div className="mt-2 text-muted-soft shrink-0">
                  <Sparkles size={18} />
                </div>
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={isListening ? "Listening... speak clearly" : placeholder}
                  className="w-full resize-none bg-transparent text-[15px] text-ink placeholder-muted-soft outline-none border-none pt-1.5 min-h-[44px]"
                  aria-label="Chat prompt"
                  rows={1}
                  disabled={isSending}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      handleSubmit(event);
                    }
                  }}
                />

                {/* Voice button in standard prompt */}
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`mt-1.5 p-1.5 rounded-full transition-colors shrink-0 ${
                      isListening
                        ? "bg-rose-100 text-rose-500 animate-pulse"
                        : "text-muted hover:text-ink hover:bg-canvas-soft"
                    }`}
                    title={isListening ? "Stop voice dictation" : "Voice dictation"}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                )}

                {/* Submit Pill button */}
                <button
                  type="submit"
                  disabled={isSending || !sanitizedDraftMessage || openAiComingSoon}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-canvas transition-colors hover:bg-primary-active disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                  title="Send message"
                >
                  <ArrowUp size={18} />
                </button>
              </form>

              {openAiComingSoon && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                  {openAiComingSoonMessage}
                </p>
              )}

              {/* Hairline Divider */}
              <div className="h-px bg-hairline/60 my-3" />

              {/* Actions & Shortcut layout */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-0.5 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => { setCollectionPickerOpen(false); setModelPickerOpen(false); setUploadModalOpen(true); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-canvas-soft hover:text-ink sm:h-auto sm:w-auto sm:gap-1.5"
                    aria-label="Upload files directly to a collection"
                    title="Upload files directly to a collection"
                  >
                    <Upload size={14} className="opacity-70" />
                    <span className="hidden sm:inline">Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModelPickerOpen(false); setCollectionPickerOpen(!collectionPickerOpen); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-canvas-soft hover:text-ink sm:h-auto sm:w-auto sm:gap-1.5"
                    aria-label={selectedCollectionsLabel || "Add context"}
                    aria-expanded={collectionPickerOpen}
                  >
                    <Paperclip size={14} className="opacity-70" />
                    <span className="hidden sm:inline">Add context</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCollectionPickerOpen(false); setModelPickerOpen(!modelPickerOpen); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-canvas-soft hover:text-ink sm:h-auto sm:w-auto sm:gap-1.5"
                    aria-label={`Choose model · ${selectedModelLabel}`}
                    aria-expanded={modelPickerOpen}
                  >
                    <Globe size={14} className="opacity-70" />
                    <span className="hidden sm:inline">Model · {selectedModelLabel}</span>
                  </button>
                </div>

                <div className="hidden items-center gap-1 text-muted-soft select-none font-medium sm:flex">
                  <span>Tip: Press</span>
                  <kbd className="border border-hairline bg-canvas px-1 rounded text-[10px] font-mono">
                    ⌘
                  </kbd>
                  <span>+</span>
                  <kbd className="border border-hairline bg-canvas px-1 rounded text-[10px] font-mono">
                    Enter
                  </kbd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Pills */}
        {showEmptyStateDetails && isEmptyState ? (
          <div className="mt-8 flex flex-wrap justify-center gap-2.5 w-full">
            {[
              "Summarize recent meetings",
              "Find documentation on Project X",
              "Draft weekly report",
            ].map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => handleSuggestionClick(text)}
                className="border border-hairline bg-surface-card hover:bg-canvas-soft text-[13px] text-muted hover:text-ink px-4 py-2 rounded-full transition-colors font-medium shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              >
                {text}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ChatHistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onNewChat={createNewSession}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
        loading={sessionsLoading}
      />
      <ChatUploadToCollectionModal
        open={uploadModalOpen}
        collections={collections}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}
