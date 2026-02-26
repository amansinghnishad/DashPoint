import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { chatApi } from "../../../services/modules/chatApi";

const DEFAULT_MAX_ITEMS = 8;
const DEFAULT_TODO_TITLE = "Action Items";

const buildSuggestionMeta = (suggestion) => {
  const parts = [];
  if (suggestion?.priority) {
    parts.push(String(suggestion.priority).toUpperCase());
  }

  if (typeof suggestion?.confidence === "number") {
    parts.push(`${Math.round(suggestion.confidence * 100)}% confidence`);
  }

  return parts.join(" | ");
};

function PendingBubble() {
  return (
    <div className="flex items-center gap-2 text-sm dp-text-muted">
      <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full dp-status-online" />
      <span>Extracting action items...</span>
    </div>
  );
}

function SuggestionsPanel({
  suggestions,
  approval,
  onToggle,
  onSelectAll,
  onClearAll,
  onApprove,
}) {
  const selectedCount = suggestions.filter((item) => item.selected).length;

  return (
    <div className="mt-3 rounded-xl border dp-border dp-surface-muted p-3">
      <p className="dp-text text-xs font-semibold uppercase tracking-wide">
        Suggested To-Dos
      </p>

      <div className="mt-2 max-h-48 space-y-2 overflow-auto pr-1">
        {suggestions.map((suggestion) => (
          <label
            key={suggestion.id}
            className="dp-surface dp-border flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={Boolean(suggestion.selected)}
              onChange={() => onToggle(suggestion.id)}
              disabled={approval?.status === "saving" || approval?.status === "approved"}
            />
            <div className="min-w-0">
              <p className="dp-text text-sm">{suggestion.text}</p>
              {suggestion.reason ? (
                <p className="dp-text-muted mt-0.5 text-[11px]">{suggestion.reason}</p>
              ) : null}
              {buildSuggestionMeta(suggestion) ? (
                <p className="dp-text-subtle mt-0.5 text-[11px]">
                  {buildSuggestionMeta(suggestion)}
                </p>
              ) : null}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSelectAll}
          className="dp-btn-secondary rounded-lg px-2 py-1 text-xs"
          disabled={approval?.status === "saving" || approval?.status === "approved"}
        >
          Select all
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className="dp-btn-secondary rounded-lg px-2 py-1 text-xs"
          disabled={approval?.status === "saving" || approval?.status === "approved"}
        >
          Clear
        </button>

        <button
          type="button"
          onClick={onApprove}
          className="dp-btn-primary rounded-lg px-2 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={
            !selectedCount ||
            approval?.status === "saving" ||
            approval?.status === "approved"
          }
        >
          {approval?.status === "saving"
            ? "Saving..."
            : approval?.status === "approved"
              ? "Approved"
              : `Approve ${selectedCount}`}
        </button>
      </div>

      {approval?.message ? (
        <p
          className={`mt-2 text-xs ${
            approval.status === "approved" ? "dp-text-muted" : "dp-text-danger"
          }`}
        >
          {approval.message}
        </p>
      ) : null}
    </div>
  );
}

export default function DashboardChatBar({
  className = "",
  show = true,
  placeholder = "Paste notes, meeting transcript, or plain text...",
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "assistant-intro",
      role: "assistant",
      content:
        "Paste any raw text and I will suggest action items. You can approve selected items to create a To-Do widget.",
      status: "done",
      suggestions: null,
      approval: null,
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const inputRef = useRef(null);
  const scrollAnchorRef = useRef(null);
  const messageCounterRef = useRef(1);

  const nextMessageId = useCallback(() => {
    messageCounterRef.current += 1;
    return `chat-${messageCounterRef.current}`;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!scrollAnchorRef.current) return;
    scrollAnchorRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, scrollToBottom]);

  useEffect(() => {
    const keyHandler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  const updateMessage = useCallback((id, updater) => {
    setMessages((current) =>
      current.map((entry) => {
        if (entry.id !== id) return entry;
        const patch = typeof updater === "function" ? updater(entry) : updater;
        return { ...entry, ...patch };
      }),
    );
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const trimmed = message.trim();
      if (!trimmed || isSending) return;

      const userMessageId = nextMessageId();
      const assistantMessageId = nextMessageId();

      setMessages((current) => [
        ...current,
        {
          id: userMessageId,
          role: "user",
          content: trimmed,
          status: "done",
          suggestions: null,
          approval: null,
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          status: "loading",
          suggestions: null,
          approval: null,
        },
      ]);

      setMessage("");
      setIsSending(true);

      try {
        const response = await chatApi.extractActionItems({
          rawText: trimmed,
          maxItems: DEFAULT_MAX_ITEMS,
          title: DEFAULT_TODO_TITLE,
        });

        const payload = response?.data || {};
        const rawSuggestions = Array.isArray(payload?.suggestions)
          ? payload.suggestions
          : [];
        const suggestions = rawSuggestions.map((item, index) => ({
          id: String(item?.id || `suggestion-${index + 1}`),
          text: String(item?.text || "").trim(),
          reason: String(item?.reason || "").trim(),
          priority: String(item?.priority || "").trim().toLowerCase(),
          confidence:
            typeof item?.confidence === "number" ? item.confidence : null,
          selected: true,
        }));

        if (!suggestions.length) {
          updateMessage(assistantMessageId, {
            role: "assistant",
            content:
              "No actionable tasks were detected in that text. Try adding more explicit next steps.",
            status: "done",
            suggestions: null,
            approval: null,
          });
          return;
        }

        updateMessage(assistantMessageId, {
          role: "assistant",
          content: `I found ${suggestions.length} suggested action item${
            suggestions.length === 1 ? "" : "s"
          }. Review and approve the ones you want to save.`,
          status: "done",
          suggestions,
          approval: {
            status: "idle",
            message: "",
          },
        });
      } catch (error) {
        const errorText =
          error?.response?.data?.message ||
          error?.message ||
          "Unable to extract action items right now.";

        updateMessage(assistantMessageId, {
          role: "error",
          content: errorText,
          status: "done",
          suggestions: null,
          approval: null,
        });
      } finally {
        setIsSending(false);
      }
    },
    [isSending, message, nextMessageId, updateMessage],
  );

  const toggleSuggestionSelection = useCallback((messageId, suggestionId) => {
    updateMessage(messageId, (entry) => ({
      suggestions: (entry.suggestions || []).map((suggestion) =>
        suggestion.id === suggestionId
          ? { ...suggestion, selected: !suggestion.selected }
          : suggestion,
      ),
    }));
  }, [updateMessage]);

  const selectAllSuggestions = useCallback((messageId, selected) => {
    updateMessage(messageId, (entry) => ({
      suggestions: (entry.suggestions || []).map((suggestion) => ({
        ...suggestion,
        selected,
      })),
    }));
  }, [updateMessage]);

  const approveSuggestions = useCallback(
    async (messageId) => {
      let approvedItems = [];

      updateMessage(messageId, (entry) => {
        const selectedSuggestions = (entry.suggestions || []).filter(
          (suggestion) => suggestion.selected,
        );
        approvedItems = selectedSuggestions.map((suggestion) => ({
          text: suggestion.text,
          sourceId: suggestion.id,
        }));

        return {
          approval: {
            ...(entry.approval || {}),
            status: "saving",
            message: "",
          },
        };
      });

      if (!approvedItems.length) {
        updateMessage(messageId, (entry) => ({
          approval: {
            ...(entry.approval || {}),
            status: "failed",
            message: "Select at least one item to approve.",
          },
        }));
        return;
      }

      try {
        const response = await chatApi.approveActionItems({
          title: DEFAULT_TODO_TITLE,
          approvedItems,
        });

        const payload = response?.data || {};
        const itemCount = Number(payload?.itemCount || approvedItems.length);
        const widgetId = String(payload?.widget?._id || "");

        updateMessage(messageId, (entry) => ({
          approval: {
            ...(entry.approval || {}),
            status: "approved",
            message: `Saved ${itemCount} item${itemCount === 1 ? "" : "s"} to a To-Do widget${
              widgetId ? ` (${widgetId})` : ""
            }.`,
          },
        }));
      } catch (error) {
        const errorText =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save approved action items.";

        updateMessage(messageId, (entry) => ({
          approval: {
            ...(entry.approval || {}),
            status: "failed",
            message: errorText,
          },
        }));
      }
    },
    [updateMessage],
  );

  const isInputDisabled = useMemo(() => isSending, [isSending]);

  if (!show) return null;

  return (
    <div
      className={`fixed left-1/2 bottom-4 z-[80] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 ${className}`}
    >
      <div className="dp-surface dp-border overflow-hidden rounded-2xl border shadow-xl">
        <div className="max-h-[48vh] space-y-3 overflow-y-auto p-3 dp-chat-scroll">
          {messages.map((entry) => {
            const isUser = entry.role === "user";
            const isError = entry.role === "error";
            const bubbleClass = isUser
              ? "dp-chat-bubble-user"
              : isError
                ? "dp-chat-bubble-error"
                : "dp-chat-bubble-assistant";

            return (
              <div
                key={entry.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[84%] ${bubbleClass}`}
                >
                  {entry.status === "loading" ? (
                    <PendingBubble />
                  ) : (
                    <p className="text-sm leading-6 whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  )}

                  {Array.isArray(entry.suggestions) && entry.suggestions.length ? (
                    <SuggestionsPanel
                      suggestions={entry.suggestions}
                      approval={entry.approval}
                      onToggle={(suggestionId) =>
                        toggleSuggestionSelection(entry.id, suggestionId)
                      }
                      onSelectAll={() => selectAllSuggestions(entry.id, true)}
                      onClearAll={() => selectAllSuggestions(entry.id, false)}
                      onApprove={() => approveSuggestions(entry.id)}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
          <div ref={scrollAnchorRef} />
        </div>

        <div className="border-t dp-border p-2">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={placeholder}
              className="dp-surface dp-text min-h-[44px] w-full resize-none rounded-xl px-4 py-2 text-sm outline-none"
              aria-label="Action item input"
              rows={1}
              disabled={isInputDisabled}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
            />

            <button
              type="submit"
              disabled={isInputDisabled || !message.trim()}
              className="dp-btn-primary inline-flex h-11 min-w-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Extract action items"
              title="Extract action items"
            >
              {isSending ? "..." : "Extract"}
            </button>
          </form>

          <p className="mt-2 text-[11px] dp-text-subtle">
            Tip: Press <span className="font-semibold">Ctrl/Cmd + /</span> to
            focus.
          </p>
        </div>
      </div>
    </div>
  );
}
