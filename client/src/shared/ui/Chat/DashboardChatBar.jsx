import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { collectionsAPI } from "../../../services/modules/collectionsApi";
import { chatApi } from "../../../services/modules/chatApi";
import { DASHPOINT_COLLECTIONS_CHANGED_EVENT } from "../../../shared/lib/dashboardEvents";

const DEFAULT_TOP_K = 3;
const STREAM_STEP_CHARS = 10;
const STREAM_STEP_MS = 24;

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

function MarkdownBubble({ content }) {
  return (
    <div className="dp-markdown text-sm leading-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function PendingBubble() {
  return (
    <div className="flex items-center gap-2 text-sm dp-text-muted">
      <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full dp-status-online" />
      <span>Thinking...</span>
    </div>
  );
}

export default function DashboardChatBar({
  className = "",
  show = true,
  placeholder = "Ask anything about your workspace...",
}) {
  const [provider, setProvider] = useState("auto");
  const [model, setModel] = useState("auto");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "assistant-welcome",
      role: "assistant",
      content:
        "Chat is ready. You can scope RAG to selected collections, then ask questions or trigger actions.",
      status: "done",
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
    return (
      MODEL_OPTIONS_BY_PROVIDER[provider] || MODEL_OPTIONS_BY_PROVIDER.auto
    );
  }, [provider]);

  const loadCollections = useCallback(async () => {
    setCollectionsLoading(true);
    setCollectionsError("");

    try {
      const response = await collectionsAPI.getCollections(1, 100, "");
      setCollections(normalizeCollectionsResponse(response));
    } catch (error) {
      setCollectionsError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load collections",
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
      current.filter((id) =>
        collections.some((collection) => collection.id === id),
      ),
    );
  }, [collections]);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  const updateMessage = useCallback((id, updates) => {
    setMessages((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry,
      ),
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
    [updateMessage],
  );

  const toggleCollection = useCallback((collectionId) => {
    setSelectedCollectionIds((current) => {
      if (current.includes(collectionId)) {
        return current.filter((id) => id !== collectionId);
      }

      return [...current, collectionId];
    });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const trimmed = message.trim();
      if (!trimmed || isSending) return;

      if (openAiComingSoon) {
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
            content:
              "OpenAI support will be available soon. Please switch to Gemini for now.",
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
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          status: "loading",
        },
      ]);

      setMessage("");
      setIsSending(true);

      try {
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
            }),
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
          "Unable to complete chat request.";

        updateMessage(assistantMessageId, {
          role: "error",
          content: errorText,
          status: "done",
          meta: null,
        });
      } finally {
        setIsSending(false);
      }
    },
    [
      isSending,
      message,
      model,
      nextMessageId,
      provider,
      selectedCollectionIds,
      loadCollections,
      openAiComingSoon,
      streamAssistantText,
      updateMessage,
    ],
  );

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
                  className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[82%] ${bubbleClass}`}
                >
                  {entry.status === "loading" ? (
                    <PendingBubble />
                  ) : (
                    <MarkdownBubble content={entry.content} />
                  )}

                  {entry.role === "assistant" && entry.meta ? (
                    <p className="mt-2 text-[11px] dp-text-subtle">
                      {buildMetaLabel(entry.meta)}
                    </p>
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
              OpenAI will be available soon. Use Gemini for now.
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
                    const selected = selectedCollectionIds.includes(
                      collection.id,
                    );
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
              disabled={isSending || !message.trim() || openAiComingSoon}
              className="dp-btn-primary inline-flex h-11 min-w-11 items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send"
              title="Send"
            >
              {isSending ? "..." : "Send"}
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
