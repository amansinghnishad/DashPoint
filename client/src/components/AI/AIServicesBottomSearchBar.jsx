import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

import { useToast } from "../../hooks/useToast";
import { dashPointAIAPI } from "../../services/api";

export default function AIServicesBottomSearchBar({
  className = "",
  show = true,
  placeholder = "Ask DashPoint AI…",
  initialPrompt = "",
  onResponse,
}) {
  const toast = useToast();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show]);

  const canSend = useMemo(() => {
    return !isSending && (prompt || "").trim().length >= 5;
  }, [isSending, prompt]);

  const submit = useCallback(async () => {
    const value = (prompt || "").trim();
    if (!value) return;
    if (value.length < 5) {
      toast.warning("Type at least 5 characters.");
      return;
    }

    try {
      setIsSending(true);
      const res = await dashPointAIAPI.chat(value);
      if (!res?.success) {
        throw new Error(res?.message || "AI request failed");
      }

      const responseText =
        typeof res.data === "string"
          ? res.data
          : res.data?.response || JSON.stringify(res.data);

      setLastResponse(responseText);
      onResponse?.(responseText, res);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "AI request failed";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }, [onResponse, prompt, toast]);

  if (!show) return null;

  return (
    <div
      className={`fixed left-1/2 bottom-4 z-[80] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 ${className}`}
    >
      {lastResponse ? (
        <div className="dp-surface dp-border mb-2 rounded-2xl border p-3 shadow-lg">
          <p className="dp-text-muted text-xs font-semibold">AI response</p>
          <p className="dp-text mt-1 max-h-36 overflow-auto whitespace-pre-wrap text-sm">
            {lastResponse}
          </p>
        </div>
      ) : null}

      <div className="dp-surface dp-border rounded-2xl border shadow-lg">
        <div className="flex items-center gap-2 p-2">
          <input
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (canSend) submit();
              }
            }}
            placeholder={placeholder}
            className="dp-surface dp-text w-full rounded-xl px-4 py-2 text-sm outline-none"
            aria-label="AI prompt"
          />

          <button
            type="button"
            onClick={() => submit()}
            disabled={!canSend}
            className="dp-btn-primary inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors disabled:opacity-60"
            aria-label="Send"
            title="Send"
          >
            {isSending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowUp size={18} />
            )}
          </button>
        </div>

        <div className="px-3 pb-2">
          <p className="dp-text-subtle text-[11px]">
            Tip: Press <span className="font-semibold">Ctrl/⌘ + /</span> to
            focus.
          </p>
          <p className="dp-text-muted mt-1 text-xs italic">
            This is under development right now, so it may not work.
          </p>
        </div>
      </div>
    </div>
  );
}
