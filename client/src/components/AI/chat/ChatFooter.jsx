export default function ChatFooter({ helperText, hasMessages }) {
  return (
    <div className="px-3 pb-2">
      <p className="dp-text-subtle text-[11px]">
        Tip: Press <span className="font-semibold">Ctrl/⌘ + /</span> to focus.
      </p>
      {helperText ? (
        <p className="dp-text-muted mt-1 text-xs italic">{helperText}</p>
      ) : null}
    </div>
  );
}
