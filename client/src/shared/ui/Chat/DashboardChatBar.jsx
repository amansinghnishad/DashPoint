import ChatInterface from "./ChatInterface";

export default function DashboardChatBar({
  className = "",
  show = true,
  placeholder = "Ask anything about your workspace...",
}) {
  if (!show) return null;

  return (
    <div
      className={`fixed left-1/2 bottom-4 z-[80] w-[calc(100%-2rem)] max-w-[720px] -translate-x-1/2 ${className}`}
    >
      <ChatInterface isFloating={true} placeholder={placeholder} />
    </div>
  );
}
