import { useEffect } from "react";

import { useToast } from "../../../hooks/useToast";

import ChatCommandBar from "./chat/ChatCommandBar";
import ChatFooter from "./chat/ChatFooter";
import ChatInputBar from "./chat/ChatInputBar";
import ChatMessages from "./chat/ChatMessages";
import { useDashpointChat } from "./chat/useDashpointChat";

export default function AIServicesBottomSearchBar({
  className = "",
  show = true,
  placeholder = "Quick command bar...",
  initialPrompt = "",
  onResponse,
  onCommand,
}) {
  const toast = useToast();

  const chat = useDashpointChat({
    initialPrompt,
    placeholder,
    onResponse,
    onCommand,
    toast,
  });

  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        chat.inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chat.inputRef, show]);

  useEffect(() => {
    if (!show) return;
    window.setTimeout(() => chat.inputRef.current?.focus(), 0);
  }, [chat.inputRef, show]);

  if (!show) return null;

  return (
    <div
      className={`fixed left-1/2 bottom-4 z-[80] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 ${className}`}
    >
      {chat.hasMessages ? (
        <ChatMessages messages={chat.messages} scrollRef={chat.scrollRef} />
      ) : null}

      <ChatCommandBar
        commands={chat.slashCommands}
        visibleCommandList={chat.visibleCommandList}
        commandMenuOpen={chat.commandMenuOpen}
        onSelect={chat.selectCommand}
        onToggleMenu={chat.toggleCommandMenu}
      />

      <ChatFooter helperText={chat.helperText} />

      <ChatInputBar
        inputRef={chat.inputRef}
        prompt={chat.prompt}
        setPrompt={chat.setPrompt}
        placeholder={chat.effectivePlaceholder}
        isSending={chat.isSending}
        canSend={chat.canSend}
        hasMessages={chat.hasMessages}
        onSubmit={chat.submit}
        onClear={chat.clearConversation}
        onEscape={chat.closeMenus}
        onFocus={() => {
          const raw = (chat.prompt || "").trimStart();
          if (raw.startsWith("/") && raw.indexOf(" ") === -1) {
            chat.setSlashOpen(true);
          }
        }}
      />
    </div>
  );
}

