import { useRef, useState, useEffect, useMemo } from "react";
import { Paperclip, Globe, ArrowRight, Sparkles } from "lucide-react";
import ChatMessageBubble from "./components/ChatMessageBubble";
import useDashboardChatController from "./hooks/useDashboardChatController";

export default function ChatInterface({
  showEmptyStateDetails = false,
  isFloating = false,
  placeholder = "Ask anything about your workspace...",
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
    setSelectedCollectionIds,
    collectionPickerOpen,
    setCollectionPickerOpen,
    openAiComingSoon,
    sanitizedDraftMessage,
    inputRef,
    scrollAnchorRef,
    handleSubmit,
    toggleCollection,
    openAiComingSoonMessage,
  } = useDashboardChatController();

  const chatRootRef = useRef(null);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const hasMessages = messages.length > 0;
  const isEmptyState = !hasMessages;

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

  // Mock time matching the design layout
  const mockTime = useMemo(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  // Determine if we show the active "AI Chat" full page layout
  const showFullPageChatLayout = showEmptyStateDetails && hasMessages;

  return (
    <div
      ref={chatRootRef}
      className={`w-full flex flex-col ${
        !isFloating
          ? showFullPageChatLayout
            ? "relative min-h-[78vh] justify-between py-2"
            : "relative min-h-[78vh] justify-center items-center"
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
              background: "radial-gradient(circle at 50% 20%, rgba(200, 184, 224, 0.15) 0%, transparent 60%)",
            }}
          />
        </div>
      )}

      {/* Focus Page Active Chat Mode Header */}
      {showFullPageChatLayout ? (
        <div className="w-full max-w-[720px] mx-auto px-4 mb-6 select-none z-10 animate-fade-in">
          <div className="text-[12px] text-muted-soft tracking-wider mb-2 flex items-center gap-1.5 font-bold uppercase">
            <span>Dashboard</span>
            <span className="opacity-40 font-normal">&gt;</span>
            <span className="text-ink">AI Chat</span>
          </div>
          <h2 className="font-waldenburg-light text-4xl text-ink tracking-tight mb-2">
            AI Chat
          </h2>
          <p className="text-muted text-xs leading-relaxed max-w-2xl">
            Engage with DashPoint's intelligence layer through natural dialogue. Synthesize research, generate summaries, and explore your collections with voice-AI precision.
          </p>
        </div>
      ) : null}

      {/* Workspace Indicator and Title for Focus Page Empty State */}
      {showEmptyStateDetails && isEmptyState && (
        <div className="text-center flex flex-col items-center w-full select-none max-w-[720px] px-4">
          <div className="text-[12px] text-muted-soft tracking-wider mb-6 flex items-center gap-1.5 font-medium justify-center select-none">
            <span className="opacity-70">{mockTime}</span>
            <span className="opacity-30">/</span>
            <span className="opacity-70">Active Workspace: Intelligence</span>
          </div>

          <h2 className="font-waldenburg-light text-5xl md:text-[56px] text-ink leading-[1.1] tracking-tight mb-10">
            What is the <br />
            <span className="italic block mt-1">focus today?</span>
          </h2>
        </div>
      )}

      <div className={!isFloating ? "relative w-full max-w-[720px] mx-auto px-4 z-10 flex flex-col" : "w-full"}>
        
        {/* Render Chat History */}
        {hasMessages && (
          showFullPageChatLayout ? (
            /* Focus Page Active History: Rendered directly on the canvas without card container */
            <div className="space-y-5 mb-8 w-full max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
              {messages.map((entry) => (
                <ChatMessageBubble key={entry.id} entry={entry} />
              ))}
              <div ref={scrollAnchorRef} />
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
          )
        )}

        {/* Input container wrapper */}
        <div className="relative w-full">
          {/* Add Context (Collections) Popover Dropdown */}
          {collectionPickerOpen && (
            <div className="absolute bottom-[56px] left-4 z-50 w-[260px] bg-surface-card border border-hairline rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1 animate-fade-in flex flex-col select-none">
              <div className="px-3 py-2 text-[10px] font-bold text-muted-soft uppercase tracking-wider border-b border-hairline/60 mb-1">
                Select Context Sources
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-0.5">
                {collectionsLoading ? (
                  <div className="px-3 py-2 text-xs text-muted font-medium">Loading collections...</div>
                ) : collectionsError ? (
                  <div className="px-3 py-2 text-xs text-semantic-error font-semibold">{collectionsError}</div>
                ) : !collections.length ? (
                  <div className="px-3 py-2 text-xs text-muted font-medium">No collections found</div>
                ) : (
                  collections.map((c) => {
                    const selected = selectedCollectionIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCollection(c.id)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left text-xs font-semibold text-ink hover:bg-canvas-soft transition-colors"
                      >
                        <span className="truncate flex-1 pr-1">{c.name}</span>
                        {selected && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
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
            <div className="absolute bottom-[56px] left-[110px] z-50 w-[245px] bg-surface-card border border-hairline rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1 animate-fade-in flex flex-col select-none">
              <div className="px-3 py-2 text-[10px] font-bold text-muted-soft uppercase tracking-wider border-b border-hairline/60 mb-1">
                Select Model Provider
              </div>
              {[
                { value: "auto", label: "Auto Router (recommended)", desc: "Dynamically routes prompts to fastest engine" },
                { value: "gemini", label: "Google Gemini", desc: "Optimized for large context reasoning" },
                { value: "openai", label: "OpenAI GPT", desc: "Best for coding & rapid responses" }
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
                      <span className="block text-[9px] text-muted-soft mt-0.5 leading-snug">{opt.desc}</span>
                    </div>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Prompt card/capsule input rendering */}
          {showFullPageChatLayout ? (
            /* Focus Page Active Capsule Pill Input */
            <form
              onSubmit={handleSubmit}
              className="w-full bg-surface-card border border-hairline rounded-full pl-6 pr-2 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_28px_rgba(0,0,0,0.04)] flex items-center gap-3 relative"
            >
              {/* Context Selector inside Capsule */}
              <button
                type="button"
                onClick={() => setCollectionPickerOpen(!collectionPickerOpen)}
                className="text-muted hover:text-ink transition-colors p-1 shrink-0"
                title="Add context"
              >
                <Paperclip size={15} />
              </button>

              {/* Model Selector inside Capsule */}
              <button
                type="button"
                onClick={() => setModelPickerOpen(!modelPickerOpen)}
                className="text-muted hover:text-ink transition-colors p-1 shrink-0 mr-1"
                title={`Browse (${model})`}
              >
                <Globe size={15} />
              </button>

              <textarea
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm text-ink placeholder-muted-soft outline-none border-none resize-none pt-2.5 min-h-[40px] max-h-[120px]"
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

              <div className="flex items-center gap-4 shrink-0 select-none">
                <span className="text-[11px] text-muted-soft font-medium hidden sm:inline">
                  Tip: Press <span className="font-bold">CMD + Enter</span>
                </span>
                
                <button
                  type="submit"
                  disabled={isSending || !sanitizedDraftMessage || openAiComingSoon}
                  className="bg-ink hover:bg-primary-active text-canvas rounded-full px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 h-8 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Focus
                </button>
              </div>
            </form>
          ) : (
            /* Focus Page Empty State or Floating Assistant Drawer: Standard prompt card layout */
            <div className="bg-surface-card border border-hairline rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <form onSubmit={handleSubmit} className="flex items-start gap-3">
                <div className="mt-2 text-muted-soft shrink-0">
                  <Sparkles size={18} />
                </div>
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={placeholder}
                  className="w-full resize-none bg-transparent text-[15px] text-ink placeholder-muted-soft outline-none border-none pt-1.5 min-h-[44px]"
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

                {/* Submit Pill button */}
                <button
                  type="submit"
                  disabled={isSending || !sanitizedDraftMessage || openAiComingSoon}
                  className="bg-ink hover:bg-primary-active text-canvas rounded-full px-5 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 h-9 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Focus"
                >
                  <span>Focus</span>
                  <ArrowRight size={14} />
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
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCollectionPickerOpen(!collectionPickerOpen)}
                    className="flex items-center gap-1.5 text-muted hover:text-ink font-medium transition-colors"
                  >
                    <Paperclip size={14} className="opacity-70" />
                    <span>Add context</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModelPickerOpen(!modelPickerOpen)}
                    className="flex items-center gap-1.5 text-muted hover:text-ink font-medium transition-colors"
                  >
                    <Globe size={14} className="opacity-70" />
                    <span>Browse ({model})</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-muted-soft select-none font-medium">
                  <span>Tip: Press</span>
                  <kbd className="border border-hairline bg-canvas px-1 rounded text-[10px] font-mono">⌘</kbd>
                  <span>+</span>
                  <kbd className="border border-hairline bg-canvas px-1 rounded text-[10px] font-mono">Enter</kbd>
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

      {/* Decorative branding elements absolutely positioned at bottom */}
      {showEmptyStateDetails && isEmptyState ? (
        <div className="absolute bottom-4 left-0 right-0 hidden md:flex justify-between items-center w-full px-8 py-6 select-none opacity-60 z-0">
          <div className="text-xs text-muted-soft tracking-wider font-medium font-waldenburg-light">
            DashPoint <span className="text-[10px] font-sans font-semibold tracking-[0.2em] ml-1.5 opacity-60">INTELLIGENCE</span>
          </div>
          <div className="text-[11px] text-muted-soft font-mono">
            v2.4.0-release.edtn
          </div>
        </div>
      ) : null}
    </div>
  );
}
