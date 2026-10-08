import { memo, useEffect, useRef, useState } from "react";
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
    <div className="flex items-center gap-2.5 py-1 text-sm text-muted" role="status">
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
      </span>
      <span className="text-xs font-medium">Thinking through your request</span>
    </div>
  );
}

function useTypingReveal(content, status) {
  const contentRef = useRef(content || "");
  const revealedLengthRef = useRef(status === "streaming" ? 0 : (content || "").length);
  const frameRef = useRef(0);
  const [visibleContent, setVisibleContent] = useState(
    status === "streaming" ? "" : content || "",
  );

  contentRef.current = content || "";

  useEffect(() => {
    if (status !== "streaming") {
      revealedLengthRef.current = contentRef.current.length;
      setVisibleContent(contentRef.current);
      return undefined;
    }

    let lastTick = 0;
    const reveal = (timestamp) => {
      if (!lastTick || timestamp - lastTick >= 18) {
        lastTick = timestamp;
        const latestContent = contentRef.current;
        const nextLength = Math.min(latestContent.length, revealedLengthRef.current + 2);
        if (nextLength > revealedLengthRef.current) {
          revealedLengthRef.current = nextLength;
          setVisibleContent(latestContent.slice(0, nextLength));
        }
      }

      if (revealedLengthRef.current < contentRef.current.length) {
        frameRef.current = window.requestAnimationFrame(reveal);
      } else {
        frameRef.current = 0;
      }
    };

    const startReveal = () => {
      if (!frameRef.current && revealedLengthRef.current < contentRef.current.length) {
        frameRef.current = window.requestAnimationFrame(reveal);
      }
    };

    const intervalId = window.setInterval(startReveal, 24);
    startReveal();

    return () => {
      window.clearInterval(intervalId);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [status]);

  return visibleContent;
}

function ChatMessageBubble({ entry }) {
  const isUser = entry.role === "user";
  const isError = entry.role === "error";
  const visibleContent = useTypingReveal(entry.content, entry.status);

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
                content={visibleContent}
                isStreaming={entry.status === "streaming"}
                className="text-[color:var(--dp-chat-bubble-assistant-fg)]"
              />
              {entry.status === "streaming" ? (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-primary align-middle" />
              ) : null}
            </div>
          )}

        </article>
      )}
    </div>
  );
}

export default memo(ChatMessageBubble);
