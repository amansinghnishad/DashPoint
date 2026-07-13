import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownBubble({ content, isStreaming = false, className = "text-ink" }) {
  if (isStreaming) {
    return (
      <div className={`whitespace-pre-wrap text-sm leading-relaxed break-words ${className}`}>{content}</div>
    );
  }

  return (
    <div className={`dp-markdown text-sm leading-relaxed ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function PendingBubble() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted select-none">
      <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      <span className="font-semibold text-xs uppercase tracking-wider">Thinking...</span>
    </div>
  );
}

const getMetaParts = (meta) => {
  if (!meta) return [];
  const provider = String(meta.provider || "").trim();
  const model = String(meta.model || "").trim();
  const tier = String(meta?.routing?.tier || "").trim();
  const hitCount = Number(meta?.retrieval?.hitCount || 0);

  const parts = [];
  if (provider && model) parts.push(`${provider}/${meta.model}`);
  else if (provider) parts.push(provider);
  if (tier) parts.push(tier);
  if (hitCount > 0) parts.push(`${hitCount} context`);
  return parts;
};

function ChatMessageBubble({ entry }) {
  const isUser = entry.role === "user";
  const isError = entry.role === "error";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        /* User bubble styled as white card pill in mockup */
        <div className="max-w-[85%] rounded-xl border border-hairline bg-surface-card px-4 py-2.5 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <MarkdownBubble content={entry.content} className="text-ink" />
        </div>
      ) : isError ? (
        <div className="max-w-[85%] rounded-2xl border border-red-200/40 bg-red-500/10 px-4 py-3 text-red-950">
          <MarkdownBubble content={entry.content} className="text-red-950" />
        </div>
      ) : (
        /* Assistant bubble with DP logo header */
        <div className="max-w-[85%] rounded-2xl border border-hairline/80 bg-canvas-soft p-5 text-ink shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          {/* DashPoint Intelligence Logo Header */}
          <div className="flex items-center gap-2 mb-3.5 select-none">
            <div className="h-5 w-5 bg-ink text-canvas rounded flex items-center justify-center text-[10px] font-black tracking-tight shrink-0">
              DP
            </div>
            <span className="text-xs font-bold text-ink tracking-tight">DashPoint Intelligence</span>
          </div>

          {entry.status === "loading" ? (
            <PendingBubble />
          ) : (
            <MarkdownBubble
              content={entry.content}
              isStreaming={entry.status === "streaming"}
              className="text-ink"
            />
          )}

          {entry.meta ? (
            <div className="flex items-center gap-1.5 mt-4 select-none flex-wrap">
              {getMetaParts(entry.meta).map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-canvas border border-hairline/60 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-muted uppercase"
                >
                  {p}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default memo(ChatMessageBubble);
