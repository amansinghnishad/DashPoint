import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { collectionsAPI } from "../../../services/modules/collectionsApi";
import { chatApi } from "../../../services/modules/chatApi";
import { DASHPOINT_COLLECTIONS_CHANGED_EVENT } from "../../../shared/lib/dashboardEvents";
import ChatCollectionPicker from "./components/ChatCollectionPicker";
import ChatMessageBubble from "./components/ChatMessageBubble";
import {
  DEFAULT_TOP_K,
  MODEL_OPTIONS_BY_PROVIDER,
  PROVIDER_OPTIONS,
  isOpenAiModel,
} from "./chatBar.constants";
import {
  getStreamStepSize,
  normalizeCollectionsResponse,
  sanitizeMessageForSubmit,
} from "./chatBar.utils";

const FALLBACK_DONE_RESPONSE = "Done.";
const FALLBACK_ERROR_RESPONSE = "Unable to complete chat request.";
const OPENAI_COMING_SOON_MESSAGE =
  "This model is under development. Try using Gemini.";

export default function DashboardChatBar({
  className = "",
  show = true,
  placeholder = "Ask anything about your workspace...",
}) {
  const [provider, setProvider] = useState("auto");
  const [model, setModel] = useState("auto");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);

  const streamFrameRef = useRef(null);
  const messageCounterRef = useRef(1);
  const inputRef = useRef(null);
  const scrollAnchorRef = useRef(null);

  const modelOptions = useMemo(
    () => MODEL_OPTIONS_BY_PROVIDER[provider] || MODEL_OPTIONS_BY_PROVIDER.auto,
    [provider],
  );

  const openAiComingSoon = useMemo(
    () => provider === "openai" || isOpenAiModel(model),
    [model, provider],
  );

  const sanitizedDraftMessage = useMemo(
    () => sanitizeMessageForSubmit(message),
    [message],
  );

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

  const nextMessageId = useCallback(() => {
    messageCounterRef.current += 1;
    return `chat-${messageCounterRef.current}`;
  }, []);

  const scrollToBottom = useCallback((behavior = "auto") => {
    if (!scrollAnchorRef.current) return;
    scrollAnchorRef.current.scrollIntoView({
      behavior,
      block: "end",
    });
  }, []);

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

  const updateMessage = useCallback((id, updates) => {
    setMessages((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry,
      ),
    );
  }, []);

  const stopStreamingAnimation = useCallback(() => {
    if (!streamFrameRef.current) return;
    cancelAnimationFrame(streamFrameRef.current);
    streamFrameRef.current = null;
  }, []);

  const streamAssistantText = useCallback(
    (messageId, fullText, meta) =>
      new Promise((resolve) => {
        const finalText = String(fullText || "").trim() || FALLBACK_DONE_RESPONSE;

        stopStreamingAnimation();

        if (finalText.length <= 140) {
          updateMessage(messageId, {
            role: "assistant",
            content: finalText,
            status: "done",
            meta,
          });
          resolve();
          return;
        }

        const stepSize = getStreamStepSize(finalText.length);
        let cursor = 0;

        const step = () => {
          cursor = Math.min(finalText.length, cursor + stepSize);
          const isComplete = cursor >= finalText.length;

          updateMessage(messageId, {
            role: "assistant",
            content: finalText.slice(0, cursor),
            status: isComplete ? "done" : "streaming",
            meta,
          });

          if (isComplete) {
            streamFrameRef.current = null;
            resolve();
            return;
          }

          streamFrameRef.current = requestAnimationFrame(step);
        };

        streamFrameRef.current = requestAnimationFrame(step);
      }),
    [stopStreamingAnimation, updateMessage],
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

      const sanitizedMessage = sanitizeMessageForSubmit(message);
      if (!sanitizedMessage || isSending) return;

      const userMessageId = nextMessageId();
      const assistantMessageId = nextMessageId();

      if (openAiComingSoon) {
        setMessages((current) => [
          ...current,
          {
            id: userMessageId,
            role: "user",
            content: sanitizedMessage,
            status: "done",
          },
          {
            id: assistantMessageId,
            role: "assistant",
            content: OPENAI_COMING_SOON_MESSAGE,
            status: "done",
          },
        ]);

        setMessage("");
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: userMessageId,
          role: "user",
          content: sanitizedMessage,
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
          message: sanitizedMessage,
          provider,
          model,
          topK: DEFAULT_TOP_K,
          collectionIds: selectedCollectionIds,
        });

        const payload = response?.data || {};
        const finalText =
          String(payload?.response || "").trim() || FALLBACK_DONE_RESPONSE;
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
          FALLBACK_ERROR_RESPONSE;

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
      loadCollections,
      message,
      model,
      nextMessageId,
      openAiComingSoon,
      provider,
      selectedCollectionIds,
      streamAssistantText,
      updateMessage,
    ],
  );

  useEffect(() => {
    const latest = messages[messages.length - 1];
    const behavior =
      latest?.status === "streaming" || latest?.status === "loading"
        ? "auto"
        : "smooth";

    scrollToBottom(behavior);
  }, [messages, scrollToBottom]);

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

  useEffect(() => stopStreamingAnimation, [stopStreamingAnimation]);

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
              {OPENAI_COMING_SOON_MESSAGE}
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
            Tip: Press <span className="font-semibold">Ctrl/Cmd + /</span> to
            focus.
          </p>
        </div>
      </div>
    </div>
  );
}
