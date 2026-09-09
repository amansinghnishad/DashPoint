import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { chatApi } from "../../../../services/modules/chatApi";
import { collectionsAPI } from "../../../../services/modules/collectionsApi";
import useApiRequest from "../../../../shared/hooks/useApiRequest";
import { getCollectionPickerOptions } from "../../../../shared/lib/collections/collectionsResponse";
import { DASHPOINT_COLLECTIONS_CHANGED_EVENT } from "../../../../shared/lib/dashboardEvents";
import { DEFAULT_TOP_K, MODEL_OPTIONS_BY_PROVIDER, isOpenAiModel } from "../chatBar.constants";
import { sanitizeMessageForSubmit } from "../chatBar.utils";

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

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const {
    loading: collectionsLoading,
    error: collectionsError,
    run: runCollectionsRequest,
  } = useApiRequest();

  const messageCounterRef = useRef(1);
  const inputRef = useRef(null);
  const scrollAnchorRef = useRef(null);
  const abortControllerRef = useRef(null);

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
    return `chat-${Date.now()}-${messageCounterRef.current}`;
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

  const loadSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const res = await chatApi.getSessions();
      if (res?.success) {
        setSessions(res.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const selectSession = useCallback(
    async (sessionId) => {
      if (!sessionId) return;
      try {
        setActiveSessionId(sessionId);
        const res = await chatApi.getSessionMessages(sessionId);
        if (res?.success) {
          const session = res.data?.session;
          const rawMessages = res.data?.messages || [];
          const formatted = rawMessages.map((m) => ({
            id: String(m._id || m.id || nextMessageId()),
            role: m.role,
            content: m.content,
            status: "done",
            meta: m.metadata || null,
          }));
          setMessages(formatted);
          if (session?.provider) setProvider(session.provider);
          if (session?.model) setModel(session.model);
        }
      } catch {
        setMessages([]);
      }
    },
    [nextMessageId],
  );

  const createNewSession = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setMessage("");
    inputRef.current?.focus();
  }, []);

  const renameSession = useCallback(
    async (sessionId, newTitle) => {
      if (!sessionId || !newTitle) return;
      try {
        await chatApi.updateSession(sessionId, { title: newTitle });
        await loadSessions();
      } catch {
        // Ignore
      }
    },
    [loadSessions],
  );

  const deleteSession = useCallback(
    async (sessionId) => {
      if (!sessionId) return;
      try {
        await chatApi.deleteSession(sessionId);
        await loadSessions();
        if (activeSessionId === sessionId) {
          createNewSession();
        }
      } catch {
        // Ignore
      }
    },
    [activeSessionId, createNewSession, loadSessions],
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

      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        try {
          const createRes = await chatApi.createSession({
            title:
              sanitizedMessage.length > 40
                ? `${sanitizedMessage.slice(0, 40).trim()}...`
                : sanitizedMessage,
            provider,
            model,
          });
          if (createRes?.success && createRes.data?._id) {
            currentSessionId = String(createRes.data._id);
            setActiveSessionId(currentSessionId);
          }
        } catch {
          // Continue without blocking chat
        }
      }

      let accumulatedText = "";
      let responseMeta = null;

      try {
        abortControllerRef.current = new AbortController();

        await chatApi.streamChat({
          payload: {
            message: sanitizedMessage,
            sessionId: currentSessionId,
            provider,
            model,
            topK: DEFAULT_TOP_K,
            collectionIds: selectedCollectionIds,
          },
          signal: abortControllerRef.current.signal,
          onMetadata: (metadata) => {
            responseMeta = metadata;
            updateMessage(assistantMessageId, {
              meta: metadata,
              status: "streaming",
            });
          },
          onDelta: (chunk) => {
            accumulatedText += chunk;
            updateMessage(assistantMessageId, {
              content: accumulatedText,
              status: "streaming",
              meta: responseMeta,
            });
          },
          onDone: (donePayload) => {
            const finalText = donePayload.response || accumulatedText || FALLBACK_DONE_RESPONSE;
            const collectionChanged = Boolean(donePayload?.mutations?.collectionChanged);

            if (collectionChanged) {
              window.dispatchEvent(
                new CustomEvent(DASHPOINT_COLLECTIONS_CHANGED_EVENT, {
                  detail: donePayload?.mutations || {},
                }),
              );
              loadCollections();
            }

            updateMessage(assistantMessageId, {
              content: finalText,
              status: "done",
              meta: {
                provider: donePayload.provider,
                model: donePayload.model,
                routing: donePayload.routing,
                mutations: donePayload.mutations,
                retrieval: donePayload.retrieval,
              },
            });

            loadSessions();
          },
          onError: (err) => {
            const errorText = err?.message || FALLBACK_ERROR_RESPONSE;
            updateMessage(assistantMessageId, {
              role: "error",
              content: errorText,
              status: "done",
              meta: null,
            });
          },
        });
      } catch (error) {
        if (error?.name !== "AbortError") {
          const errorText =
            error?.response?.data?.message || error?.message || FALLBACK_ERROR_RESPONSE;

          updateMessage(assistantMessageId, {
            role: "error",
            content: errorText,
            status: "done",
            meta: null,
          });
        }
      } finally {
        setIsSending(false);
      }
    },
    [
      activeSessionId,
      isSending,
      loadCollections,
      loadSessions,
      message,
      model,
      nextMessageId,
      openAiComingSoon,
      provider,
      selectedCollectionIds,
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
    loadSessions();
  }, [loadCollections, loadSessions]);

  useEffect(() => {
    setSelectedCollectionIds((current) =>
      current.filter((id) => collections.some((collection) => collection.id === id)),
    );
  }, [collections]);

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
    sessions,
    activeSessionId,
    historyDrawerOpen,
    setHistoryDrawerOpen,
    sessionsLoading,
    selectSession,
    createNewSession,
    renameSession,
    deleteSession,
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
