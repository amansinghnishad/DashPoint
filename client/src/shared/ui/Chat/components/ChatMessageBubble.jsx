import { memo } from "react";
import { LoaderCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownBubble({ content, isStreaming = false, className = "text-ink" }) {
  if (isStreaming) {
    return (
      <div className={`whitespace-pre-wrap text-sm leading-relaxed break-words ${className}`}>
        {content}
      </div>
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
    <div className="flex items-center gap-2 py-1 text-muted" role="status" aria-live="polite">
      <LoaderCircle size={15} className="animate-spin text-primary" aria-hidden="true" />
      <span className="text-xs font-medium">Thinking…</span>
    </div>
  );
}

function ChatMessageBubble({ entry }) {
  const isUser = entry.role === "user";
  const isError = entry.role === "error";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className="dp-chat-bubble-user max-w-[min(82%,48rem)] rounded-2xl rounded-br-md px-4 py-3 shadow-sm sm:px-5">
          <MarkdownBubble
            content={entry.content}
            className="text-[color:var(--dp-chat-bubble-user-fg)]"
          />
        </div>
      ) : isError ? (
        <div className="dp-chat-bubble-error max-w-3xl rounded-2xl border border-semantic-error/20 px-4 py-3 sm:px-5">
          <MarkdownBubble
            content={entry.content}
            className="text-[color:var(--dp-chat-bubble-error-fg)]"
          />
        </div>
      ) : (
        <article className="dp-chat-bubble-assistant w-full max-w-3xl rounded-2xl border border-hairline/80 p-4 shadow-sm sm:p-6">
          {entry.status === "loading" ? (
            <PendingBubble />
          ) : (
            <div className="text-[15px] leading-7 text-[color:var(--dp-chat-bubble-assistant-fg)]">
              <MarkdownBubble
                content={entry.content}
                isStreaming={entry.status === "streaming"}
                className="text-[color:var(--dp-chat-bubble-assistant-fg)]"
              />
            </div>
          )}

        </article>
      )}
    </div>
  );
}

export default memo(ChatMessageBubble);
