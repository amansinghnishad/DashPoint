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
      className="p-3 sm:p-5 bg-surface-card/90 border border-hairline/80 backdrop-blur-xl shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 hover:border-amber-500/30"
    >
      <div className="flex flex-col h-[380px] sm:h-[420px] w-full text-left">
        {/* Chat Window Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline/60 select-none">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 bg-ink text-canvas rounded-lg flex items-center justify-center text-[10px] font-black tracking-tight">
              DP
            </div>
            <div>
              <h4 className="text-xs font-bold text-ink">DashPoint Intelligence</h4>
              <p className="text-[10px] text-muted">Retrieval-Augmented Chat Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live SSE
          </div>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-xs dp-chat-scroll">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "user" ? (
                  <div className="dp-chat-bubble-user max-w-[85%] rounded-xl px-3.5 py-2 shadow-sm font-medium">
                    {m.content}
                  </div>
                ) : (
                  <div className="dp-chat-bubble-assistant max-w-[90%] rounded-2xl p-3.5 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 select-none">
                      <div className="h-5 w-5 bg-ink text-canvas rounded flex items-center justify-center text-[9px] font-black tracking-tight shrink-0">
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
                    {m.meta && (
                      <div className="flex items-center gap-1.5 pt-1 select-none flex-wrap">
                        <span className="rounded-full bg-canvas border border-hairline px-2 py-0.5 text-[9px] font-bold text-muted uppercase">
                          {m.meta.provider}/{m.meta.model}
                        </span>
                        <span className="rounded-full bg-canvas border border-hairline px-2 py-0.5 text-[9px] font-bold text-amber-500 uppercase">
                          {m.meta.routing.tier}
                        </span>
                        {m.meta.retrieval.hitCount > 0 && (
                          <span className="rounded-full bg-canvas border border-hairline px-2 py-0.5 text-[9px] font-bold text-muted uppercase">
                            {m.meta.retrieval.hitCount} context
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping ? <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Live response stream…</div> : null}
        </div>

        {/* Prompt Suggestions */}
        <div className="flex items-center gap-1.5 pb-2 overflow-x-auto select-none no-scrollbar">
          {SAMPLE_CONVERSATIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(s.prompt)}
              className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-canvas-soft hover:bg-ink hover:text-canvas border border-hairline transition-colors whitespace-nowrap shrink-0"
            >
              ✦ {s.prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-2 border-t border-hairline/60"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask DashPoint assistant..."
            className="flex-1 bg-canvas-soft border border-hairline/80 rounded-xl px-3 py-1.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-amber-500/50"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="dp-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </UserCursor>
  );
}
