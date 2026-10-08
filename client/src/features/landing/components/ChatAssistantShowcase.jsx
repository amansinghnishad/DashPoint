import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import UserCursor from "../../../shared/ui/Cursor/UserCursor";

const SAMPLE_CONVERSATIONS = [
  {
    prompt: "Summarize today's product priorities",
    response: "Here are today's high-priority items based on your calendar and planner:\n\n1. **Q3 Architecture Review** at 2:00 PM\n2. **Review 3 YouTube transcripts** for vector search optimization\n3. **Approve 2 extracted action items** from yesterday's sync",
    meta: { provider: "gemini", model: "gemini-2.0-flash", routing: { tier: "FAST" }, retrieval: { hitCount: 3 } },
  },
  {
    prompt: "Schedule a 45-minute deep focus block",
    response: "Found open slot from **3:30 PM – 4:15 PM** without conflicts. Added **Deep Focus Block** to your Google Calendar and pinned to your Daily Schedule widget.",
    meta: { provider: "gemini", model: "gemini-2.0-flash", routing: { tier: "BALANCED" }, retrieval: { hitCount: 1 } },
  },
];

export default function ChatAssistantShowcase() {
  const [messages, setMessages] = useState([
    {
      id: "m1",
      role: "assistant",
      content: "Hello! I'm DashPoint Intelligence. Ask me anything across your notes, meetings, and planner widgets.",
      meta: { provider: "gemini", model: "gemini-2.0-flash", routing: { tier: "FAST" }, retrieval: { hitCount: 0 } },
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const streamTimerRef = useRef(null);

  useEffect(() => () => window.clearInterval(streamTimerRef.current), []);

  const handleSend = (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg = { id: String(Date.now()), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const match = SAMPLE_CONVERSATIONS.find((c) => c.prompt.toLowerCase() === text.toLowerCase()) || {
      response: `Processed query: "${text}". Retrieved relevant context from your workspace collections and synced actions with 0 latency.`,
      meta: { provider: "gemini", model: "gemini-2.0-flash", routing: { tier: "FAST" }, retrieval: { hitCount: 2 } },
    };

    const assistantId = `${Date.now()}-assistant`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", meta: match.meta, streaming: true },
    ]);

    let index = 0;
    streamTimerRef.current = window.setInterval(() => {
      index += 3;
      const content = match.response.slice(0, index);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? { ...message, content, streaming: index < match.response.length }
            : message,
        ),
      );

      if (index >= match.response.length) {
        window.clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        setIsTyping(false);
      }
    }, 24);
  };

  return (
    <UserCursor
      name="Alex / Lead"
      color="#F99149"
      className="rounded-[26px] border border-hairline/80 bg-surface-card p-2 shadow-[0_24px_70px_rgba(22,18,14,0.12)] transition-shadow duration-500 hover:shadow-[0_28px_80px_rgba(22,18,14,0.16)]"
    >
      <div className="relative flex h-[380px] w-full flex-col overflow-hidden rounded-[20px] bg-canvas text-left sm:h-[420px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,145,73,0.12),transparent_42%)]" />
        <div className="relative flex items-center justify-between border-b border-hairline/70 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-[10px] font-black tracking-tight text-canvas shadow-sm">DP</div>
            <div className="min-w-0">
              <h4 className="truncate text-xs font-bold text-ink">DashPoint Intelligence</h4>
              <p className="mt-0.5 truncate text-[10px] text-muted">Workspace assistant <span className="mx-1.5 text-muted-soft">·</span> Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.08] px-2.5 py-1 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready
          </div>
        </div>

        <div className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4 pr-3 text-xs dp-chat-scroll sm:px-5">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "user" ? (
                  <div className="dp-chat-bubble-user max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2.5 font-medium shadow-sm">
                    {m.content}
                  </div>
                ) : (
                  <div className="dp-chat-bubble-assistant max-w-[94%] rounded-2xl rounded-tl-md border border-hairline/70 p-3.5 shadow-[0_5px_18px_rgba(30,24,18,0.045)] space-y-2">
                    <div className="flex items-center gap-2 select-none">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 text-[8px] font-black tracking-tight text-white">
                        DP
                      </div>
                      <span className="text-xs font-bold text-[color:var(--dp-chat-bubble-assistant-fg)]">
                        DashPoint Intelligence
                      </span>
                    </div>
                    {m.streaming && !m.content ? (
                      <div className="flex items-center gap-2 text-muted select-none">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Thinking...</span>
                      </div>
                    ) : (
                      <div className="dp-markdown text-sm leading-relaxed text-[color:var(--dp-chat-bubble-assistant-fg)]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                        {m.streaming && <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-amber-500 align-middle" />}
                      </div>
                    )}
                    {m.meta && m.meta.retrieval.hitCount > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 select-none">
                        <span className="inline-flex items-center gap-1 rounded-md bg-canvas-soft px-2 py-1 text-[9px] font-medium text-muted">
                          <span className="h-1 w-1 rounded-full bg-amber-500" /> {m.meta.retrieval.hitCount} workspace sources
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping ? <div className="flex items-center gap-2 pl-1 text-[10px] font-medium text-muted"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />Writing a response…</div> : null}
        </div>

        <div className="relative flex items-center gap-2 overflow-x-auto px-4 pb-2.5 select-none no-scrollbar sm:px-5">
          {SAMPLE_CONVERSATIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(s.prompt)}
              className="shrink-0 rounded-full border border-hairline bg-surface-card px-3 py-1.5 text-[9px] font-medium text-muted shadow-sm transition-colors hover:border-amber-500/40 hover:text-ink whitespace-nowrap"
            >
              {s.prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative mx-3 mb-3 flex items-center gap-2 rounded-2xl border border-hairline bg-surface-card px-3 py-2 shadow-sm sm:mx-4 sm:mb-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask DashPoint assistant..."
            className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-xs text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="dp-btn-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <span aria-hidden="true">↑</span>
          </button>
        </form>
      </div>
    </UserCursor>
  );
}
