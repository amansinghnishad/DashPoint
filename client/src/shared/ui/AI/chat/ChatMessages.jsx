import { Bot, Loader2, User } from "@/shared/ui/icons";

export default function ChatMessages({ messages, scrollRef }) {
  return (
    <div className="relative mb-2">
      <div
        ref={scrollRef}
        className="scrollable-area dp-chat-scroll max-h-[46vh] overflow-auto px-1 py-2"
      >
        <div className="space-y-3 px-2">
          {messages.map((m) => {
            const isUser = m.role === "user";
            const bubbleClass = isUser
              ? "dp-chat-bubble-user"
              : m.isError
              ? "dp-chat-bubble-error"
              : "dp-chat-bubble-assistant";

            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser ? (
                  <div className="dp-chat-avatar shrink-0">
                    <Bot size={16} />
                  </div>
                ) : null}

                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${bubbleClass}`}
                >
                  {m.isTyping ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-sm">Thinking…</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {m.content}
                    </p>
                  )}
                </div>

                {isUser ? (
                  <div className="dp-chat-avatar shrink-0">
                    <User size={16} />
                  </div>
                ) : null}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
