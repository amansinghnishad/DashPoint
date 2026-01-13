import { useCallback, useMemo, useRef, useState } from "react";

import { dashPointAIAPI } from "../../../services/api";
import {
  buildEffectivePrompt,
  getCommandSuggestions,
  parseSlashCommand,
  SLASH_COMMANDS,
  validatePrompt,
} from "./chatCommands";

function makeId(suffix) {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${suffix}`;
}

export function useDashpointChat({
  initialPrompt = "",
  placeholder = "Ask DashPoint AI…",
  onResponse,
  onCommand,
  toast,
} = {}) {
  const [prompt, setPromptState] = useState(initialPrompt);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");

  // UI state
  const [slashOpen, setSlashOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const setPrompt = useCallback((nextPrompt) => {
    setPromptState(nextPrompt);

    // If user is actively editing, prefer suggestions over the full command menu.
    setCommandMenuOpen(false);

    const raw = String(nextPrompt || "").trimStart();
    const firstSpace = raw.indexOf(" ");
    if (raw.startsWith("/") && firstSpace === -1) {
      setSlashOpen(true);
    } else {
      setSlashOpen(false);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    window.setTimeout(() => {
      try {
        el.scrollTop = el.scrollHeight;
      } catch {
        // ignore
      }
    }, 0);
  }, []);

  const parsedCommand = useMemo(
    () => parseSlashCommand(prompt, SLASH_COMMANDS),
    [prompt]
  );

  const commandSuggestions = useMemo(
    () => getCommandSuggestions(prompt, SLASH_COMMANDS),
    [prompt]
  );

  const helperText = useMemo(() => {
    if (parsedCommand?.meta && !(parsedCommand?.args || "").trim()) {
      return `Example: ${parsedCommand.meta.example}`;
    }
    if (commandSuggestions.length) {
      return "Tip: Pick a command to target a widget.";
    }
    return "";
  }, [commandSuggestions.length, parsedCommand?.args, parsedCommand?.meta]);

  const effectivePlaceholder = useMemo(() => {
    if (parsedCommand?.meta) return parsedCommand.meta.example;
    return placeholder;
  }, [parsedCommand?.meta, placeholder]);

  const canSend = useMemo(() => {
    if (isSending) return false;
    const effective = buildEffectivePrompt(prompt);
    if (!effective) return false;
    return !validatePrompt(effective);
  }, [isSending, prompt]);

  const visibleCommandList = useMemo(() => {
    if (commandMenuOpen) return SLASH_COMMANDS;
    if (slashOpen) return commandSuggestions;
    return [];
  }, [commandMenuOpen, commandSuggestions, slashOpen]);

  const hasMessages = messages.length > 0;

  const clearConversation = useCallback(() => {
    setMessages([]);
    setPendingAction(null);
    setProposal(null);
  }, []);

  const selectCommand = useCallback(
    (cmdId) => {
      setPrompt(`/${cmdId} `);
      setCommandMenuOpen(false);
      setSlashOpen(false);
      onCommand?.(cmdId);

      window.setTimeout(() => inputRef.current?.focus(), 0);
    },
    [onCommand]
  );

  const closeMenus = useCallback(() => {
    setSlashOpen(false);
    setCommandMenuOpen(false);
  }, []);

  const toggleCommandMenu = useCallback(() => {
    setCommandMenuOpen((v) => !v);
    setSlashOpen(false);
  }, []);

  const submit = useCallback(async () => {
    const effectivePrompt = buildEffectivePrompt(prompt);
    if (!effectivePrompt) {
      if (parsedCommand?.meta && !(parsedCommand?.args || "").trim()) {
        toast?.warning?.(`Add details. Example: ${parsedCommand.meta.example}`);
        return;
      }
      toast?.warning?.("Type at least 5 characters.");
      return;
    }

    const validationError = validatePrompt(effectivePrompt);
    if (validationError) {
      toast?.warning?.(validationError);
      return;
    }

    if (parsedCommand?.meta?.id) {
      onCommand?.(parsedCommand.meta.id);
    }

    const userMsg = {
      id: makeId("u"),
      role: "user",
      content: (prompt || "").trim(),
      ts: Date.now(),
    };

    const assistantMsgId = makeId("a");

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        ts: Date.now(),
        isTyping: true,
      },
    ]);

    setPromptState("");
    setSlashOpen(false);
    setCommandMenuOpen(false);
    scrollToBottom();

    try {
      setIsSending(true);
      setPendingAction(null);
      setProposal(null);
      setLastPrompt((prompt || "").trim());

      const res = await dashPointAIAPI.chat(effectivePrompt);
      if (!res?.success) {
        throw new Error(res?.message || "AI request failed");
      }

      const responseText =
        typeof res.data === "string"
          ? res.data
          : res.data?.response || JSON.stringify(res.data);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: responseText, isTyping: false }
            : m
        )
      );

      if (res.data?.requiresApproval && res.data?.pending_action) {
        const action = res.data.pending_action;

        // Always require explicit user approval before executing any state-changing action.
        // (No auto-apply for scheduling.)
        setPendingAction(action);
      }

      if (res.data?.proposal) {
        setProposal(res.data.proposal);
      }

      onResponse?.(responseText, res);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "AI request failed";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: message, isTyping: false, isError: true }
            : m
        )
      );

      toast?.error?.(message);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  }, [onCommand, onResponse, parsedCommand, prompt, scrollToBottom, toast]);

  const approvePending = useCallback(async () => {
    if (!pendingAction || !lastPrompt) return;

    try {
      setIsSending(true);
      const res = await dashPointAIAPI.chat({
        prompt: lastPrompt,
        approve: true,
        api_call: pendingAction,
      });

      if (!res?.success) {
        throw new Error(res?.message || "AI request failed");
      }

      const responseText =
        typeof res.data === "string"
          ? res.data
          : res.data?.response || JSON.stringify(res.data);

      setMessages((prev) => [
        ...prev,
        {
          id: makeId("a2"),
          role: "assistant",
          content: responseText,
          ts: Date.now(),
        },
      ]);

      setPendingAction(null);
      if (res.data?.proposal) setProposal(res.data.proposal);
      onResponse?.(responseText, res);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "AI request failed";
      toast?.error?.(message);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  }, [lastPrompt, onResponse, pendingAction, scrollToBottom, toast]);

  return {
    // refs
    inputRef,
    scrollRef,

    // state
    prompt,
    setPrompt,
    isSending,
    messages,
    pendingAction,
    setPendingAction,
    proposal,
    setProposal,
    lastPrompt,
    hasMessages,

    // computed
    parsedCommand,
    commandSuggestions,
    helperText,
    effectivePlaceholder,
    canSend,
    visibleCommandList,
    slashCommands: SLASH_COMMANDS,
    slashOpen,
    commandMenuOpen,

    // actions
    submit,
    approvePending,
    clearConversation,
    selectCommand,
    closeMenus,
    toggleCommandMenu,
    setSlashOpen,
    setCommandMenuOpen,
  };
}
