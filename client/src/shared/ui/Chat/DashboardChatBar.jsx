import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { collectionsAPI } from "../../../services/modules/collectionsApi";
import { chatApi } from "../../../services/modules/chatApi";
import { DASHPOINT_COLLECTIONS_CHANGED_EVENT } from "../../../shared/lib/dashboardEvents";

const DEFAULT_TOP_K = 3;
const STREAM_STEP_CHARS = 10;
const STREAM_STEP_MS = 24;
const DEFAULT_ACTION_ITEM_MAX_ITEMS = 8;
const DEFAULT_ACTION_ITEM_TITLE = "Action Items";

const CHAT_MODES = [
  { value: "chat", label: "Chat" },
  { value: "action_items", label: "Action Items" },
];

const PROVIDER_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Gemini" },
];

const MODEL_OPTIONS_BY_PROVIDER = {
  auto: [
    { value: "auto", label: "Auto" },
    { value: "gpt-4.1-mini", label: "gpt-4.1-mini" },
    { value: "gemini-2.5-flash", label: "gemini-2.5-flash" },
  ],
  openai: [
    { value: "auto", label: "Auto" },
    { value: "gpt-4.1-mini", label: "gpt-4.1-mini" },
    { value: "gpt-4.1", label: "gpt-4.1" },
    { value: "gpt-4o-mini", label: "gpt-4o-mini" },
  ],
  gemini: [
    { value: "auto", label: "Auto" },
    { value: "gemini-2.5-flash", label: "gemini-2.5-flash" },
    { value: "gemini-1.5-pro", label: "gemini-1.5-pro" },
  ],
};

const OPENAI_MODEL_PREFIXES = ["gpt", "o1", "o3", "o4"];

const isOpenAiModel = (modelName) => {
  const normalized = String(modelName || "").trim().toLowerCase();
  if (!normalized || normalized === "auto") return false;

  return OPENAI_MODEL_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};

const normalizeCollectionsResponse = (response) => {
  const list =
    response?.data?.collections ?? response?.data?.data?.collections ?? [];
  if (!Array.isArray(list)) return [];

  return list
    .map((collection) => {
      const id = String(collection?._id || collection?.id || "").trim();
      if (!id) return null;

      return {
        id,
        name: String(collection?.name || "Untitled").trim() || "Untitled",
      };
    })
    .filter(Boolean);
};

const buildMetaLabel = (meta) => {
  if (!meta) return "";

  const provider = String(meta.provider || "").trim();
  const model = String(meta.model || "").trim();
  const hitCount = Number(meta?.retrieval?.hitCount || 0);

  const parts = [];
  if (provider && model) parts.push(`${provider}/${model}`);
  if (provider && !model) parts.push(provider);
  if (hitCount > 0) parts.push(`${hitCount} context`);

  return parts.join(" | ");
};

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

function MarkdownBubble({ content }) {
  return (
    <div className="dp-markdown text-sm leading-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function PendingBubble({ mode }) {
  return (
    <div className="flex items-center gap-2 text-sm dp-text-muted">
      <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full dp-status-online" />
      <span>{mode === "action_items" ? "Extracting action items..." : "Thinking..."}</span>
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
  placeholder = "Ask anything about your workspace...",
}) {
  const [mode, setMode] = useState("chat");
  const [provider, setProvider] = useState("auto");
  const [model, setModel] = useState("auto");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "assistant-welcome",
      role: "assistant",
      content:
        "Chat is ready. Use Chat mode for workspace Q&A or Action Items mode to extract and approve todos from raw text.",
      status: "done",
      suggestions: null,
      approval: null,
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);

  const streamTimerRef = useRef(null);
  const messageCounterRef = useRef(1);
  const inputRef = useRef(null);
  const scrollAnchorRef = useRef(null);

  const modelOptions = useMemo(() => {
    return MODEL_OPTIONS_BY_PROVIDER[provider] || MODEL_OPTIONS_BY_PROVIDER.auto;
  }, [provider]);

  const loadCollections = useCallback(async () => {
    setCollectionsLoading(true);
    setCollectionsError("");

    try {
      const response = await collectionsAPI.getCollections(1, 100, "");
      setCollections(normalizeCollectionsResponse(response));
    } catch (error) {
      setCollectionsError(
        error?.response?.data?.message || error?.message || "Unable to load collections"
      );
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  const selectedCollectionsLabel = useMemo(() => {
    if (!selectedCollectionIds.length) {
      return "All collections";
    }

    const names = selectedCollectionIds
      .map((id) => collections.find((collection) => collection.id === id)?.name)
      .filter(Boolean);

    if (!names.length) return "Selected collections";
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  }, [collections, selectedCollectionIds]);

  const openAiComingSoon = useMemo(() => {
    if (provider === "openai") {
      return true;
    }

    return isOpenAiModel(model);
  }, [model, provider]);

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

  useEffect(() => {
    if (modelOptions.some((option) => option.value === model)) {
      return;
    }

    setModel("auto");
  }, [model, modelOptions]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    setSelectedCollectionIds((current) =>
      current.filter((id) => collections.some((collection) => collection.id === id))
    );
  }, [collections]);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  const updateMessage = useCallback((id, updater) => {
    setMessages((current) =>
      current.map((entry) => {
        if (entry.id !== id) return entry;
        const patch = typeof updater === "function" ? updater(entry) : updater;
        return { ...entry, ...patch };
      })
    );
  }, []);

  const streamAssistantText = useCallback(
    (messageId, fullText, meta) =>
      new Promise((resolve) => {
        const finalText = String(fullText || "").trim() || "Done.";

        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }

        let cursor = 0;

        const step = () => {
          cursor = Math.min(finalText.length, cursor + STREAM_STEP_CHARS);
          const partial = finalText.slice(0, cursor);

          updateMessage(messageId, {
            role: "assistant",
            content: partial,
            status: cursor >= finalText.length ? "done" : "streaming",
            meta,
          });

          if (cursor >= finalText.length) {
            clearInterval(streamTimerRef.current);
            streamTimerRef.current = null;
            resolve();
          }
        };

        step();
        streamTimerRef.current = setInterval(step, STREAM_STEP_MS);
      }),
    [updateMessage]
  );

  const toggleCollection = useCallback((collectionId) => {
    setSelectedCollectionIds((current) => {
      if (current.includes(collectionId)) {
        return current.filter((id) => id !== collectionId);
      }

      return [...current, collectionId];
    });
  }, []);

  const toggleSuggestionSelection = useCallback(
    (messageId, suggestionId) => {
      updateMessage(messageId, (entry) => ({
        suggestions: (entry.suggestions || []).map((suggestion) =>
          suggestion.id === suggestionId
            ? { ...suggestion, selected: !suggestion.selected }
            : suggestion
        ),
      }));
    },
    [updateMessage]
  );

  const selectAllSuggestions = useCallback(
    (messageId, selected) => {
      updateMessage(messageId, (entry) => ({
        suggestions: (entry.suggestions || []).map((suggestion) => ({
          ...suggestion,
          selected,
        })),
      }));
    },
    [updateMessage]
  );

  const approveSuggestions = useCallback(
    async (messageId) => {
      let approvedItems = [];

      updateMessage(messageId, (entry) => {
        approvedItems = (entry.suggestions || [])
          .filter((suggestion) => suggestion.selected)
          .map((suggestion) => ({
            text: suggestion.text,
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
        const selectedCollectionId =
          selectedCollectionIds.length === 1 ? selectedCollectionIds[0] : undefined;

        const response = await chatApi.approveActionItems({
          title: DEFAULT_ACTION_ITEM_TITLE,
          approvedItems,
          collectionId: selectedCollectionId,
        });

        const payload = response?.data || {};
        const itemCount = Number(payload?.itemCount || approvedItems.length);
        const savedToCollection = Boolean(payload?.collection?._id);

        updateMessage(messageId, (entry) => ({
          approval: {
            ...(entry.approval || {}),
            status: "approved",
            message: savedToCollection
              ? `Saved ${itemCount} items and attached the todo widget to ${payload.collection.name}.`
              : `Saved ${itemCount} items to a new todo widget.`,
          },
        }));

        if (savedToCollection) {
          window.dispatchEvent(
            new CustomEvent(DASHPOINT_COLLECTIONS_CHANGED_EVENT, {
              detail: {
                collectionChanged: true,
                tools: ["approveActionItems"],
              },
            })
          );
          loadCollections();
        }
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
    [loadCollections, selectedCollectionIds, updateMessage]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const trimmed = message.trim();
      if (!trimmed || isSending) return;

      if (mode === "chat" && openAiComingSoon) {
        const userMessageId = nextMessageId();
        const assistantMessageId = nextMessageId();

        setMessages((current) => [
          ...current,
          {
            id: userMessageId,
            role: "user",
            content: trimmed,
            status: "done",
          },
          {
            id: assistantMessageId,
            role: "assistant",
            content: "This model is under development. Try using Gemini.",
            status: "done",
          },
        ]);

        setMessage("");
        return;
      }

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
        if (mode === "action_items") {
          const response = await chatApi.extractActionItems({
            rawText: trimmed,
            maxItems: DEFAULT_ACTION_ITEM_MAX_ITEMS,
            title: DEFAULT_ACTION_ITEM_TITLE,
          });

          const payload = response?.data || {};
          const rawSuggestions = Array.isArray(payload?.suggestions)
            ? payload.suggestions
            : [];

          const suggestions = rawSuggestions
            .map((item, index) => ({
              id: String(item?.id || `suggestion-${index + 1}`),
              text: String(item?.text || "").trim(),
              reason: String(item?.reason || "").trim(),
              priority: String(item?.priority || "").trim().toLowerCase(),
              confidence: typeof item?.confidence === "number" ? item.confidence : null,
              selected: true,
            }))
            .filter((item) => item.text);

          if (!suggestions.length) {
            updateMessage(assistantMessageId, {
              role: "assistant",
              content:
                "No actionable tasks were detected in that text. Try adding more explicit next steps.",
              status: "done",
              suggestions: null,
              approval: null,
              meta: null,
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
            meta: null,
          });
          return;
        }

        const response = await chatApi.sendMessage({
          message: trimmed,
          provider,
          model,
          topK: DEFAULT_TOP_K,
          collectionIds: selectedCollectionIds,
        });

        const payload = response?.data || {};
        const finalText = String(payload?.response || "").trim() || "Done.";
        const collectionChanged = Boolean(payload?.mutations?.collectionChanged);

        if (collectionChanged) {
          window.dispatchEvent(
            new CustomEvent(DASHPOINT_COLLECTIONS_CHANGED_EVENT, {
              detail: payload?.mutations || {},
            })
          );
          loadCollections();
        }

        await streamAssistantText(assistantMessageId, finalText, {
          provider: payload?.provider,
          model: payload?.model,
          mutations: payload?.mutations,
          retrieval: payload?.retrieval,
        });
      } catch (error) {
        const errorText =
          error?.response?.data?.message ||
          error?.message ||
          (mode === "action_items"
            ? "Unable to extract action items right now."
            : "Unable to complete chat request.");

        updateMessage(assistantMessageId, {
          role: "error",
          content: errorText,
          status: "done",
          meta: null,
          suggestions: null,
          approval: null,
        });
      } finally {
        setIsSending(false);
      }
    },
    [
      isSending,
      message,
      mode,
      model,
      nextMessageId,
      openAiComingSoon,
      provider,
      selectedCollectionIds,
      loadCollections,
      streamAssistantText,
      updateMessage,
    ]
  );

  if (!show) return null;

  const inputPlaceholder =
    mode === "action_items"
      ? "Paste notes, meeting transcript, or plain text..."
      : placeholder;
  const submitLabel = mode === "action_items" ? "Extract" : "Send";
  const isSubmitDisabled =
    isSending || !message.trim() || (mode === "chat" && openAiComingSoon);

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
                  className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[82%] ${bubbleClass}`}
                >
                  {entry.status === "loading" ? (
                    <PendingBubble mode={mode} />
                  ) : (
                    <MarkdownBubble content={entry.content} />
                  )}

                  {entry.role === "assistant" && entry.meta ? (
                    <p className="mt-2 text-[11px] dp-text-subtle">
                      {buildMetaLabel(entry.meta)}
                    </p>
                  ) : null}

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
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              className="dp-surface-muted dp-border dp-text rounded-lg border px-2 py-1 text-xs outline-none"
              aria-label="Chat mode"
              disabled={isSending}
            >
              {CHAT_MODES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              className="dp-surface-muted dp-border dp-text rounded-lg border px-2 py-1 text-xs outline-none"
              aria-label="Model provider"
              disabled={isSending || mode !== "chat"}
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
              disabled={isSending || mode !== "chat"}
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

          {mode === "chat" && openAiComingSoon ? (
            <p className="mb-2 rounded-lg border border-amber-300/60 bg-amber-100/60 px-3 py-1.5 text-xs text-amber-900">
              This model is under development. Try using Gemini.
            </p>
          ) : null}

          {mode === "action_items" ? (
            <p className="mb-2 rounded-lg border dp-border dp-surface-muted px-3 py-1.5 text-xs dp-text-muted">
              Action Items mode extracts suggested todos from raw text. If one collection is selected, approved todos are attached to it.
            </p>
          ) : null}

          {collectionPickerOpen ? (
            <div className="mb-2 rounded-xl border dp-border dp-surface-muted p-2">
              {collectionsLoading ? (
                <p className="text-xs dp-text-muted">Loading collections...</p>
              ) : collectionsError ? (
                <p className="text-xs dp-text-danger">{collectionsError}</p>
              ) : !collections.length ? (
                <p className="text-xs dp-text-muted">No collections found.</p>
              ) : (
                <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
                  {collections.map((collection) => {
                    const selected = selectedCollectionIds.includes(collection.id);
                    return (
                      <button
                        key={collection.id}
                        type="button"
                        onClick={() => toggleCollection(collection.id)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          selected
                            ? "dp-btn-primary border-transparent"
                            : "dp-surface dp-border dp-text-muted"
                        }`}
                      >
                        {collection.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={inputPlaceholder}
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
              disabled={isSubmitDisabled}
              className="dp-btn-primary inline-flex h-11 min-w-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={submitLabel}
              title={submitLabel}
            >
              {isSending ? "..." : submitLabel}
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
