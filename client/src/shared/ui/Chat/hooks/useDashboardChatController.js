import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { chatApi } from "../../../../services/modules/chatApi";
import { collectionsAPI } from "../../../../services/modules/collectionsApi";
import useApiRequest from "../../../../shared/hooks/useApiRequest";
import { getCollectionPickerOptions } from "../../../../shared/lib/collections/collectionsResponse";
import { DASHPOINT_COLLECTIONS_CHANGED_EVENT } from "../../../../shared/lib/dashboardEvents";
import { DEFAULT_TOP_K, MODEL_OPTIONS_BY_PROVIDER, isOpenAiModel } from "../chatBar.constants";
import { getStreamStepSize, sanitizeMessageForSubmit } from "../chatBar.utils";

const FALLBACK_DONE_RESPONSE = "Done.";
const FALLBACK_ERROR_RESPONSE = "Unable to complete chat request.";
const OPENAI_COMING_SOON_MESSAGE = "This model is under development. Try using Gemini.";

export default function useDashboardChatController() {
  const [provider, setProvider] = useState("auto");
  const [model, setModel] = useState("auto");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);

  const {
    loading: collectionsLoading,
    error: collectionsError,
    run: runCollectionsRequest,
  } = useApiRequest();

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

  const sanitizedDraftMessage = useMemo(() => sanitizeMessageForSubmit(message), [message]);

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
    const response = await runCollectionsRequest(() => collectionsAPI.getCollections(1, 100, ""), {
      fallbackMessage: "Unable to load collections",
    });
    if (!response) return;
    setCollections(getCollectionPickerOptions(response));
  }, [runCollectionsRequest]);

  const updateMessage = useCallback((id, updates) => {
    setMessages((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
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
        const finalText = String(payload?.response || "").trim() || FALLBACK_DONE_RESPONSE;
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
          error?.response?.data?.message || error?.message || FALLBACK_ERROR_RESPONSE;

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
      latest?.status === "streaming" || latest?.status === "loading" ? "auto" : "smooth";

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
      current.filter((id) => collections.some((collection) => collection.id === id)),
    );
  }, [collections]);

  useEffect(() => stopStreamingAnimation, [stopStreamingAnimation]);

  return {
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
    openAiComingSoonMessage: OPENAI_COMING_SOON_MESSAGE,
  };
}
