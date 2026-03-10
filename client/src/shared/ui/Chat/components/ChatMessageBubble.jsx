import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { buildMetaLabel } from "../chatBar.utils";

function MarkdownBubble({ content, isStreaming = false }) {
  if (isStreaming) {
    return (
      <div className="whitespace-pre-wrap text-sm leading-6 dp-text break-words">
        {content}
      </div>
    );
  }

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

function ChatMessageBubble({ entry }) {
  const isUser = entry.role === "user";
  const isError = entry.role === "error";
  const bubbleClass = isUser
    ? "dp-chat-bubble-user"
    : isError
      ? "dp-chat-bubble-error"
      : "dp-chat-bubble-assistant";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[82%] ${bubbleClass}`}
      >
        {entry.status === "loading" ? (
          <PendingBubble />
        ) : (
          <MarkdownBubble
            content={entry.content}
            isStreaming={entry.status === "streaming"}
          />
        )}

        {entry.role === "assistant" && entry.meta ? (
          <p className="mt-2 text-[11px] dp-text-subtle">
            {buildMetaLabel(entry.meta)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default memo(ChatMessageBubble);
